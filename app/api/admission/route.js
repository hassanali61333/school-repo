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


// ═════════════════════════════════════════════════════════════════════════════
// POST — Create admission
// ═════════════════════════════════════════════════════════════════════════════
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      adminId,
      headId,
      schoolId,
      teacherId,
      classId,
      className,
      dob,
      email: studentEmail,
      fee: {
        admissionOneTime,
        dueDay,
        monthly: monthlyFee,
        outstanding,
        previousPending,
        registration,
        annual,
        other
      },
      reminder: {
        channel,
        daysBefore: reminderDaysBefore,
        enabled: autoReminder,
        security,
        tuition
      },
      firstName,
      gender,
      group,
      imageUrl,
      lastName,
      parent: {
        address: parentAddress,
        email: parentEmail,
        password: parentPassword,
        phone: parentPhone,
        father: {
          cnic: fatherCnic,
          mobile: fatherMobile,
          name: fatherName
        },
        mother: {
          cnic: motherCnic,
          mobile: motherMobile,
          name: motherName
        },
      },
      admissionPayment: {
        admissionPaid,
        annualPaid,
        balance,
        depositDate,
        depositStatus,
        month,
        prevPendingPaid,
        registrationPaid,
        remarks,
        securityPaid,
        totalDue,
        totalPaid
      },
      password: studentPassword,
      role,
      religion,
      rollNo,
      schoolName,
      section: selectedSection,
      status,
      teacherName,
      subjects: selectedSubjects
    } = body;

    // ── Derived fields ──────────────────────────────────────────────────────────
    const parentName = `${fatherName || ''} ${motherName || ''}`.trim() || "Parent";
    const selectedClass = classId;
    const admissionFee = admissionOneTime;

    // ── Validation ────────────────────────────────────────────────────────────
    const errors = [];

    // Account validation
    if (!adminId) errors.push("Administrator ID is required");
    if (!headId) errors.push("Head ID is required");
    if (!schoolId) errors.push("School ID is required");
  
    if (!teacherId) errors.push("Teacher Incharge is required");
    

    if (!firstName?.trim()) errors.push("First name is required");

   
    const rd = onlyDigits(rollNo);
    if (!rd) {
      errors.push("Roll number is required");
    } else if (rd.length < 1 || rd.length > 10) {
      errors.push("Roll number must be 1–10 digits");
    }

    // Student email validation
    if (!studentEmail) {
      errors.push("Student email is required");
    } else if (!studentEmail.includes("@")) {
      errors.push("Valid student email is required");
    }
    

    if (!studentPassword) {
      errors.push("Student password is required");
    } else if (String(studentPassword).length < 6) {
      errors.push("Student password must be at least 6 characters");
    }

    // Parent validation
    if (!parentName?.trim()) errors.push("Parent name is required");
    
    if (!parentPhone) {
      errors.push("Parent phone is required");
    } else {
      const pd = onlyDigits(parentPhone);
      if (pd.length < 10 || pd.length > 14) {
        errors.push("Parent phone must be 10–14 digits");
      }
    }
    
    if (!parentEmail) {
      errors.push("Parent email is required");
    } else if (!parentEmail.includes("@")) {
      errors.push("Valid parent email is required");
    }

    // Class & section validation
    if (!selectedClass) errors.push("Class is required");
    if (!selectedSection) errors.push("Section is required");

    // Subjects validation
    if (!Array.isArray(selectedSubjects) || selectedSubjects.length === 0) {
      errors.push("Select at least one subject");
    }

    // Fee validation
    if (toNumber(monthlyFee) <= 0) {
      errors.push("Monthly fee must be greater than 0");
    }

    // Due day validation
    const dd = toNumber(dueDay);
    if (!(dd >= 1 && dd <= 28)) {
      errors.push("Due day must be between 1 and 28");
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors.join(". ") },
        { status: 400 }
      );
    }

    const normalizedStudentEmail = studentEmail.trim().toLowerCase();
    const normalizedParentEmail = parentEmail.trim().toLowerCase();

    // ── Student/parent email must not be the same ─────────────────────────────
    if (normalizedStudentEmail === normalizedParentEmail) {
      return NextResponse.json(
        { success: false, message: "Student and parent email cannot be the same" },
        { status: 409 }
      );
    }

    // ── Check student email across all collections ────────────────────────────
    const emailCheckResult = await checkEmailExists(normalizedStudentEmail);
    if (emailCheckResult.exists) {
      return NextResponse.json(
        {
          success: false,
          message: emailCheckResult.message || `Email ${normalizedStudentEmail} is already in use`,
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
        { success: false, message: "This student email already exists in this school" },
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
          message: `Roll number ${rd} already exists in ${className || selectedClass} - Section ${selectedSection}`,
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
      if (!resolvedParentPassword) {
        return NextResponse.json(
          {
            success: false,
            message: "New parent account requires a password of at least 8 characters",
          },
          { status: 400 }
        );
      }
      if (resolvedParentPassword.length < 8) {
        return NextResponse.json(
          {
            success: false,
            message: "Parent password must be at least 8 characters",
          },
          { status: 400 }
        );
      }
    }

    // ── Build Firestore document ──────────────────────────────────────────────
    const newStudentId = generateStudentId();
    const currentTimestamp = new Date().toISOString();

    // Fee sub-object
    const feeObj = {
      admissionOneTime: toNumber(admissionFee),
      dueDay: toNumber(dueDay),
      monthly: toNumber(monthlyFee),
      outstanding: toNumber(outstanding) || 0,
      previousPending: toNumber(previousPending) || 0,
      registration: toNumber(registration) || 0,
      annual: toNumber(annual) || 0,
      other: toNumber(other) || 0,
      reminder: {
        enabled: !!autoReminder,
        daysBefore: parseInt(String(reminderDaysBefore), 10) || 0,
        channel: channel || "WhatsApp",
        security: security || false,
        tuition: tuition || false
      },
    };

    // Parent sub-object with complete information
    const parentObj = {
      name: parentName.trim(),
      phone: onlyDigits(parentPhone),
      email: normalizedParentEmail,
      address: parentAddress?.trim() || "",
      father: {
        name: fatherName || "",
        cnic: fatherCnic || "",
        mobile: fatherMobile || ""
      },
      mother: {
        name: motherName || "",
        cnic: motherCnic || "",
        mobile: motherMobile || ""
      }
    };
    
    if (resolvedParentPassword) parentObj.password = resolvedParentPassword;

    // Admission payment object
    const admissionPaymentObj = {
      admissionPaid: toNumber(admissionPaid) || 0,
      annualPaid: toNumber(annualPaid) || 0,
      balance: toNumber(balance) || 0,
      depositDate: depositDate || null,
      depositStatus: depositStatus || "pending",
      month: month || null,
      prevPendingPaid: toNumber(prevPendingPaid) || 0,
      registrationPaid: toNumber(registrationPaid) || 0,
      remarks: remarks || "",
      securityPaid: toNumber(securityPaid) || 0,
      totalDue: toNumber(totalDue) || 0,
      totalPaid: toNumber(totalPaid) || 0
    };

    const studentDoc = {
      studentId: newStudentId,
      adminId,
      headId,
      schoolId,
      schoolName: schoolName || "",
      teacherId,
      teacherName: teacherName || "",
      role: role || "student",
      status: status || "active",
      firstName: firstName.trim(),
      lastName: (lastName || "").trim(),
      rollNo: rd,
      gender: gender || "",
      dob: dob || "",
      religion: religion || "",
      email: normalizedStudentEmail,
      password: studentPassword,
      imageUrl: imageUrl || null,
      group: group || null,
      parent: parentObj,
      classId: selectedClass,
      className: className || selectedClass,
      section: selectedSection,
      subjects: selectedSubjects || [],
      fee: feeObj,
      admissionPayment: admissionPaymentObj,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp
    };

    // ── Save to Firestore ─────────────────────────────────────────────────────
    await db.collection("students").doc(newStudentId).set(studentDoc);

    return NextResponse.json(
      {
        success: true,
        studentId: newStudentId,
        message: `${firstName.trim()} has been successfully admitted`,
        data: {
          studentId: newStudentId,
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
      { success: false, message: "Failed to save student record. Please try again." },
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
    // URL se schoolId lo
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");

    console.log("School ID:", schoolId);

    // Agar schoolId nahi aya
    if (!schoolId) {
      return NextResponse.json(
        {
          success: false,
          message: "schoolId is required",
        },
        { status: 400 }
      );
    }

    // schoolId ke according students fetch karo
    const snapshot = await db
      .collection("students")
      .where("schoolId", "==", schoolId)
      .get();

    console.log("Students found:", snapshot.size);

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        students: [],
        total: 0,
        message: "No students found",
      });
    }

    const students = snapshot.docs.map((doc) => {
      const data = {
        id: doc.id,
        ...doc.data(),
      };

      // sensitive data remove
      delete data.password;

      if (data.parent?.password) {
        delete data.parent.password;
      }

      return data;
    });

    return NextResponse.json({
      success: true,
      total: students.length,
      students,
    });

  } catch (error) {
    console.error("Admission GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch students: " + error.message,
      },
      { status: 500 }
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// PUT — Update student
// ═════════════════════════════════════════════════════════════════════════════
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const body = await request.json();
    console.log("data", body);
    
    const {
      adminId,
      headId,
      schoolId,
      teacherId,
      classId,
      className,
      dob,
      email: studentEmail,
      fee: {
        admissionOneTime,
        dueDay,
        monthly: monthlyFee,
        outstanding,
        previousPending,
        registration,
        annual,
        other
      },
      reminder: {
        channel,
        daysBefore: reminderDaysBefore,
        enabled: autoReminder,
        security,
        tuition
      },
      firstName,
      gender,
      group,
      imageUrl,
      lastName,
      parent: {
        address: parentAddress,
        email: parentEmail,
        password: parentPassword,
        phone: parentPhone,
        father: {
          cnic: fatherCnic,
          mobile: fatherMobile,
          name: fatherName
        },
        mother: {
          cnic: motherCnic,
          mobile: motherMobile,
          name: motherName
        }
      },
      admissionPayment: {
        admissionPaid,
        annualPaid,
        balance,
        depositDate,
        depositStatus,
        month,
        prevPendingPaid,
        registrationPaid,
        remarks,
        securityPaid,
        totalDue,
        totalPaid
      },
      password: studentPassword,
      role,
      religion,
      rollNo,
      schoolName,
      section: selectedSection,
      status,
      teacherName,
      subjects: selectedSubjects
    } = body;

    // ── Validation ────────────────────────────────────────────────────────────
    const errors = [];
    
    if (!studentId) errors.push("Student ID is required");
    if (!schoolId) errors.push("School ID is required");
    if (!adminId) errors.push("Admin ID is required");
    if (!headId) errors.push("Head ID is required");
    if (!firstName?.trim()) errors.push("First name is required");
    if (!teacherId) errors.push("Teacher Incharge is required");
    
    const rd = onlyDigits(rollNo);
    if (!rd || rd.length < 1 || rd.length > 10) {
      errors.push("Roll number must be 1–10 digits");
    }
    
    if (!studentEmail || !studentEmail.includes("@")) {
      errors.push("Valid student email required");
    }
    
    if (studentPassword && studentPassword.length < 6) {
      errors.push("Student password must be at least 6 characters");
    }
    
    
    const pd = onlyDigits(parentPhone);
    if (pd.length < 10 || pd.length > 14) {
      errors.push("Parent phone must be 10–14 digits");
    }
    
    if (!parentEmail || !parentEmail.includes("@")) {
      errors.push("Valid parent email required");
    }
    
    if (!classId) errors.push("Class is required");
    if (!selectedSection) errors.push("Section is required");
    
    if (!Array.isArray(selectedSubjects) || selectedSubjects.length === 0) {
      errors.push("Select at least one subject");
    }
    
    if (toNumber(monthlyFee) <= 0) errors.push("Monthly fee must be greater than 0");
    
    const dd2 = toNumber(dueDay);
    if (!(dd2 >= 1 && dd2 <= 28)) errors.push("Due day must be between 1 and 28");

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors.join(" | ") }, 
        { status: 400 }
      );
    }

    // ── Student must exist ────────────────────────────────────────────────────
    const studentRef = db.collection("students").doc(studentId);
    const studentSnap = await studentRef.get();
    
    if (!studentSnap.exists) {
      return NextResponse.json(
        { success: false, message: "Student not found" }, 
        { status: 404 }
      );
    }
    
    const existingData = studentSnap.data();

    // ── Duplicate roll check (excluding current student) ──────────────────────
    const dupRollSnap = await db
      .collection("students")
      .where("rollNo", "==", rd)
      .where("classId", "==", classId)
      .where("section", "==", selectedSection)
      .where("schoolId", "==", schoolId)
      .get();

    if (!dupRollSnap.empty && dupRollSnap.docs.some((d) => d.id !== studentId)) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Roll number ${rd} already exists in ${className || classId} - Section ${selectedSection}` 
        },
        { status: 409 }
      );
    }

    // ── Check email duplicate (excluding current student) ─────────────────────
    if (studentEmail && studentEmail !== existingData.email) {
      const normalizedNewEmail = studentEmail.trim().toLowerCase();
      const emailCheckResult = await checkEmailExists(normalizedNewEmail);
      
      if (emailCheckResult.exists) {
        return NextResponse.json(
          {
            success: false,
            message: `Email ${normalizedNewEmail} is already in use by another ${emailCheckResult.role || 'user'}`
          },
          { status: 409 }
        );
      }
      
      const dupEmailSnap = await db
        .collection("students")
        .where("email", "==", normalizedNewEmail)
        .where("schoolId", "==", schoolId)
        .get();
      
      if (!dupEmailSnap.empty && dupEmailSnap.docs.some((d) => d.id !== studentId)) {
        return NextResponse.json(
          { success: false, message: "This email is already used by another student in this school" },
          { status: 409 }
        );
      }
    }

    // ── Build parent object with mother and father ───────────────────────────
    const parentUpdate = {
      name: fatherName || existingData.parent?.name || "",
      phone: onlyDigits(parentPhone) || existingData.parent?.phone || "",
      email: parentEmail.trim().toLowerCase() || existingData.parent?.email || "",
      address: parentAddress?.trim() || existingData.parent?.address || "",
      father: {
        name: fatherName || existingData.parent?.father?.name || "",
        cnic: fatherCnic || existingData.parent?.father?.cnic || "",
        mobile: fatherMobile || existingData.parent?.father?.mobile || ""
      },
      mother: {
        name: motherName || existingData.parent?.mother?.name || "",
        cnic: motherCnic || existingData.parent?.mother?.cnic || "",
        mobile: motherMobile || existingData.parent?.mother?.mobile || ""
      }
    };
    
    if (parentPassword && parentPassword.length >= 6) {
      parentUpdate.password = parentPassword;
    } else if (existingData.parent?.password) {
      parentUpdate.password = existingData.parent.password;
    }

    // ── Build fee object with all fields ──────────────────────────────────────
    const feeUpdate = {
      admissionOneTime: toNumber(admissionOneTime) || existingData.fee?.admissionOneTime || 0,
      dueDay: toNumber(dueDay) || existingData.fee?.dueDay || 5,
      monthly: toNumber(monthlyFee) || existingData.fee?.monthly || 0,
      outstanding: toNumber(outstanding) || existingData.fee?.outstanding || 0,
      previousPending: toNumber(previousPending) || existingData.fee?.previousPending || 0,
      registration: toNumber(registration) || existingData.fee?.registration || 0,
      annual: toNumber(annual) || existingData.fee?.annual || 0,
      other: toNumber(other) || existingData.fee?.other || 0,
      reminder: {
        enabled: autoReminder !== undefined ? !!autoReminder : existingData.fee?.reminder?.enabled || false,
        daysBefore: reminderDaysBefore !== undefined ? parseInt(String(reminderDaysBefore), 10) : existingData.fee?.reminder?.daysBefore || 3,
        channel: channel || existingData.fee?.reminder?.channel || "WhatsApp",
        security: security !== undefined ? security : existingData.fee?.reminder?.security || false,
        tuition: tuition !== undefined ? tuition : existingData.fee?.reminder?.tuition || false
      }
    };

    // ── Build admission payment object ────────────────────────────────────────
    const admissionPaymentUpdate = {
      admissionPaid: toNumber(admissionPaid) || existingData.admissionPayment?.admissionPaid || 0,
      annualPaid: toNumber(annualPaid) || existingData.admissionPayment?.annualPaid || 0,
      balance: toNumber(balance) || existingData.admissionPayment?.balance || 0,
      depositDate: depositDate || existingData.admissionPayment?.depositDate || null,
      depositStatus: depositStatus || existingData.admissionPayment?.depositStatus || "pending",
      month: month || existingData.admissionPayment?.month || null,
      prevPendingPaid: toNumber(prevPendingPaid) || existingData.admissionPayment?.prevPendingPaid || 0,
      registrationPaid: toNumber(registrationPaid) || existingData.admissionPayment?.registrationPaid || 0,
      remarks: remarks || existingData.admissionPayment?.remarks || "",
      securityPaid: toNumber(securityPaid) || existingData.admissionPayment?.securityPaid || 0,
      totalDue: toNumber(totalDue) || existingData.admissionPayment?.totalDue || 0,
      totalPaid: toNumber(totalPaid) || existingData.admissionPayment?.totalPaid || 0
    };

    // ── Update payload with all fields ────────────────────────────────────────
    const updateData = {
      // Basic info
      firstName: firstName.trim(),
      lastName: (lastName || "").trim(),
      rollNo: rd,
      gender: gender || existingData.gender || "",
      dob: dob || existingData.dob || "",
      religion: religion || existingData.religion || "",
      email: studentEmail ? studentEmail.trim().toLowerCase() : existingData.email,
      
      // School info
      schoolId: schoolId || existingData.schoolId,
      adminId: adminId || existingData.adminId,
      headId: headId || existingData.headId,
      schoolName: schoolName || existingData.schoolName || "",
      
      // Teacher info
      teacherId: teacherId || existingData.teacherId,
      teacherName: teacherName || existingData.teacherName || "",
      
      // Class info
      classId: classId,
      className: className || classId,
      section: selectedSection,
      group: group || existingData.group || null,
      subjects: selectedSubjects,
      
      // Role and status
      role: role || existingData.role || "student",
      status: status || existingData.status || "active",
      
      // Parent, fee, payment
      parent: parentUpdate,
      fee: feeUpdate,
      admissionPayment: admissionPaymentUpdate,
      
      // Optional fields
      imageUrl: imageUrl !== undefined ? imageUrl : existingData.imageUrl,
      
      // Update timestamp
      updatedAt: new Date().toISOString()
    };

    // Add password only if provided
    if (studentPassword && studentPassword.length >= 6) {
      updateData.password = studentPassword;
    }

    // Remove any undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // ── Update Firestore ──────────────────────────────────────────────────────
    await studentRef.update(updateData);

    // ── Fetch and return updated student ──────────────────────────────────────
    const updatedDoc = await studentRef.get();
    const result = { id: updatedDoc.id, ...updatedDoc.data() };
    
    // Remove sensitive data
    delete result.password;
    if (result.parent?.password) delete result.parent.password;

    return NextResponse.json({ 
      success: true, 
      message: "Student updated successfully", 
      student: result 
    });
    
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