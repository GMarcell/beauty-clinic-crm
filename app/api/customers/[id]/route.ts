import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const customMessage = (body as { customMessage?: unknown } | null)?.customMessage;
  if (typeof customMessage !== "string") {
    return NextResponse.json({ error: "customMessage (string) is required" }, { status: 400 });
  }
  if (customMessage.length > 2000) {
    return NextResponse.json({ error: "customMessage must be 2000 characters or fewer" }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: { customMessage },
    });
    return NextResponse.json(customer);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error(`PATCH /api/customers/${id}: database unavailable`, error);
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }
    console.error(`PATCH /api/customers/${id}: update failed`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
