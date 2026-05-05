import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const form = await req.formData();

    const headName   = form.get("name");
    const email      = form.get("email")?.toLowerCase().trim();
    const password   = form.get("password");
    const schoolId   = form.get("schoolId");
    const schoolName = form.get("schoolName");
    const adminId    = form.get("adminId");
    const phone      = form.get("phone");
    const joiningDate = form.get("joiningDate");
    const designation = form.get("role");
    const imageFile  = form.get("image");

    // ===== VALIDATION =====
    if (!headName || !email || !password || !schoolId || !adminId) {
      return NextResponse.json(
        { error: "Missing required fields (name, email, password, schoolId, adminId)" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // ===== EMAIL DUPLICATE CHECK across all collections =====
    const collections = ["head", "Teacher", "students", "user"];
    for (let col of collections) {
      const snap = await db.collection(col).where("email", "==", email).get();
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
        { error: "This school already has a head assigned" },
        { status: 409 }
      );
    }

    // ===== IMAGE TO BASE64 =====
    let imageData = null;
    if (imageFile && typeof imageFile !== "string") {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageData = {
        name: imageFile.name,
        type: imageFile.type,
        base64: buffer.toString("base64"),
      };
    }

    // ===== HASH PASSWORD =====
    const hashedPassword = await bcrypt.hash(password, 10);

    // ===== SAVE =====
    const headId = `head-${Date.now()}`;
    const newHead = {
      headId,
      adminId,        // ✅ from frontend
      schoolId,       // ✅ from frontend
      schoolName,     // ✅ from frontend
      name: headName,
      email,
      password: hashedPassword,
      phone: phone || null,
      joiningDate: joiningDate || null,
      designation: designation || null,
      role: "head",
      image: imageData,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    await db.collection("head").doc(headId).set(newHead);

    const { password: _, ...safeHead } = newHead;

    return NextResponse.json({
      success: true,
      message: "Head added successfully",
      data: safeHead,
    });

  } catch (error) {
    console.error("Add Head Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}








export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");

    if (!adminId) {
      return NextResponse.json(
        { error: "adminId is required" },
        { status: 400 }
      );
    }

    const snap = await db
      .collection("head")
      .where("adminId", "==", adminId)
      .get();

    if (snap.empty) {
      return NextResponse.json({ success: true, data: [] });
    }

    const heads = snap.docs.map((doc) => {
      const data = doc.data();
      const { password, ...safeData } = data; // never return password
      return safeData;
    });

    return NextResponse.json({ success: true, data: heads });

  } catch (error) {
    console.error("Get Heads Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}