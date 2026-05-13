import admin, { db } from "@/lib/firebaseAdmin";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
export async function POST(req) {
  try {
    const body = await req.json();
    let { email, password } = body;

    // basic validation
    email = email?.trim().toLowerCase();

    if (!email || !password) {
      return Response.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    // find user by email
    const userSnap = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userSnap.empty) {
      return Response.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const userDoc = userSnap.docs[0];
    const user = userDoc.data();

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return Response.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
      cookieStore.set("role", user.role, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
});
    
    // success response



    return Response.json({
      message: "Login successful",
      user: {
        id: userDoc.id,
        name: user.name,
        email: user.email,
         schoolId: user.schoolId || null,
    schoolName: user.schoolName || null,
    adminId: user.adminId || null,
        role: user.role,
      },
    });



    
  } catch (err) {
    return Response.json(
      {
        message: "Server error",
        error: err.message,
      },
      { status: 500 }
    );
  }
}