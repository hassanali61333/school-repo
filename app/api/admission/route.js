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
        message: `${firstName.trim()} successfully admitted `,
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



//========================================================update student==============================================

// ── UPDATE: Student ─────────────────────────────────────────────
// app/api/admission/route.js
// Add this PUT function alongside your existing POST and GET

export async function PUT(request) {
  try {
    const body = await request.json();

    const {
      studentId,
      schoolId,
      firstName,
      lastName,
      rollNo,
      gender,
      dob,
      studentEmail,
      studentPassword,

      parentName,
      parentPhone,
      parentEmail,
      parentPassword,
      parentAddress,

      selectedClass,
      className,
      selectedSection,
      group,
      selectedSubjects,

      tuitionFee,
      monthlyFee,
      admissionFee,
      registrationFee,
      securityFee,
      annualFee,
      otherFeeLabel,
      otherFeeAmount,

      dueDay,
      autoReminder,
      reminderDaysBefore,
      notifyVia,
    } = body;

    // ── Validation ─────────────────────────────
    const errors = [];

    if (!studentId || !schoolId) {
      errors.push("studentId and schoolId are required.");
    }

    if (!firstName?.trim()) errors.push("First name is required.");

    const rd = onlyDigits(rollNo);
    if (!rd || rd.length < 1 || rd.length > 10)
      errors.push("Roll number must be 1–10 digits.");

    if (!studentEmail || !studentEmail.includes("@"))
      errors.push("Valid student email required.");

    if (studentPassword && studentPassword.length < 6)
      errors.push("Student password must be at least 6 characters.");

    if (!parentName?.trim()) errors.push("Parent name is required.");

    const pd = onlyDigits(parentPhone);
    if (pd.length < 10 || pd.length > 14)
      errors.push("Parent phone must be 10–14 digits.");

    if (!parentEmail || !parentEmail.includes("@"))
      errors.push("Valid parent email required.");

    if (parentPassword && parentPassword.length < 6)
      errors.push("Parent password must be at least 6 characters.");

    if (!selectedClass) errors.push("Class is required.");
    if (!selectedSection) errors.push("Section is required.");
    if (!selectedSubjects || selectedSubjects.length === 0)
      errors.push("Select at least one subject.");

    if (toNumber(monthlyFee) <= 0)
      errors.push("Monthly fee must be greater than 0.");

    const dd = toNumber(dueDay);
    if (!(dd >= 1 && dd <= 28))
      errors.push("Due day must be between 1–28.");

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors.join(" | ") },
        { status: 400 }
      );
    }

    // ── Check student exists ─────────────────────
    const studentRef = db.collection("students").doc(studentId);
    const studentSnap = await studentRef.get();

    if (!studentSnap.exists) {
      return NextResponse.json(
        { success: false, message: "Student not found." },
        { status: 404 }
      );
    }

    // ── Duplicate roll check ─────────────────────
    const dupRollSnap = await db
      .collection("students")
      .where("rollNo", "==", rd)
      .where("classId", "==", selectedClass)
      .where("section", "==", selectedSection)
      .where("schoolId", "==", schoolId)
      .get();

    const isSameStudent = dupRollSnap.docs.every(
      (doc) => doc.id === studentId
    );

    if (!dupRollSnap.empty && !isSameStudent) {
      return NextResponse.json(
        {
          success: false,
          message: `Roll no ${rd} already exists in this class/section.`,
        },
        { status: 409 }
      );
    }

    // ── Build update payload ─────────────────────
    const updateData = {
      updatedAt: new Date().toISOString(),

      firstName: firstName.trim(),
      lastName: (lastName || "").trim(),
      fullName: `${firstName.trim()} ${(lastName || "").trim()}`.trim(),

      rollNo: rd,
      gender,
      dob: (dob || "").trim(),

      email: studentEmail.trim().toLowerCase(),
      ...(studentPassword ? { password: studentPassword } : {}),

      parentName: parentName.trim(),
      parentEmail: parentEmail.trim().toLowerCase(),
      parentPhone: onlyDigits(parentPhone),

      classId: selectedClass,
      className,
      section: selectedSection,
      group: group || null,
      subjects: selectedSubjects,

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
      },
    };

    // ── Update parent document if needed ─────────────────────────
    const existingData = studentSnap.data();
    const parentId = existingData.parentId;
    
    if (parentId && (parentName || parentPhone || parentEmail || parentPassword || parentAddress)) {
      const parentRef = db.collection("parents").doc(parentId);
      const parentUpdate = {
        updatedAt: new Date().toISOString(),
        name: parentName?.trim() || existingData.parentName,
        phone: onlyDigits(parentPhone) || existingData.parentPhone,
        email: parentEmail?.trim().toLowerCase() || existingData.parentEmail,
        ...(parentPassword ? { password: parentPassword } : {}),
        ...(parentAddress ? { address: parentAddress.trim() } : {})
      };
      await parentRef.update(parentUpdate);
    }

    // ── Update student ───────────────────────────
    await studentRef.update(updateData);

    const updatedSnap = await studentRef.get();
    const updatedData = updatedSnap.data();
    delete updatedData.password; // Remove sensitive data

    return NextResponse.json(
      {
        success: true,
        message: "Student updated successfully.",
        student: {
          id: updatedSnap.id,
          ...updatedData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update student error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update student: " + error.message },
      { status: 500 }
    );
  }

}


