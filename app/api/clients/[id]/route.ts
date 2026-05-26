import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const notes = String(body.notes ?? "").trim() || null;

  if (!name || !phone) {
    return NextResponse.json(
      { success: false, message: "Nome e telefone são obrigatórios." },
      { status: 400 }
    );
  }

  await db.query(
    'UPDATE "Client" SET "name" = $1, "phone" = $2, "notes" = $3 WHERE "id" = $4',
    [name, phone, notes, id]
  );

  return NextResponse.json({
    success: true,
    message: "Cliente atualizado no banco.",
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const activeAppointments = await db.query(
    'SELECT "id" FROM "Appointment" WHERE "clientId" = $1 AND "status" NOT IN ($2, $3) LIMIT 1',
    [id, "cancelled", "completed"]
  );

  if (activeAppointments.rows.length > 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Não é possível remover: este cliente possui agendamentos ativos.",
      },
      { status: 400 }
    );
  }

  await db.query('DELETE FROM "Appointment" WHERE "clientId" = $1', [id]);
  await db.query('DELETE FROM "Client" WHERE "id" = $1', [id]);

  return NextResponse.json({
    success: true,
    message: "Cliente removido do banco.",
  });
}
