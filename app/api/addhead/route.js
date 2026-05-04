import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const form = await req.formData();

    const headName = form.get("name");
    const email = form.get("email")?.toLowerCase();
    const password = form.get("password");
    const schoolId = form.get("schoolId");
    const schoolName = form.get("schoolName");
    const adminId = form.get("adminId");

    const imageFile = form.get("image");

    // ===== VALIDATION =====
    if (!headName || !email || !password || !schoolId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // ===== EMAIL DUPLICATE CHECK =====
    const collections = ["head", "Teacher", "students", "user"];

    for (let col of collections) {
      const snap = await db
        .collection(col)
        .where("email", "==", email)
        .get();

      if (!snap.empty) {
        return NextResponse.json(
          { error: `Email already exists in ${col}` },
          { status: 409 }
        );
      }
    }

    // ===== CHECK SCHOOL ALREADY HAS HEAD =====
    const existingHead = await db
      .collection("head")
      .where("schoolId", "==", schoolId)
      .get();

    if (!existingHead.empty) {
      return NextResponse.json(
        { error: "This school already has a head" },
        { status: 409 }
      );
    }

    // ===== IMAGE CONVERT TO BASE64 =====
    let imageData = null;

    if (imageFile && typeof imageFile !== "string") {
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      imageData = {
        name: imageFile.name,
        type: imageFile.type,
        base64: buffer.toString("base64"),
      };
    }

    // ===== SAVE DATA =====
    const headId = `head-${Date.now()}`;

    const newHead = {
      headId,
      adminId,
      schoolId,
      schoolName,
      name: headName,
      email,
      password, // ⚠️ real app me hash karo (bcrypt)
      role: "head",
      image: imageData,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    await db.collection("head").doc(headId).set(newHead);

    return NextResponse.json({
      success: true,
      message: "Head added successfully",
      data: newHead,
    });

  } catch (error) {
    console.error("Add Head Error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}