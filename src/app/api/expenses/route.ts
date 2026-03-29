import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, category, description, date, receiptUrl, ocrRawText } = await req.json();

    const companyId = session.user.companyId;
    const currency = session.user.companyCurrency;
    
    // Clean string amounts (e.g., "$120.50" to 120.50 float)
    const parsedAmount = parseFloat(amount.toString().replace(/[^0-9.]/g, ''));
    if (isNaN(parsedAmount)) {
       return NextResponse.json({ error: 'Invalid amount formatting' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parsedAmount,
        currency: currency, 
        convertedAmount: parsedAmount, // Keeping exactly 1-to-1 based on base currency for the MVP
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

    // Instantly provide all expenses the specific authenticated employee submitted
    const expenses = await prisma.expense.findMany({
      where: { submitterId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, expenses });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
