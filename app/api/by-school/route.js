import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin"; // Firebase Admin config
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json({ error: "schoolId is required" }, { status: 400 });
    }

    // Normalize
    schoolId = schoolId.trim().toLowerCase();

    const snap = await db.collection("head").get();

    const matched = snap.docs
      .map(doc => doc.data())
      .find(d => (d.schoolId || "").trim().toLowerCase() === schoolId);

    return NextResponse.json({
      success: true,
      data: matched || null,
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}