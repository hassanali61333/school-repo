// school-repo/app/api/admission/route.js

import { NextResponse } from 'next/server';
import { db } from "@/lib/firebaseAdmin";
import { toNumber } from "@/lib/helper";
import { onlyDigits } from "@/lib/helper.js";
import { checkEmailExists } from "@/lib/checkmail";
// ── Generate Custom IDs ────────────────────────────────────────────────────
function generateStudentId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `student-${timestamp}-${random}`;
}

function generateParentId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `parent-${timestamp}-${random}`;
}

// ── Main Handler ─────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      adminId, headId, schoolId, schoolName,
      teacherId, teacherName,
      firstName, lastName, rollNo, gender, dob,
      studentEmail, studentPassword,
      parentName, parentPhone, parentEmail, parentPassword, parentAddress,
      selectedClass, className, group, selectedSection,
      selectedSubjects,
      tuitionFee, monthlyFee, admissionFee, registrationFee,
      securityFee, annualFee, otherFeeLabel, otherFeeAmount,
      dueDay, autoReminder, reminderDaysBefore, notifyVia,
    } = body;

    // ── Validation ──────────────────────────────────────────────────────────────
    const errors = [];

    if (!adminId || !headId || !schoolId) errors.push("Account info missing.");
    if (!teacherId) errors.push("Teacher Incharge is required.");
    if (!firstName?.trim()) errors.push("First name is required.");


    const rd = onlyDigits(rollNo);
    if (!rd || rd.length < 1 || rd.length > 10) errors.push("Roll number must be 1–10 digits.");

    if (!studentEmail) errors.push("Student email is required.");
    if (!studentEmail.includes('@')) errors.push("Invalid student email format.");
    if (!studentPassword || studentPassword.length < 6) errors.push("Student password min 6 characters.");
    
    if (!parentName?.trim()) errors.push("Parent name is required.");

    const pd = onlyDigits(parentPhone);
    if (pd.length < 10 || pd.length > 14) errors.push("Parent phone must be 10–14 digits.");

    if (!parentEmail) errors.push("Parent email is required.");
    if (!parentEmail.includes('@')) errors.push("Invalid parent email format.");
    if (!parentPassword || parentPassword.length < 6) errors.push("Parent password min 6 characters.");
    
    if (!selectedClass) errors.push("Class is required.");
    if (!selectedSection) errors.push("Section is required.");
    if (!selectedSubjects || selectedSubjects.length === 0) errors.push("Select at least one subject.");
    if (toNumber(monthlyFee) <= 0) errors.push("Monthly fee must be > 0.");

    const dd = toNumber(dueDay);
    if (!(dd >= 1 && dd <= 28)) errors.push("Due day must be 1–28.");

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors.join(" | ") },
        { status: 400 }
      );
    }

    // ── Duplicate roll number check in students collection ─────────────────────────
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
          message: `Roll no ${rd} already exists in Class "${className}" Section "${selectedSection}".`,
        },
        { status: 409 }
      );
    }


    const emailCheckResult = await checkEmailExists(studentEmail.trim().toLowerCase());
    if (emailCheckResult.exists) {
      return NextResponse.json(
        {
          success: false,
          message: emailCheckResult.message || `Email ${studentEmail} already exists in ${emailCheckResult.collection} collection. Please use a different email address.`,
          collection: emailCheckResult.collection,
          role: emailCheckResult.role
        },
        { status: 409 }
      );
    }

    // ── Duplicate student email check ───────────────────────────────────────────────
    const dupStudentEmailSnap = await db
      .collection("students")
      .where("email", "==", studentEmail.trim().toLowerCase())
      .where("schoolId", "==", schoolId)
      .get();

    if (!dupStudentEmailSnap.empty) {
      return NextResponse.json(
        { success: false, message: "Student email already exists in this school." },
        { status: 409 }
      );
    }

    // ── Duplicate parent email check in parents collection ─────────────────────────
    const dupParentEmailSnap = await db
      .collection("parents")
      .where("email", "==", parentEmail.trim().toLowerCase())
      .where("schoolId", "==", schoolId)
      .get();

    if (!dupParentEmailSnap.empty) {
      return NextResponse.json(
        { success: false, message: "Parent email already registered in this school." },
        { status: 409 }
      );
    }

    // ── Generate Custom IDs ────────────────────────────────────────────────────
    const studentId = generateStudentId();
    const parentId = generateParentId();

    // ── Student Payload ───────────────────────────────────────────────────────
    const studentPayload = {
      // Metadata
      studentId: studentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // School Information
      adminId,
      headId,
      schoolId,
      schoolName,
      
      // Teacher Information
      teacherId,
      teacherName,
      
      // Student Information
      role: "student",
      firstName: firstName.trim(),
      lastName: (lastName || "").trim(),
      fullName: `${firstName.trim()} ${(lastName || "").trim()}`.trim(),
      rollNo: rd,
      gender,
      dob: (dob || "").trim(),
      email: studentEmail.trim().toLowerCase(),
      password: studentPassword, // Remember to hash this in production!
      status: "active",
      imageUrl: null,
      
      // Parent Reference
      parentId: parentId,
      parentName: parentName.trim(),
      parentEmail: parentEmail.trim().toLowerCase(),
      parentPhone: onlyDigits(parentPhone),
      
      // Academic Information
      classId: selectedClass,
      className,
      group: group || null,
      section: selectedSection,
      subjects: selectedSubjects,
      
      // Fee Structure
      fee: {
        tuition: toNumber(tuitionFee),
        monthly: toNumber(monthlyFee),
        admissionOneTime: toNumber(admissionFee),
        registration: toNumber(registrationFee),
        security: toNumber(securityFee),
        annual: toNumber(annualFee),
        other: otherFeeLabel?.trim()
          ? { label: otherFeeLabel.trim(), amount: toNumber(otherFeeAmount) }
          : null,
        dueDay: toNumber(dueDay),
        reminder: {
          enabled: !!autoReminder,
          daysBefore: parseInt(reminderDaysBefore, 10) || 0,
          channel: notifyVia || "SMS",
        },
        outstanding: 0,
      },
      
      // Timestamps
      admissionDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    // ── Parent Payload ───────────────────────────────────────────────────────
    const parentPayload = {
      // Metadata
      parentId: parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // School Information
      adminId,
      headId,
      schoolId,
      schoolName,
      
      // Parent Information
      role: "parent",
      name: parentName.trim(),
      email: parentEmail.trim().toLowerCase(),
      password: parentPassword, // Remember to hash this in production!
      phone: onlyDigits(parentPhone),
      address: (parentAddress || "").trim() || null,
      status: "active",
      
      // Student Reference (for multiple children support)
      studentIds: [studentId],
      studentNames: [`${firstName.trim()} ${(lastName || "").trim()}`.trim()],
      
      // Relationship
      relationship: "Parent",
      isPrimaryContact: true,
      
      // Timestamps
      lastUpdated: new Date().toISOString(),
    };

    // ── Save to separate collections ─────────────────────────────────────────────
    await db.collection("students").doc(studentId).set(studentPayload);
    await db.collection("parents").doc(parentId).set(parentPayload);

    // ── Optional: Create reference collection for relationships ──────────────────
    const relationId = `${studentId}_${parentId}`;
    await db.collection("studentParentRelations").doc(relationId).set({
      relationId: relationId,
      studentId: studentId,
      parentId: parentId,
      schoolId: schoolId,
      relationship: "parent-child",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: true,
        studentId: studentId,
        parentId: parentId,
        relationId: relationId,
        message: `${firstName.trim()} successfully admitted. Student saved in students collection and parent saved in parents collection.`,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Admission save error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save. Please try again." },
      { status: 500 }
    );
  }
}

// ===========================================================get studnet=====================================
// ── GET: Fetch all students of a school ─────────────────────────────────────────────
export async function GET(request) {
  try {
    // Get schoolId from query parameters
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    // Validation
    if (!schoolId) {
      return NextResponse.json(
        { success: false, message: "schoolId is required." },
        { status: 400 }
      );
    }

    // Build query - get all students for the school
    const query = db.collection("students").where("schoolId", "==", schoolId);
    
    // Get all students (no pagination, no filters)
    const snapshot = await query.get();

    if (snapshot.empty) {
      return NextResponse.json(
        { 
          success: true, 
          students: [],
          total: 0
        },
        { status: 200 }
      );
    }

    // Format student data (remove sensitive info like password)
    const students = [];
    snapshot.forEach(doc => {
      const studentData = doc.data();
      // Remove sensitive information
      delete studentData.password;
      
      students.push({
        ...studentData,
        id: doc.id
      });
    });

    return NextResponse.json(
      {
        success: true,
        students,
        total: students.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch students. Please try again." },
      { status: 500 }
    );
  }
}