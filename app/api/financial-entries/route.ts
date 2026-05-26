import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();

  const type = String(body.type ?? "");
  const description = String(body.description ?? "").trim();
  const amount = Number(body.amount);
  const date = String(body.date ?? "");
  const scope = String(body.scope ?? "");
  const barberId = body.barberId ? String(body.barberId) : null;

  if (!["income", "expense"].includes(type)) {
    return NextResponse.json(
      { success: false, message: "Tipo de lançamento inválido." },
      { status: 400 }
    );
  }

  if (!description) {
    return NextResponse.json(
      { success: false, message: "Descrição é obrigatória." },
      { status: 400 }
    );
  }

  if (amount <= 0) {
    return NextResponse.json(
      { success: false, message: "Valor precisa ser maior que zero." },
      { status: 400 }
    );
  }

  if (!date) {
    return NextResponse.json(
      { success: false, message: "Data é obrigatória." },
      { status: 400 }
    );
  }

  if (!["all", "barber"].includes(scope)) {
    return NextResponse.json(
      { success: false, message: "Escopo inválido." },
      { status: 400 }
    );
  }

  if (scope === "barber" && !barberId) {
    return NextResponse.json(
      { success: false, message: "Selecione um barbeiro." },
      { status: 400 }
    );
  }

  const id = `financial-${randomUUID()}`;

  await db.query(
    `
    INSERT INTO "FinancialEntry"
    ("id", "type", "description", "amount", "date", "scope", "barberId")
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [id, type, description, amount, date, scope, barberId]
  );

  return NextResponse.json({
    success: true,
    message: "Lançamento salvo no banco.",
    id,
  });
}
