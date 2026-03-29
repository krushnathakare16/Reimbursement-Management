import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        
        const rule = await prisma.approvalRule.findFirst({ 
            where: { companyId: session.user.companyId } 
        });
        
        return NextResponse.json({ success: true, rule });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        
        const { sequence } = await req.json();

        const existing = await prisma.approvalRule.findFirst({ 
            where: { companyId: session.user.companyId } 
        });
        
        if (existing) {
            await prisma.approvalRule.update({
               where: { id: existing.id },
               data: { configJson: JSON.stringify({ sequence }) }
            });
        } else {
            await prisma.approvalRule.create({
               data: {
                  companyId: session.user.companyId,
                  name: "Global Master Sequence",
                  configJson: JSON.stringify({ sequence })
               }
            });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
