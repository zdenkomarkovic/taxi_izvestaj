import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Javne rute (dostupne svima)
  const publicRoutes = ["/sign-in", "/sign-up"];

  // Proveri da li je ruta javna
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Ako korisnik nije autentifikovan i pokušava da pristupi zaštićenoj ruti
  if (!isAuthenticated && !isPublicRoute && pathname !== "/") {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Ako je korisnik autentifikovan i pokušava da pristupi login stranici
  if (isAuthenticated && pathname === "/sign-in") {
    const homeUrl = new URL("/", req.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
