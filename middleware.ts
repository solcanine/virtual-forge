import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "vf_voter";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (!request.cookies.get(COOKIE)?.value) {
    response.cookies.set(COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
    });
  }
  return response;
}

export const config = {
  matcher: ["/", "/submit", "/agent", "/launch/:path*"],
};
