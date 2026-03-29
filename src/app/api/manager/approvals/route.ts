import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch all pending requests assigned specifically to this Manager
    const requests = await prisma.approvalRequest.findMany({
      where: { 
        approverId: session.user.id,
        status: "PENDING" 
      },
      include: {
        expense: {
          include: { submitter: { select: { name: true, email: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { requestId, action, comments } = await req.json(); // action is 'APPROVED' or 'REJECTED'

    const approvalReq = await prisma.approvalRequest.findUnique({ where: { id: requestId } });
    if (!approvalReq || approvalReq.approverId !== session.user.id) {
      return NextResponse.json({ error: 'Invalid Request or Unauthorized' }, { status: 400 });
    }

    // 1. Log the specific individual's vote in the system
    await prisma.approvalRequest.update({
      where: { id: requestId },
      data: { status: action, comments }
    });

    // 2. 🌟 THE SEQUENTIAL STATE MACHINE & HYBRID EVALUATOR 🌟 //
    // Fetch all requests strictly tied to the CURRENT active sequential Step Level!
    const stepRequests = await prisma.approvalRequest.findMany({ 
       where: { expenseId: approvalReq.expenseId, stepLevel: approvalReq.stepLevel } 
    });

    // RULE A: Specific Approver Override (The "CFO" rule)
    if (action === 'APPROVED' && (session.user.role === 'ADMIN' || session.user.role === 'CFO')) {
        await prisma.expense.update({ where: { id: approvalReq.expenseId }, data: { status: 'APPROVED' } });
        return NextResponse.json({ success: true, message: 'CFO_OVERRIDE_APPLIED' });
    }

    // RULE B: Strict Rejection Halt
    if (action === 'REJECTED') {
        // If formally rejected at ANY step in the sequence, instantly halt and deny the master expense
        await prisma.expense.update({ where: { id: approvalReq.expenseId }, data: { status: 'REJECTED' } });
        return NextResponse.json({ success: true, message: 'EXPENSE_REJECTED_AT_SEQUENCE' });
    }

    // RULE C: Percentage Rule Evaluator (for the active Step Sequence)
    const approvedCount = stepRequests.filter(r => r.status === 'APPROVED').length;
    const approvalPercentage = approvedCount / stepRequests.length; 

    // If a Single Manager (1/1) = 100%. If a Finance Committee (3/5) = 60%. Both physically pass the check!
    if (approvalPercentage >= 0.60 || stepRequests.length === 1) { 
        
        // 🔥 DYNAMIC RECURSIVE CHAIN GENERATOR 🔥 
        // We find the physical node who just cast the winning vote
        const currentApprover = await prisma.user.findUnique({ where: { id: session.user.id } });

        if (currentApprover?.managerId) {
             // The system dynamically detects that this Approver has a Boss assigned above them!
             // We forward the ticket structurally UP the specific chain sequence.
             await prisma.approvalRequest.create({
                 data: {
                     expenseId: approvalReq.expenseId,
                     approverId: currentApprover.managerId,
                     stepLevel: approvalReq.stepLevel + 1,
                     status: 'PENDING'
                 }
             });
             
             // Update the Employee's status text physically to reflect exactly where the ticket jumped!
             const nextBoss = await prisma.user.findUnique({ where: { id: currentApprover.managerId }});
             const roleName = nextBoss?.role || 'Management';
             await prisma.expense.update({ 
                 where: { id: approvalReq.expenseId }, 
                 data: { status: `Forwarded to ${roleName}` } 
             });
        } 
        else {
             // No further bosses exist above this node! The chain is officially complete!
             await prisma.expense.update({ where: { id: approvalReq.expenseId }, data: { status: 'APPROVED' } });
        }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
