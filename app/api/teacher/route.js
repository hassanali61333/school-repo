// app/api/addteacher/route.js

import { db } from "@/lib/firebaseAdmin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

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

    /* =========================
       VALIDATION
    ========================= */

    if (!adminId || !headId || !schoolId) {
      return NextResponse.json(
        { error: "Missing admin/head/school info" },
        { status: 400 }
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Teacher name is required" },
        { status: 400 }
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { error: "At least one subject is required" },
        { status: 400 }
      );
    }

    if (!salary || Number(salary) <= 0) {
      return NextResponse.json(
        { error: "Invalid salary" },
        { status: 400 }
      );
    }

    /* =========================
       GLOBAL EMAIL CHECK
    ========================= */

    const collectionsToCheck = [
      "users",
      "user",
      "heads",
      "head",
      "teachers",
      "Teacher",
      "students",
    ];

    for (const collectionName of collectionsToCheck) {
      const snap = await db
        .collection(collectionName)
        .where("email", "==", normalizedEmail)
        .get();

      if (!snap.empty) {
        return NextResponse.json(
          {
            error: `Email already exists in ${collectionName}`,
          },
          { status: 409 }
        );
      }
    }

    // check parent.email in students
    const studentSnap = await db.collection("students").get();

    const parentExists = studentSnap.docs.some(
      (doc) =>
        doc.data()?.parent?.email?.toLowerCase() === normalizedEmail
    );

    if (parentExists) {
      return NextResponse.json(
        {
          error: "Email already exists in student parent records",
        },
        { status: 409 }
      );
    }

    /* =========================
       CLASS + SECTION + SUBJECT
       CONFLICT CHECK
    ========================= */

    if (assignedClass && section && subjects.length > 0) {
      const teacherSnap = await db
        .collection("Teacher")
        .where("schoolId", "==", schoolId)
        .where("class", "==", assignedClass)
        .where("section", "==", section)
        .get();

      const hasConflict = teacherSnap.docs.some((doc) => {
        const data = doc.data();

        const existingSubjects = Array.isArray(data.subjects)
          ? data.subjects
          : [];

        return subjects.some((subject) =>
          existingSubjects
            .map((s) => s.toLowerCase())
            .includes(subject.toLowerCase())
        );
      });

      if (hasConflict) {
        return NextResponse.json(
          {
            error:
              "This class + section + subject combination already exists",
          },
          { status: 409 }
        );
      }
    }

    /* =========================
       HASH PASSWORD
    ========================= */

    const hashedPassword = await bcrypt.hash(password, 10);

    /* =========================
       SAVE TEACHER
    ========================= */

    const docId = teacherId || `teacher-${Date.now()}`;

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
      contactNumber:
        contactNumber?.replace(/\D/g, "") || "",

      email: normalizedEmail,
      password: hashedPassword,

      imageUrl: imageUrl || "",

      class: assignedClass || null,
      section: section || null,

      subjects,
      primarySubject: primarySubject || subjects[0],

      isClassIncharge: Boolean(isClassIncharge),

      salary: Number(salary),

      status: "active",

      createdAt: new Date().toISOString(),
    };

    await db.collection("Teacher").doc(docId).set(teacherData);

    /* =========================
       RESPONSE
    ========================= */

    return NextResponse.json(
      {
        success: true,
        message: "Teacher added successfully",
        data: teacherData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADD TEACHER ERROR:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}


// app/api/addteacher/route.js


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId is required" },
        { status: 400 }
      );
    }

    const snap = await db
      .collection("Teacher")
      .where("schoolId", "==", schoolId)
      .get();

    const teachers = snap.docs.map((doc) => {
      const data = doc.data();

      // remove password
      const { password, ...safeData } = data;

      return safeData;
    });

    return NextResponse.json(
      {
        success: true,
        data: teachers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("GET TEACHERS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}

/* =========================================
   UPDATE TEACHER
========================================= */
export async function PUT(req) {
  try {
    const body = await req.json();

    const {
      docId,
      name,
      qualification,
      contactNumber,
      email,
      imageUrl,
      class: assignedClass,
      section,
      subjects,
      primarySubject,
      isClassIncharge,
      salary,
      status,
    } = body;

    if (!docId) {
      return NextResponse.json(
        { error: "docId is required" },
        { status: 400 }
      );
    }

    const teacherRef = db.collection("Teacher").doc(docId);

    const teacherSnap = await teacherRef.get();

    if (!teacherSnap.exists) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    const existingTeacher = teacherSnap.data();

    /* =========================
       EMAIL CHECK
    ========================= */

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();

      const emailSnap = await db
        .collection("Teacher")
        .where("email", "==", normalizedEmail)
        .get();

      const duplicate = emailSnap.docs.find(
        (doc) => doc.id !== docId
      );

      if (duplicate) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }
    }

    /* =========================
       UPDATE OBJECT
    ========================= */

    const updateData = {
      name: name || existingTeacher.name,
      qualification:
        qualification || existingTeacher.qualification,

      contactNumber:
        contactNumber?.replace(/\D/g, "") ||
        existingTeacher.contactNumber,

      email:
        email?.trim().toLowerCase() ||
        existingTeacher.email,

      imageUrl:
        imageUrl !== undefined
          ? imageUrl
          : existingTeacher.imageUrl,

      class:
        assignedClass !== undefined
          ? assignedClass
          : existingTeacher.class,

      section:
        section !== undefined
          ? section
          : existingTeacher.section,

      subjects:
        subjects || existingTeacher.subjects,

      primarySubject:
        primarySubject ||
        existingTeacher.primarySubject,

      isClassIncharge:
        isClassIncharge !== undefined
          ? isClassIncharge
          : existingTeacher.isClassIncharge,

      salary:
        salary !== undefined
          ? Number(salary)
          : existingTeacher.salary,

      status:
        status || existingTeacher.status,

      updatedAt: new Date().toISOString(),
    };

    await teacherRef.update(updateData);

    return NextResponse.json(
      {
        success: true,
        message: "Teacher updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("UPDATE TEACHER ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update teacher" },
      { status: 500 }
    );
  }
}

/* =========================================
   DELETE TEACHER
========================================= */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);

    const docId = searchParams.get("docId");

    if (!docId) {
      return NextResponse.json(
        { error: "docId is required" },
        { status: 400 }
      );
    }

    const teacherRef = db.collection("Teacher").doc(docId);

    const teacherSnap = await teacherRef.get();

    if (!teacherSnap.exists) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    await teacherRef.delete();

    return NextResponse.json(
      {
        success: true,
        message: "Teacher deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("DELETE TEACHER ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}