import { db } from "@/lib/firebaseAdmin";
import bcrypt from "bcryptjs";
import { checkEmailExists } from "@/lib/checkmail";

export async function POST(req) {
  try {
    const body = await req.json();
    let { name, email, phone, password } = body;

    name = name?.trim();
    email = email?.trim().toLowerCase();
    phone = phone?.replace(/\D/g, "");

    // Validation
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

    // Check if email exists in any collection (users, SchoolStaff, Teacher, studentParents)
    const emailCheck = await checkEmailExists(email);
    
    if (emailCheck.exists) {
      return Response.json(
        { 
          message: emailCheck.message || `Email ${email} already exists in ${emailCheck.collection} collection. Please use a different email address.`,
          collection: emailCheck.collection,
          role: emailCheck.role
        },
        { status: 409 }
      );
    }

    // Check in users collection as backup (though checkEmailExists already does this)
    const existingSnap = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      return Response.json(
        { message: "User already exists in users collection" },
        { status: 409 }
      );
    }

    // Generate unique ID
    const id = `admin-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create payload
    const payload = {
      docId: id,
      adminId: id,
      name,
      email,
      phone,
      password: hashedPassword,
      role: "admin",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to database
    await db.collection("users").doc(id).set(payload);

    // Return success response (don't send password back)
    return Response.json(
      {
        success: true,
        message: "Admin created successfully",
        user: {
          id,
          name,
          email,
          phone,
          role: "admin",
          status: "active",
        },
      },
      { status: 201 }
    );
    
  } catch (err) {
    console.error("Admin creation error:", err);
    return Response.json(
      {
        success: false,
        message: "Server error",
        error: err.message,
      },
      { status: 500 }
    );
  }
}