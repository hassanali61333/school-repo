
import { NextResponse } from "next/server";

export async function middleware(request) {

const role =request.cookies.get("role")?.value;
console.log("Role from cookie:", role);
const path= request.nextUrl.pathname;

  if (!role) {
return NextResponse.redirect(new URL("/login", request.url));
  
  }

  if (path.startsWith("/superAdmin") && role !== "admin")
  {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  if (path.startsWith("/schoolhead") && role !== "head") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  
  return NextResponse.next(); 

}
export const config = {
  matcher: ["/superAdmin/:path*", "/schoolhead/:path*"],
};