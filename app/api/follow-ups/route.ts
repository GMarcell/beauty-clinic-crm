import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customers = await prisma.customer.findMany({ include: { packages: { include: { service: true, treatments: true, appointments: true } } } });
  const now = new Date();
  const result = customers.flatMap((customer) => customer.packages.filter((pkg) => pkg.totalSessions - pkg.treatments.length > 0 && !pkg.appointments.some((a) => a.scheduledAt > now && a.status !== "CANCELLED")).map((pkg) => ({ customer: { id: customer.id, name: customer.name, phone: customer.phone }, package: { id: pkg.id, name: pkg.service.name, remainingSessions: pkg.totalSessions - pkg.treatments.length }, reason: "NO_NEXT_APPOINTMENT" })));
  return NextResponse.json(result);
}
