import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as { customMessage?: unknown };

  if (typeof body.customMessage !== "string") {
    return NextResponse.json({ error: "customMessage (string) is required" }, { status: 400 });
  }
  if (body.customMessage.length > 2000) {
    return NextResponse.json({ error: "customMessage must be 2000 characters or fewer" }, { status: 400 });
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: { customMessage: body.customMessage },
  });
  return NextResponse.json(customer);
}
