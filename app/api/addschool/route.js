import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin"; // Firebase Admin config



export async function POST(req) {
  try {
    // ✅ FORM DATA READ (IMPORTANT CHANGE)
    const form = await req.formData();

    const schoolId = form.get("schoolId");
    const schoolName = form.get("schoolName");
    const displayName = form.get("displayName");
    const address = form.get("address");
    const establishedYear = form.get("establishedYear");
    const schoolType = form.get("schoolType");
    const adminId = form.get("adminId");

    const imageFile = form.get("image"); // 📁 FILE

    // optional JSON string (if you send facilities as string)
    let facilities = form.get("facilities");
    try {
      facilities = facilities ? JSON.parse(facilities) : {};
    } catch {
      facilities = {};
    }

    // ===== Validation =====
    if (!schoolName || !address || !establishedYear) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const year = Number(establishedYear);
    const currentYear = new Date().getFullYear();

    if (year < 1850 || year > currentYear) {
      return NextResponse.json(
        { error: "Invalid year" },
        { status: 400 }
      );
    }

    // ===== Duplicate Check =====
    const snapshot = await db
      .collection("Schools")
      .where("schoolName", "==", schoolName.toLowerCase())
      .get();

    if (!snapshot.empty) {
      return NextResponse.json(
        { error: "School already exists" },
        { status: 409 }
      );
    }

    // ===== IMAGE HANDLING (simple base64) =====
    let imageData = null;

    if (imageFile && typeof imageFile !== "string") {
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      imageData = {
        name: imageFile.name,
        type: imageFile.type,
        base64: buffer.toString("base64"),
      };
    }

    // ===== Save Data =====
    const newSchool = {
      schoolId: schoolId || `school-${Date.now()}`,
      schoolName: schoolName.toLowerCase(),
      displayName,
      address,
      establishedYear: Number(establishedYear),
      schoolType,
      adminId,
      facilities,
      image: imageData, // ✅ stored image
      status: "active",
      createdAt: new Date().toISOString(),
    };

    await db.collection("Schools").doc(newSchool.schoolId).set(newSchool);

    return NextResponse.json({
      success: true,
      data: newSchool,
    });

  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

//=================================================get school==================================================

export async function GET() {
  try {
    const snapshot = await db.collection("Schools").get();

    const schools = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: schools,
    });

  } catch (error) {
    console.error("GET Schools Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch schools",
      },
      { status: 500 }
    );
  }
}