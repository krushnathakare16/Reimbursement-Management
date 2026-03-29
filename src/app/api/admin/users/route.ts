import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    // Fetch all users inside this specific company, bringing in their Manager's info for the UI
    const users = await prisma.user.findMany({
      where: { companyId: session.user.companyId },
      include: {
        manager: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Explicit security check
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only Admins can establish user roles.' }, { status: 401 });
    }

    const { email, password, name, role, managerId } = await req.json();

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password, // Not hashing for hackathon speed (assuming simple auth in pages)
        name,
        role,
        managerId: managerId || null,
        companyId: session.user.companyId
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    
    // Dynamic Node Linker: Employee -> Manager -> Finance -> CFO
    const { userId, managerId } = await req.json();
    
    if (userId === managerId) return NextResponse.json({ error: 'Cannot self-assign' }, { status: 400 });

    const user = await prisma.user.update({
      where: { id: userId, companyId: session.user.companyId },
      data: { managerId: managerId || null }
    });
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
