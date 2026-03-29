import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password, companyName, baseCurrency } = await req.json();

    if (!email || !password || !companyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Use a Prisma transaction to ensure both Company and Admin User are generated atomically
    const newAdmin = await prisma.$transaction(async (tx: any) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          baseCurrency: baseCurrency || 'USD',
        }
      });

      const user = await tx.user.create({
        data: {
          email,
          password, 
          role: 'ADMIN',
          companyId: company.id,
        }
      });
      return user;
    });

    return NextResponse.json({ success: true, user: { id: newAdmin.id, email: newAdmin.email } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
