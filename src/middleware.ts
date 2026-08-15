import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect everything except public client portals, auth API, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|intake|checkin|plan).*)"],
};
