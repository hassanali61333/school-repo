import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");

  try {
    const snapshot = await db
      .collection("Schools")
      .where("schoolId", "==", schoolId)
      .get();

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