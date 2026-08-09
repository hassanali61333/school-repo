// app/api/payroll-report/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

const COLLECTION = "PayrollReports";

function buildDocId(schoolId, monthKey) {
  return `${schoolId}_${monthKey}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      schoolId,
      monthKey, 
      monthLabel, 
      adminId,
      headId,
      generatedBy,
      staff = [],
      teachers = [],
      staffCount,
      staffTotal,
      teacherCount,
      teacherTotal,
      totalExpense,
    } = body;

    if (!schoolId || !monthKey) {
      return NextResponse.json(
        { error: "schoolId and monthKey are required" },
        { status: 400 }
      );
    }

    const docId = buildDocId(schoolId, monthKey);
    const docRef = db.collection(COLLECTION).doc(docId);
    const existingSnap = await docRef.get();
    const isUpdate = existingSnap.exists;

    const now = new Date().toISOString();

    const sumSalary = (arr) =>
      arr.reduce((sum, p) => sum + Number(p.salary || 0), 0);

    const payload = {
      schoolId,
      monthKey,
      monthLabel,
      adminId: adminId || null,
      headId: headId || null,
      generatedBy: generatedBy || null,
      staff,
      teachers,
      staffCount: staffCount ?? staff.length,
      staffTotal: staffTotal ?? sumSalary(staff),
      teacherCount: teacherCount ?? teachers.length,
      teacherTotal: teacherTotal ?? sumSalary(teachers),
      totalExpense: totalExpense ?? sumSalary(staff) + sumSalary(teachers),
      generatedAt: now,
      createdAt: isUpdate ? existingSnap.data().createdAt || now : now,
      updatedAt: now,
    };


    await docRef.set(payload);

    return NextResponse.json({
      message: isUpdate ? "Payroll report updated" : "Payroll report saved",
      docId,
      updated: isUpdate,
      data: payload,
    });
  } catch (err) {
    console.error("Payroll report save error:", err);
    return NextResponse.json(
      { error: "Failed to save payroll report" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("schoolId");
    const monthlabel = searchParams.get("monthlabel");
    const list = searchParams.get("list");

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId is required" },
        { status: 400 }
      );
    }

    if (list === "true") {
      const snap = await db
        .collection(COLLECTION)
        .where("schoolId", "==", schoolId)
        .orderBy("monthKey", "desc")
        .get();

      const months = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          monthKey: d.monthKey,
          monthLabel: d.monthLabel,
          totalExpense: d.totalExpense,
          generatedAt: d.generatedAt,
        };
      });

      return NextResponse.json({ data: months });
    }

    // Single month's full report, looked up by monthLabel
    if (monthlabel) {
      const snap = await db
        .collection(COLLECTION)
        .where("schoolId", "==", schoolId)
        .where("monthLabel", "==", monthlabel)
        .limit(1)
        .get();

      const doc = snap.docs[0];
      return NextResponse.json({ data: doc ? doc.data() : null });
    }

    return NextResponse.json(
      { error: "Provide monthlabel or list=true" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Payroll report fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch payroll report" },
      { status: 500 }
    );
  }
}