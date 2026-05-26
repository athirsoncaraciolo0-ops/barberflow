import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [
    business,
    barbers,
    clients,
    services,
    appointments,
    financialEntries,
  ] = await Promise.all([
    db.query('SELECT * FROM "BusinessSettings" LIMIT 1'),
    db.query('SELECT * FROM "Barber" ORDER BY "createdAt" ASC'),
    db.query('SELECT * FROM "Client" ORDER BY "createdAt" ASC'),
    db.query('SELECT * FROM "Service" ORDER BY "createdAt" ASC'),
    db.query('SELECT * FROM "Appointment" ORDER BY "date" ASC, "time" ASC'),
    db.query('SELECT * FROM "FinancialEntry" ORDER BY "createdAt" ASC'),
  ]);

  return NextResponse.json({
    businessSettings: business.rows[0] ?? null,
    barbers: barbers.rows,
    clients: clients.rows,
    services: services.rows,
    appointments: appointments.rows,
    financialEntries: financialEntries.rows,
  });
}
