// app/api/admission/route.js

import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { toNumber, onlyDigits } from "@/lib/helper";
import { checkEmailExists } from "@/lib/checkmail";

// ── ID generator ──────────────────────────────────────────────────────────────
function generateStudentId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `student-${timestamp}-${random}`;
}

// ═════════════════════════════════════════════════════════════════════════════
// POST — Create admission
// ═════════════════════════════════════════════════════════════════════════════
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      // Account & school
      adminId,
      headId,
      schoolId,
      schoolName,

      // Teacher
      teacherId,

      // Student basic
      firstName,
      lastName,
      rollNo,
      gender,
      dob,
      studentEmail,
      studentPassword,

      // Parent — arrives as nested object { name, phone, email, password, address }
      parent,

      // Academic
      selectedClass,   // stored as classId in Firestore
      className,       // display name e.g. "Nursery", "Class 1", "9th"
      group,
      selectedSection, // stored as section in Firestore
      selectedSubjects,// stored as subjects[] in Firestore

      // Image — filename string (uploaded to PHP server by frontend)
      imageUrl,

      // Fee flat fields
      admissionFee,
      monthlyFee,

      // Billing settings
      dueDay,
      autoReminder,
      reminderDaysBefore,
      notifyVia,
    } = body;

    // ── Extract parent fields ─────────────────────────────────────────────────
    const parentName    = parent?.name    || "";
    const parentPhone   = parent?.phone   || "";
    const parentEmail   = parent?.email   || "";
    const parentPassword = parent?.password || "";
    const parentAddress = parent?.address || "";

    // ── Validation ────────────────────────────────────────────────────────────
    const errors = [];

    if (!adminId || !headId || !schoolId) errors.push("Account info missing (adminId / headId / schoolId).");
    if (!teacherId) errors.push("Teacher Incharge is required.");
    if (!firstName?.trim()) errors.push("First name is required.");

    const rd = onlyDigits(rollNo);
    if (!rd || rd.length < 1 || rd.length > 10)
      errors.push("Roll number must be 1–10 digits.");

    if (!studentEmail || !studentEmail.includes("@"))
      errors.push("Valid student email is required.");
    if (!studentPassword || String(studentPassword).length < 6)
      errors.push("Student password must be at least 6 characters.");

    if (!parentName?.trim()) errors.push("Parent name is required.");
    const pd = onlyDigits(parentPhone);
    if (pd.length < 10 || pd.length > 14)
      errors.push("Parent phone must be 10–14 digits.");
    if (!parentEmail || !parentEmail.includes("@"))
      errors.push("Valid parent email is required.");

    if (!selectedClass) errors.push("Class is required.");
    if (!selectedSection) errors.push("Section is required.");

    if (!Array.isArray(selectedSubjects) || selectedSubjects.length === 0)
      errors.push("Select at least one subject.");

    if (toNumber(monthlyFee) <= 0)
      errors.push("Monthly fee must be greater than 0.");

    const dd = toNumber(dueDay);
    if (!(dd >= 1 && dd <= 28))
      errors.push("Due day must be between 1 and 28.");

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors.join(" | ") },
        { status: 400 }
      );
    }

    const normalizedStudentEmail = studentEmail.trim().toLowerCase();
    const normalizedParentEmail  = parentEmail.trim().toLowerCase();

    // ── Student/parent email must not be the same ─────────────────────────────
    if (normalizedStudentEmail === normalizedParentEmail) {
      return NextResponse.json(
        { success: false, message: "Student and parent email cannot be the same." },
        { status: 409 }
      );
    }

    // ── Check student email across all collections ────────────────────────────
    const emailCheckResult = await checkEmailExists(normalizedStudentEmail);
    if (emailCheckResult.exists) {
      return NextResponse.json(
        {
          success: false,
          message: emailCheckResult.message ||
            `Email ${normalizedStudentEmail} is already in use.`,
          collection: emailCheckResult.collection,
          role: emailCheckResult.role,
        },
        { status: 409 }
      );
    }

    // ── Duplicate student email within same school ────────────────────────────
    const dupStudentEmailSnap = await db
      .collection("students")
      .where("email", "==", normalizedStudentEmail)
      .where("schoolId", "==", schoolId)
      .get();

    if (!dupStudentEmailSnap.empty) {
      return NextResponse.json(
        { success: false, message: "This student email already exists in this school." },
        { status: 409 }
      );
    }

    // ── Duplicate roll number in same class / section / school ────────────────
    const dupRollSnap = await db
      .collection("students")
      .where("rollNo", "==", rd)
      .where("classId", "==", selectedClass)
      .where("section", "==", selectedSection)
      .where("schoolId", "==", schoolId)
      .get();

    if (!dupRollSnap.empty) {
      return NextResponse.json(
        {
          success: false,
          message: `Roll no ${rd} already exists in ${className || selectedClass} — Section ${selectedSection}.`,
        },
        { status: 409 }
      );
    }

    // ── Parent email: check if parent already exists in this school ───────────
    let resolvedParentPassword = parentPassword || null;

    const existingParentSnap = await db
      .collection("students")
      .where("parent.email", "==", normalizedParentEmail)
      .where("schoolId", "==", schoolId)
      .limit(1)
      .get();

    const parentExistsInSchool = !existingParentSnap.empty;

    if (parentExistsInSchool) {
      if (!resolvedParentPassword) {
        const existingParentData = existingParentSnap.docs[0].data();
        resolvedParentPassword = existingParentData?.parent?.password || null;
      }
    } else {
      if (!resolvedParentPassword || resolvedParentPassword.length < 8) {
        return NextResponse.json(
          {
            success: false,
            message: "New parent account requires a password of at least 8 characters.",
          },
          { status: 400 }
        );
      }
    }

    // ── Build Firestore document ──────────────────────────────────────────────
    const studentId        = generateStudentId();
    const currentTimestamp = new Date().toISOString();

    // fee sub-object — matches first object schema exactly
    const feeObj = {
      admissionOneTime: toNumber(admissionFee),
      dueDay: toNumber(dueDay),
      monthly: toNumber(monthlyFee),
      outstanding: 0,
      reminder: {
        enabled: !!autoReminder,
        daysBefore: parseInt(String(reminderDaysBefore), 10) || 0,
        channel: notifyVia || "WhatsApp",
      },
    };

    // parent sub-object
    const parentObj = {
      name: parentName.trim(),
      phone: onlyDigits(parentPhone),
      email: normalizedParentEmail,
      address: parentAddress?.trim() || "",
    };
    if (resolvedParentPassword) parentObj.password = resolvedParentPassword;

    // Full student document — matches first object schema exactly
    const studentDoc = {
      // ── Identifiers ──
      studentId,
      adminId,
      headId,
      schoolId,
      schoolName,

      // ── Teacher ──
      teacherId,

      // ── Student ──
      role: "student",
      status: "active",
      firstName: firstName.trim(),
      lastName: (lastName || "").trim(),
      rollNo: rd,
      gender,
      dob: (dob || "").trim(),
      email: normalizedStudentEmail,
      password: studentPassword,
      imageUrl: imageUrl || null,
      group: group || null,

      // ── Parent (nested) ──
      parent: parentObj,

      // ── Academic ──
      classId: selectedClass,
      className: className || selectedClass,
      section: selectedSection,
      subjects: selectedSubjects,

      // ── Fee ──
      fee: feeObj,

      // ── Timestamps ──
      createdAt: currentTimestamp,
    };

    // ── Save to Firestore ─────────────────────────────────────────────────────
    await db.collection("students").doc(studentId).set(studentDoc);

    return NextResponse.json(
      {
        success: true,
        studentId,
        message: `${firstName.trim()} has been successfully admitted.`,
        data: {
          studentId,
          firstName: firstName.trim(),
          lastName: (lastName || "").trim(),
          email: normalizedStudentEmail,
          rollNo: rd,
          classId: selectedClass,
          className: studentDoc.className,
          section: selectedSection,
          group: group || null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admission POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save. Please try again." },
      { status: 500 }
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// GET — Fetch all students of a school
// ═════════════════════════════════════════════════════════════════════════════
// ═════════════════════════════════════════════════════════════════════════════
// GET — Fetch all students of a school
// ═════════════════════════════════════════════════════════════════════════════
export async function GET(request) {
  console.log("=== API GET /admission called ===");
  
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");
    
    console.log("SchoolId from query:", schoolId);

    if (!schoolId) {
      return NextResponse.json(
        { success: false, message: "schoolId is required." },
        { status: 400 }
      );
    }

    // Get ALL students first to see what's in the database
    const allStudentsSnap = await db.collection("students").get();
    console.log("Total students in database:", allStudentsSnap.size);
    
    // Log ALL students to see their schoolId values
    const allStudentsList = [];
    allStudentsSnap.forEach(doc => {
      const data = doc.data();
      allStudentsList.push({
        id: doc.id,
        schoolId: data.schoolId,
        name: `${data.firstName} ${data.lastName || ''}`,
        rollNo: data.rollNo
      });
    });
    console.log("All students in DB:", JSON.stringify(allStudentsList, null, 2));
    
    // Method 1: Try with where clause
    let snapshot = await db
      .collection("students")
      .where("schoolId", "==", schoolId)
      .get();
    
    console.log(`Students found with where clause:`, snapshot.size);
    
    // If no students found with where, try getting all and filter manually
    if (snapshot.empty) {
      console.log("No students found with where clause, trying manual filtering...");
      
      const manuallyFiltered = [];
      allStudentsSnap.forEach(doc => {
        const data = doc.data();
        // Try different matching methods
        if (data.schoolId === schoolId || 
            String(data.schoolId) === String(schoolId) ||
            (data.schoolId && data.schoolId.toString() === schoolId.toString())) {
          manuallyFiltered.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      if (manuallyFiltered.length > 0) {
        console.log(`Found ${manuallyFiltered.length} students via manual filter`);
        
        // Remove sensitive data
        const students = manuallyFiltered.map(student => {
          delete student.password;
          if (student.parent?.password) delete student.parent.password;
          return student;
        });
        
        return NextResponse.json({ 
          success: true, 
          students, 
          total: students.length,
          debug: {
            method: "manual_filter",
            totalInDB: allStudentsSnap.size,
            requestedSchoolId: schoolId
          }
        });
      }
      
      // If still no students found, return debug info
      const uniqueSchoolIds = [...new Set(allStudentsList.map(s => s.schoolId).filter(id => id))];
      console.log("Unique schoolIds in database:", uniqueSchoolIds);
      
      return NextResponse.json({ 
        success: true, 
        students: [], 
        total: 0,
        debug: {
          totalInDB: allStudentsSnap.size,
          availableSchoolIds: uniqueSchoolIds,
          requestedSchoolId: schoolId,
          allStudents: allStudentsList
        }
      });
    }

    // Students found with where clause
    const students = snapshot.docs.map((doc) => {
      const data = { id: doc.id, ...doc.data() };
      delete data.password;
      if (data.parent?.password) delete data.parent.password;
      return data;
    });

    return NextResponse.json({ 
      success: true, 
      students, 
      total: students.length,
      debug: {
        method: "where_clause",
        totalInDB: allStudentsSnap.size,
        requestedSchoolId: schoolId
      }
    });
  } catch (error) {
    console.error("Admission GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch students: " + error.message },
      { status: 500 }
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// PUT — Update student
// ═════════════════════════════════════════════════════════════════════════════
export async function PUT(request) {
  try {
    const body = await request.json();

    const {
      studentId, schoolId,
      firstName, lastName, rollNo, gender, dob,
      studentEmail, studentPassword,
      parent,
      selectedClass, className, selectedSection, group, selectedSubjects,
      admissionFee, monthlyFee,
      dueDay, autoReminder, reminderDaysBefore, notifyVia,
      imageUrl,
      teacherId,
    } = body;

    const parentName     = parent?.name    || "";
    const parentPhone    = parent?.phone   || "";
    const parentEmail    = parent?.email   || "";
    const parentPassword = parent?.password || "";
    const parentAddress  = parent?.address || "";

    // ── Validation ────────────────────────────────────────────────────────────
    const errors = [];
    if (!studentId || !schoolId) errors.push("studentId and schoolId are required.");
    if (!firstName?.trim()) errors.push("First name is required.");
    const rd = onlyDigits(rollNo);
    if (!rd || rd.length < 1 || rd.length > 10) errors.push("Roll number must be 1–10 digits.");
    if (!studentEmail || !studentEmail.includes("@")) errors.push("Valid student email required.");
    if (studentPassword && studentPassword.length < 6) errors.push("Student password min 6 characters.");
    if (!parentName?.trim()) errors.push("Parent name required.");
    const pd = onlyDigits(parentPhone);
    if (pd.length < 10 || pd.length > 14) errors.push("Parent phone must be 10–14 digits.");
    if (!parentEmail || !parentEmail.includes("@")) errors.push("Valid parent email required.");
    if (!selectedClass) errors.push("Class is required.");
    if (!selectedSection) errors.push("Section is required.");
    if (!Array.isArray(selectedSubjects) || selectedSubjects.length === 0)
      errors.push("Select at least one subject.");
    if (toNumber(monthlyFee) <= 0) errors.push("Monthly fee must be > 0.");
    const dd2 = toNumber(dueDay);
    if (!(dd2 >= 1 && dd2 <= 28)) errors.push("Due day must be 1–28.");

    if (errors.length > 0) {
      return NextResponse.json({ success: false, message: errors.join(" | ") }, { status: 400 });
    }

    // ── Student must exist ────────────────────────────────────────────────────
    const studentRef  = db.collection("students").doc(studentId);
    const studentSnap = await studentRef.get();
    if (!studentSnap.exists) {
      return NextResponse.json({ success: false, message: "Student not found." }, { status: 404 });
    }
    const existingData = studentSnap.data();

    // ── Duplicate roll check (excluding current student) ──────────────────────
    const dupRollSnap = await db
      .collection("students")
      .where("rollNo", "==", rd)
      .where("classId", "==", selectedClass)
      .where("section", "==", selectedSection)
      .where("schoolId", "==", schoolId)
      .get();

    if (!dupRollSnap.empty && dupRollSnap.docs.some((d) => d.id !== studentId)) {
      return NextResponse.json(
        { success: false, message: `Roll no ${rd} already exists in this class/section.` },
        { status: 409 }
      );
    }

    // ── Build parent object ───────────────────────────────────────────────────
    const parentUpdate = {
      name: parentName.trim() || existingData.parent?.name,
      phone: onlyDigits(parentPhone) || existingData.parent?.phone,
      email: parentEmail.trim().toLowerCase() || existingData.parent?.email,
      address: parentAddress?.trim() || existingData.parent?.address || "",
    };
    if (parentPassword && parentPassword.length >= 6) parentUpdate.password = parentPassword;
    else if (existingData.parent?.password) parentUpdate.password = existingData.parent.password;

    // ── Build fee object ──────────────────────────────────────────────────────
    const feeUpdate = {
      admissionOneTime: toNumber(admissionFee) || existingData.fee?.admissionOneTime || 0,
      dueDay: toNumber(dueDay) || existingData.fee?.dueDay || 5,
      monthly: toNumber(monthlyFee) || existingData.fee?.monthly || 0,
      outstanding: existingData.fee?.outstanding || 0,
      reminder: {
        enabled: autoReminder !== undefined ? !!autoReminder : existingData.fee?.reminder?.enabled || false,
        daysBefore: reminderDaysBefore !== undefined ? parseInt(String(reminderDaysBefore), 10) : existingData.fee?.reminder?.daysBefore || 3,
        channel: notifyVia || existingData.fee?.reminder?.channel || "WhatsApp",
      },
    };

    // ── Update payload ────────────────────────────────────────────────────────
    const updateData = {
      firstName: firstName.trim(),
      lastName: (lastName || "").trim(),
      rollNo: rd,
      gender,
      dob: (dob || "").trim(),
      email: studentEmail.trim().toLowerCase(),
      parent: parentUpdate,
      classId: selectedClass,
      className: className || selectedClass,
      group: group || null,
      section: selectedSection,
      subjects: selectedSubjects,
      fee: feeUpdate,
    };

    if (teacherId) updateData.teacherId = teacherId;
    if (studentPassword && studentPassword.length >= 6) updateData.password = studentPassword;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    await studentRef.update(updateData);

    const updatedDoc = await studentRef.get();
    const result = { id: updatedDoc.id, ...updatedDoc.data() };
    delete result.password;
    if (result.parent?.password) delete result.parent.password;

    return NextResponse.json({ success: true, message: "Student updated successfully.", student: result });
  } catch (error) {
    console.error("Admission PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update student: " + error.message },
      { status: 500 }
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// DELETE — Remove student + related records
// ═════════════════════════════════════════════════════════════════════════════
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ success: false, message: "studentId is required." }, { status: 400 });
    }

    const studentRef = db.collection("students").doc(studentId);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      return NextResponse.json({ success: false, message: "Student not found." }, { status: 404 });
    }

    const { schoolId, firstName, rollNo } = studentDoc.data();
    const studentName = firstName;

    const batch = db.batch();
    batch.delete(studentRef);

    const relatedCollections = ["fees", "attendance", "examResults", "payments", "feeChallans"];
    for (const col of relatedCollections) {
      const snap = await db
        .collection(col)
        .where("studentId", "==", studentId)
        .where("schoolId", "==", schoolId)
        .get();
      snap.forEach((doc) => batch.delete(doc.ref));
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `${studentName} (Roll No: ${rollNo}) and all related records deleted.`,
      deletedStudentId: studentId,
    });
  } catch (error) {
    console.error("Admission DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete student: " + error.message },
      { status: 500 }
    );
  }
}