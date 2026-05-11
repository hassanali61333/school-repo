import { db } from "@/lib/firebaseAdmin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    let { email, password } = body;

    email = email?.trim().toLowerCase();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    // find user
    const userSnap = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userSnap.empty) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const userDoc = userSnap.docs[0];
    const user = userDoc.data();

    // check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    // user object
    const myUser = {
      id: userDoc.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // response
    const res = NextResponse.json(
      {
        message: "Login successful",
        user: myUser,
      },
      { status: 200 }
    );

    // 🔐 set role cookie
    res.cookies.set("role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;

  } catch (err) {
    return NextResponse.json(
      {
        message: "Server error",
        error: err.message,
      },
      { status: 500 }
    );
  }
}