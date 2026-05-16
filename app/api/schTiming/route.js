import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

// CREATE school timing
export async function POST(req) {
  try {
    const body = await req.json();
    const { schoolId, openTime, closeTime } = body;

    if (!schoolId || !openTime || !closeTime) {
      return NextResponse.json(
        { success: false, message: "schoolId, openTime, closeTime required" },
        { status: 400 }
      );
    }

    // FIXED: Use same path as GET
    const ref = db.collection("schools").doc(schoolId).collection("timing").doc("settings");

    await ref.set({
      schoolId,
      openTime,
      closeTime,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Timing created successfully",
      data: { schoolId, openTime, closeTime }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET school timing
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json(
        { success: false, message: "schoolId required" },
        { status: 400 }
      );
    }

    // FIXED: Correct path
    const doc = await db
      .collection("schools")
      .doc(schoolId)
      .collection("timing")
      .doc("settings")
      .get();

    if (!doc.exists) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No timing found",
      });
    }

    return NextResponse.json({
      success: true,
      data: doc.data(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}

// UPDATE school timing
export async function PUT(req) {
  try {
    const body = await req.json();
    const { schoolId, openTime, closeTime } = body;

    if (!schoolId || !openTime || !closeTime) {
      return NextResponse.json(
        { success: false, message: "schoolId, openTime, closeTime required" },
        { status: 400 }
      );
    }

    // FIXED: Use same path as GET
    const ref = db.collection("schools").doc(schoolId).collection("timing").doc("settings");

    // Check if document exists first
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, message: "Timing not found. Please create first." },
        { status: 404 }
      );
    }

    await ref.update({
      openTime,
      closeTime,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Timing updated successfully",
      data: { schoolId, openTime, closeTime }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE school timing (optional)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json(
        { success: false, message: "schoolId required" },
        { status: 400 }
      );
    }

    const ref = db.collection("schools").doc(schoolId).collection("timing").doc("settings");
    
    await ref.delete();

    return NextResponse.json({
      success: true,
      message: "Timing deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}