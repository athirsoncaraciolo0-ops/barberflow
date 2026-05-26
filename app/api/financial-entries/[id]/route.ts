import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await db.query('DELETE FROM "FinancialEntry" WHERE "id" = $1', [id]);

  return NextResponse.json({
    success: true,
    message: "Lançamento removido do banco.",
  });
}
