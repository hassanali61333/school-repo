import { db } from "@/lib/firebaseAdmin";
import { data } from "autoprefixer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      adminId,
      headId,
      schoolId,
      class: className,
      section,
   
    } = body;

    const requiredFields = [
      "adminId",
      "headId",
      "schoolId",
      "class",
      "section",
     
    ];

    for (const key of requiredFields) {
      if (!body[key]) {
        return NextResponse.json(
          { error: `${key} is required` },
          { status: 400 }
        );
      }
    }

const classExists = await db
  .collection("classes")
  .where("adminId", "==", adminId)
  .where("headId", "==", headId)
  .where("schoolId", "==", schoolId)
  .where("class", "==", className) 
  .where("section", "==", section)
  .get();

if (!classExists.empty) {
  return NextResponse.json(
    { error: `${className}${section} already exists` },
    { status: 400 }
  );
}

    const classId = `cls_${Date.now()}`;

    await db.collection("classes").doc(classId).set({
      classId,
      adminId,
      headId,
      schoolId,
      class: className,
      section,
   
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json(
      {
        success: true,
        message: "Class created successfully",
        classId,
      },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

//=======================================================get classes================================================


export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("schoolId");
  try {
    const snapshot = await db
      .collection("classes")
      .where("schoolId", "==", schoolId)
      .get();

    const classes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        success: true,
        data :classes,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}