//========================================================delete student==============================================

// app/api/admission/route.js
// Add this DELETE function alongside your POST and GET

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    console.log("=== DELETE API CALLED ===");
    console.log("Student ID to delete:", studentId);

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "studentId is required" },
        { status: 400 }
      );
    }

    // Get student data first
    const studentRef = db.collection("students").doc(studentId);
    const studentDoc = await studentRef.get();
    
    if (!studentDoc.exists) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    const studentData = studentDoc.data();
    const parentId = studentData.parentId;
    const schoolId = studentData.schoolId;
    const studentName = studentData.fullName || studentData.firstName;
    const rollNo = studentData.rollNo;
    
    // Start batch operation
    const batch = db.batch();

    // 1. Delete student document
    batch.delete(studentRef);

    // 2. Delete student-parent relationship
    const relationId = `${studentId}_${parentId}`;
    const relationRef = db.collection("studentParentRelations").doc(relationId);
    const relationDoc = await relationRef.get();
    if (relationDoc.exists) {
      batch.delete(relationRef);
    }

    // 3. Update or delete parent document
    if (parentId) {
      const parentRef = db.collection("parents").doc(parentId);
      const parentDoc = await parentRef.get();
      
      if (parentDoc.exists) {
        const parentData = parentDoc.data();
        const studentIds = (parentData.studentIds || []).filter(id => id !== studentId);
        const studentNames = (parentData.studentNames || []).filter(name => name !== studentName);
        
        if (studentIds.length === 0) {
          // If no more children, delete the parent
          batch.delete(parentRef);
        } else {
          // Update parent's student lists
          batch.update(parentRef, {
            studentIds: studentIds,
            studentNames: studentNames,
            updatedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          });
        }
      }
    }

    // 4. Delete related records
    const collectionsToClean = [
      "fees", "attendance", "examResults", "payments", "feeChallans"
    ];

    for (const collectionName of collectionsToClean) {
      const snapshot = await db
        .collection(collectionName)
        .where("studentId", "==", studentId)
        .where("schoolId", "==", schoolId)
        .get();
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
    }

    // Execute all deletions
    await batch.commit();

    console.log(`Successfully deleted: ${studentName} (Roll No: ${rollNo})`);

    return NextResponse.json(
      {
        success: true,
        message: `${studentName} (Roll No: ${rollNo}) deleted successfully along with all related data`,
        deletedStudentId: studentId,
        deletedStudentName: studentName,
        deletedRollNo: rollNo
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to delete student: " + error.message 
      },
      { status: 500 }
    );
  }
}