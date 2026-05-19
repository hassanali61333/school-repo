// app/api/teacher/route.js

import { db } from "@/lib/firebaseAdmin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { checkEmailExists } from "@/lib/checkmail";

/* =========================================
   HELPER: Generate Teacher ID
========================================= */
function generateTeacherId() {
  return `teacher-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

/* =========================================
   POST - Create new teacher
========================================= */
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      teacherId,
      adminId,
      headId,
      schoolId,
      schoolName,

      name,
      qualification,
      contactNumber,
      email,
      password,
      imageUrl,

      class: assignedClass,
      section,

      subjects,
      primarySubject,
      isClassIncharge,

      salary,
    } = body;

    console.log("📝 Creating teacher:", { name, email, schoolId });

    /* =========================
       VALIDATION
    ========================= */

    if (!adminId || !headId || !schoolId) {
      return NextResponse.json(
        { success: false, error: "Missing admin/head/school info" },
        { status: 400 }
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Teacher name is required" },
        { status: 400 }
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one subject is required" },
        { status: 400 }
      );
    }

    if (!salary || Number(salary) <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid salary" },
        { status: 400 }
      );
    }

    /* =========================
       GLOBAL EMAIL CHECK
    ========================= */

    const emailCheckResult = await checkEmailExists(normalizedEmail);

    if (emailCheckResult.exists) {
      return NextResponse.json(
        {
          success: false,
          error: emailCheckResult.message
        },
        { status: 409 }
      );
    }

    // Check in Teacher collection
    const existingTeacher = await db
      .collection("Teacher")
      .where("email", "==", normalizedEmail)
      .get();

    if (!existingTeacher.empty) {
      return NextResponse.json(
        {
          success: false,
          error: "Email already exists in Teacher records",
        },
        { status: 409 }
      );
    }

    /* =========================
       HASH PASSWORD
    ========================= */

    const hashedPassword = await bcrypt.hash(password, 10);

    /* =========================
       SAVE TEACHER
    ========================= */

    const docId = teacherId || generateTeacherId();
    const currentTimestamp = new Date().toISOString();

    const teacherData = {
      docId,
      teacherId: docId,
      adminId,
      headId,
      schoolId,
      schoolName,
      role: "teacher",
      name: name.trim(),
      qualification: qualification || "",
      contactNumber: contactNumber?.replace(/\D/g, "") || "",
      email: normalizedEmail,
      password: hashedPassword,
      imageUrl: imageUrl || null,
      class: assignedClass || null,
      section: section || null,
      subjects: subjects,
      primarySubject: primarySubject || subjects[0],
      isClassIncharge: Boolean(isClassIncharge),
      salary: Number(salary),
      status: "active",
      createdAt: currentTimestamp,
    };

    await db.collection("Teacher").doc(docId).set(teacherData);

    // Remove password from response
    const { password: _, ...safeData } = teacherData;

    return NextResponse.json(
      {
        success: true,
        message: "Teacher added successfully",
        data: { id: docId, ...safeData },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADD TEACHER ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error: " + error.message,
      },
      { status: 500 }
    );
  }
}

/* =========================================
   GET - Fetch teachers by schoolId
========================================= */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("schoolId");

    console.log("📋 Fetching teachers for schoolId:", schoolId);

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: "schoolId is required" },
        { status: 400 }
      );
    }

    const snapshot = await db
      .collection("Teacher")
      .where("schoolId", "==", schoolId)
      .get();

    const teachers = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Remove password from response
      const { password, ...safeData } = data;
      return { id: doc.id, ...safeData };
    });

    console.log(`✅ Found ${teachers.length} teachers`);

    return NextResponse.json(
      {
        success: true,
        data: teachers,
        total: teachers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET TEACHERS ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch teachers: " + error.message },
      { status: 500 }
    );
  }
}

/* =========================================
   PUT - Update teacher
========================================= */
export async function PUT(req) {
  try {
    const body = await req.json();
    
    // Support both docId and id from frontend
    const docId = body.docId || body.id;

    console.log("✏️ Updating teacher with docId:", docId);
    console.log("Update data:", body);

    if (!docId) {
      return NextResponse.json(
        { success: false, error: "docId is required" },
        { status: 400 }
      );
    }

    const teacherRef = db.collection("Teacher").doc(docId);
    const teacherSnap = await teacherRef.get();

    if (!teacherSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Teacher not found" },
        { status: 404 }
      );
    }

    const existingTeacher = teacherSnap.data();

    /* =========================
       EMAIL CHECK (if changing)
    ========================= */

    if (body.email && body.email !== existingTeacher.email) {
      const normalizedEmail = body.email.trim().toLowerCase();
      const emailSnap = await db
        .collection("Teacher")
        .where("email", "==", normalizedEmail)
        .get();

      const duplicate = emailSnap.docs.find((doc) => doc.id !== docId);

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: "Email already exists" },
          { status: 409 }
        );
      }
      
      body.email = normalizedEmail;
    }

    /* =========================
       UPDATE OBJECT
    ========================= */

    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    // Only include fields that are provided
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.qualification !== undefined) updateData.qualification = body.qualification;
    if (body.contactNumber !== undefined) updateData.contactNumber = body.contactNumber.replace(/\D/g, "");
    if (body.email !== undefined) updateData.email = body.email;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.class !== undefined) updateData.class = body.class;
    if (body.section !== undefined) updateData.section = body.section;
    if (body.subjects !== undefined) updateData.subjects = body.subjects;
    if (body.primarySubject !== undefined) updateData.primarySubject = body.primarySubject;
    if (body.isClassIncharge !== undefined) updateData.isClassIncharge = Boolean(body.isClassIncharge);
    if (body.salary !== undefined) updateData.salary = Number(body.salary);
    if (body.status !== undefined) updateData.status = body.status;

    console.log("Updating with data:", updateData);

    await teacherRef.update(updateData);

    // Get updated teacher data
    const updatedSnap = await teacherRef.get();
    const updatedData = updatedSnap.data();
    const { password: _, ...safeData } = updatedData;

    return NextResponse.json(
      {
        success: true,
        message: "Teacher updated successfully",
        data: { id: docId, ...safeData },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE TEACHER ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update teacher: " + error.message },
      { status: 500 }
    );
  }
}

/* =========================================
   DELETE - Remove teacher
========================================= */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    let docId = searchParams.get("docId");
    
    // If docId not found, try 'id' parameter
    if (!docId) {
      docId = searchParams.get("id");
    }

    console.log("🗑️ Deleting teacher with docId:", docId);

    if (!docId) {
      return NextResponse.json(
        { success: false, error: "docId is required" },
        { status: 400 }
      );
    }

    const teacherRef = db.collection("Teacher").doc(docId);
    const teacherSnap = await teacherRef.get();

    if (!teacherSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Teacher not found" },
        { status: 404 }
      );
    }

    const teacherData = teacherSnap.data();
    
    await teacherRef.delete();

    return NextResponse.json(
      {
        success: true,
        message: `Teacher ${teacherData.name} deleted successfully`,
        deletedDocId: docId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE TEACHER ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete teacher: " + error.message },
      { status: 500 }
    );
  }
}