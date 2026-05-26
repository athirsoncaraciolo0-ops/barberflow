import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(request: Request) {
  const body = await request.json();

  const productName = String(body.productName ?? "BarberFlow").trim();
  const businessName = String(body.businessName ?? "").trim();
  const slogan = String(body.slogan ?? "").trim();
  const whatsapp = String(body.whatsapp ?? "").trim();
  const initials = String(body.initials ?? "BF").trim().toUpperCase();
  const themePresetId = String(body.themePresetId ?? "luxury-gold").trim();
  const primaryColor = String(body.primaryColor ?? "#d4af37").trim();
  const backgroundColor = String(body.backgroundColor ?? "#070707").trim();
  const foregroundColor = String(body.foregroundColor ?? "#f8f5ed").trim();

  if (!businessName) {
    return NextResponse.json(
      { success: false, message: "Nome da barbearia é obrigatório." },
      { status: 400 }
    );
  }

  await db.query(
    `
    INSERT INTO "BusinessSettings"
    ("id", "productName", "businessName", "slogan", "whatsapp", "initials", "themePresetId", "primaryColor", "backgroundColor", "foregroundColor")
    VALUES ('business-1', $1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT ("id") DO UPDATE SET
      "productName" = EXCLUDED."productName",
      "businessName" = EXCLUDED."businessName",
      "slogan" = EXCLUDED."slogan",
      "whatsapp" = EXCLUDED."whatsapp",
      "initials" = EXCLUDED."initials",
      "themePresetId" = EXCLUDED."themePresetId",
      "primaryColor" = EXCLUDED."primaryColor",
      "backgroundColor" = EXCLUDED."backgroundColor",
      "foregroundColor" = EXCLUDED."foregroundColor",
      "updatedAt" = CURRENT_TIMESTAMP
    `,
    [
      productName,
      businessName,
      slogan,
      whatsapp,
      initials,
      themePresetId,
      primaryColor,
      backgroundColor,
      foregroundColor,
    ]
  );

  return NextResponse.json({
    success: true,
    message: "Configurações salvas no banco.",
  });
}
