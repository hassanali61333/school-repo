import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin"; // Firebase Admin config

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      schoolId,
      schoolName,
      displayName,
      address,
      establishedYear,
      schoolType,
      imageName,
      facilities = {},
      adminId = null,
    } = body;

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

    // ===== Save Data =====
    const newSchool = {
      schoolId: schoolId || `school-${Date.now()}`,
      schoolName: schoolName.toLowerCase(),
      displayName,
      address,
      establishedYear,
      schoolType,
      imageName: imageName || null,
      facilities,
      adminId,
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