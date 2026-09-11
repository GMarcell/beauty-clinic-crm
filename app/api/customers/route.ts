import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  const body = await request.json();
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return NextResponse.json({ error: "Clinic not configured" }, { status: 500 });
  const customer = await prisma.customer.create({ data: { clinicId: clinic.id, name: body.name, phone: body.phone, notes: body.notes } });
  return NextResponse.json(customer, { status: 201 });
}
