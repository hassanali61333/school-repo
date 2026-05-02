import { db } from "@/lib/firebaseAdmin";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    let { name, email, phone, password } = body;

 
    name = name?.trim();
    email = email?.trim().toLowerCase();
    phone = phone?.replace(/\D/g, "");

    if (!name || !email || !phone || !password) {
      return Response.json(
        { message: "Please fill all fields" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!/^\d{7,15}$/.test(phone)) {
      return Response.json(
        { message: "Invalid phone number" },
        { status: 400 }
      );
    }

    const existingSnap = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      return Response.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

  
    const id = `id-${Date.now()}`;


    const hashedPassword = await bcrypt.hash(password, 10);

  
    const payload = {
      docId: id,
      adminId: id,
      name,
      email,
      phone,
      password: hashedPassword,
      role: "admin", 
      createdAt: new Date().toISOString(),
    };

    await db.collection("users").doc(id).set(payload);

    return Response.json(
      {
        message: "Admin created successfully",
        user: {
          id,
          name,
          email,
          role: "admin",
        },
      },
      { status: 201 }
    );
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