import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const appointments = await prisma.appointment.findMany({ include: { customer: true, package: { include: { service: true } } }, orderBy: { scheduledAt: "asc" } });
  return NextResponse.json(appointments);
}
