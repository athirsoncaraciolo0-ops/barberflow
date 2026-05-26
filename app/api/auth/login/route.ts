import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_USER = "Admin";
const ADMIN_PASSWORD = "2026";

export async function POST(request: Request) {
  const body = await request.json();

  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "").trim();

  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { success: false, message: "Usuário ou senha inválidos." },
      { status: 401 }
    );
  }

  const cookieStore = await cookies();

  cookieStore.set("barberflow_session", "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({
    success: true,
    message: "Login realizado com sucesso.",
  });
}
