import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebaseAdmin";

// This file lives at app/api/expenses/[[...id]]/route.js (optional catch-all),
// so ONE file handles both:
//   /api/expenses        -> params.id is undefined
//   /api/expenses/:id    -> params.id is ["theId"]

const CATEGORIES = ["Utilities", "Maintenance", "Supplies"];

function serialize(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
  };
}

function getId(params) {
  return params?.id?.[0] ?? null;
}

function validateExpenseFields(body, { partial }) {
  const errors = [];
  const updates = {};

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      errors.push("name is required");
    } else {
      updates.name = body.name.trim();
    }
  }

  if (!partial || body.amount !== undefined) {
    const numericAmount = Number(body.amount);
    if (!body.amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      errors.push("amount must be a positive number");
    } else {
      updates.amount = numericAmount;
    }
  }

  if (!partial || body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) {
      errors.push(`category must be one of: ${CATEGORIES.join(", ")}`);
    } else {
      updates.category = body.category;
    }
  }

  // description is always optional
  if (body.description !== undefined) {
    updates.description = typeof body.description === "string" ? body.description.trim() : "";
  } else if (!partial) {
    updates.description = "";
  }

  return { errors, updates };
}

// ---------------------------------------------------------------------
// GET /api/expenses?schoolId=...   -> list
// GET /api/expenses/:id            -> single
// ---------------------------------------------------------------------
export async function GET(request, { params }) {
  const id = getId(params);

  try {
    // Get single expense by ID
    if (id) {
      const doc = await db.collection("SchoolExpenses").doc(id).get();

      if (!doc.exists) {
        return NextResponse.json(
          { error: "Expense not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        expense: serialize(doc),
      });
    }

    // Get all expenses of a school
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId query param is required" },
        { status: 400 }
      );
    }

    const snap = await db
      .collection("SchoolExpenses")
      .where("schoolId", "==", schoolId)
      .get();

    return NextResponse.json({
      expenses: snap.docs.map(serialize),
    });
  } catch (err) {
    console.error("GET /api/expenses failed:", err);

    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------
// POST /api/expenses
// body: { name, amount, category, description?, schoolId }
// ---------------------------------------------------------------------
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { errors, updates } = validateExpenseFields(body, { partial: false });
  if (!body.schoolId || typeof body.schoolId !== "string") {
    errors.push("schoolId is required");
  }
  if (errors.length) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }

  try {
    const now = FieldValue.serverTimestamp();
    const docRef = await db.collection("SchoolExpenses").add({
      ...updates,
      date: now,
      createdAt: now,
      schoolId: body.schoolId,
    });
    const saved = await docRef.get();
    return NextResponse.json({ expense: serialize(saved) }, { status: 201 });
  } catch (err) {
    console.error("POST /api/expenses failed:", err);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------
// PUT /api/expenses/:id
// Full replace: name, amount, category all required. description optional.
// ---------------------------------------------------------------------
export async function PUT(request, { params }) {
  const id = getId(params);
  if (!id) {
    return NextResponse.json({ error: "An id is required for PUT" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { errors, updates } = validateExpenseFields(body, { partial: false });
  if (errors.length) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }

  try {
    const ref = db.collection("SchoolExpenses").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    await ref.set(updates, { merge: true }); // keeps schoolId/date/createdAt intact
    const updated = await ref.get();
    return NextResponse.json({ expense: serialize(updated) });
  } catch (err) {
    console.error(`PUT /api/expenses/${id} failed:`, err);
    return NextResponse.json({ error: "Failed to replace expense" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------
// PATCH /api/expenses/:id
// Partial update: any subset of name, amount, category, description.
// ---------------------------------------------------------------------
export async function PATCH(request, { params }) {
  const id = getId(params);
  if (!id) {
    return NextResponse.json({ error: "An id is required for PATCH" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { errors, updates } = validateExpenseFields(body, { partial: true });
  if (errors.length) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  try {
    const ref = db.collection("SchoolExpenses").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    await ref.update(updates);
    const updated = await ref.get();
    return NextResponse.json({ expense: serialize(updated) });
  } catch (err) {
    console.error(`PATCH /api/expenses/${id} failed:`, err);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------
// DELETE /api/expenses/:id
// ---------------------------------------------------------------------
export async function DELETE(_request, { params }) {
  const id = getId(params);
  if (!id) {
    return NextResponse.json({ error: "An id is required for DELETE" }, { status: 400 });
  }

  try {
    const ref = db.collection("SchoolExpenses").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`DELETE /api/expenses/${id} failed:`, err);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}