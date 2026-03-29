import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, currency: submitCurrency, category, description, date, receiptUrl, ocrRawText } = await req.json();

    const companyId = session.user.companyId;
    const baseCurrency = session.user.companyCurrency; // The Company's default
    
    const parsedAmount = parseFloat(amount.toString().replace(/[^0-9.]/g, ''));
    if (isNaN(parsedAmount)) {
       return NextResponse.json({ error: 'Invalid amount formatting' }, { status: 400 });
    }
    
    const expenseCurrency = submitCurrency || baseCurrency;
    let finalConvertedAmount = parsedAmount;

    // Dynamically fetch and calculate live exchange rate against the Company's default
    if (expenseCurrency !== baseCurrency) {
      try {
        const exRes = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
        if (exRes.ok) {
           const exData = await exRes.json();
           const foreignRate = exData.rates[expenseCurrency];
           if (foreignRate) {
              // Divides foreign amount by exchange rate map to return to Company Base
              finalConvertedAmount = parsedAmount / foreignRate;
           }
        }
      } catch (err) {
        console.warn("Forex API error...", err);
      }
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parsedAmount,
        currency: expenseCurrency, 
        convertedAmount: parseFloat(finalConvertedAmount.toFixed(2)),
        category,
        description,
        date: new Date(date || new Date()),
        receiptUrl: receiptUrl || null,
        ocrRawText: ocrRawText || null,
        submitterId: session.user.id,
        companyId: companyId,
        status: "PENDING"
      }
    });

    // 🌟 RECURSIVE LINEAGE WORKFLOW ENGINE (Step 1 Initialization)
    const employeeNode = await prisma.user.findUnique({ where: { id: session.user.id } });
    const directManagerId = employeeNode?.managerId;

    if (directManagerId) {
       // Send the ticket directly to the assigned Boss
       await prisma.approvalRequest.create({
          data: {
             expenseId: expense.id,
             approverId: directManagerId,
             stepLevel: 1, 
             status: 'PENDING'
          }
       });
       
       // Update Master Status to dynamically reflect the precise level it's trapped at in the UI
       const bossInfo = await prisma.user.findUnique({ where: { id: directManagerId }});
       await prisma.expense.update({ 
           where: { id: expense.id }, 
           data: { status: `Pending at ${bossInfo?.role} level` } 
       });
    } else {
       // If no management chain is specified for this user globally, it auto-approves
       await prisma.expense.update({ where: { id: expense.id }, data: { status: 'APPROVED' } });
    }

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const expenses = await prisma.expense.findMany({
      where: { submitterId: session.user.id },
      include: {
        approvalRequests: {
          where: { comments: { not: null } },
          select: { 
             comments: true, 
             approver: { select: { name: true, role: true } } 
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, expenses });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
