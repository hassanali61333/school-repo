import { db } from "@/lib/firebaseAdmin.js";

export async function GET() {
  try {
    const snapshot = await db.collection("test_connection").get();

    return Response.json({
      success: true,
      docs: snapshot.size,
    });
  } catch (error) {
    console.error("FIREBASE ERROR:", error);

    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}