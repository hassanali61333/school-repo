import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { checkEmailExists } from '@/lib/checkmail';


/* ── helpers ── */
function buildDocId(cnic) {
  return `STAFF_${cnic.replace(/-/g, '')}`;
}

function validatePayload({ name, phone, cnic, salary, email, password, confirmPassword, adminId, schoolId }) {
  const cnicRegex  = /^\d{5}-\d{7}-\d{1}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name?.trim())                                         return 'Full Name is required.';
  if (!phone || phone.length !== 11 || !phone.startsWith('03')) return 'Invalid Pakistani phone (e.g. 03XXXXXXXXX).';
  if (!cnicRegex.test(cnic))                                 return 'Invalid CNIC format (XXXXX-XXXXXXX-X).';
  if (!salary)                                               return 'Salary is required.';
  if (!emailRegex.test(email))                               return 'Invalid email address.';
  if (password && password.length < 8)                       return 'Password must be at least 8 characters.';
  if (password && password !== confirmPassword)              return 'Passwords do not match.';
  if (!adminId || !schoolId)                                 return 'Admin/School info missing.';
  return null;
}

/* ────────────────────────────────────────────────────────────
   GET /api/staff?schoolId=xxx
   Returns all staff for a school.
──────────────────────────────────────────────────────────── */
export async function GET(req) {
  const { searchParams } = req.nextUrl;
  const schoolId = searchParams.get('schoolId');

  if (!schoolId) {
    return NextResponse.json({ success: false, error: 'schoolId is required' }, { status: 400 });
  }

  try {
    const snap = await db.collection("SchoolStaff").where('schoolId', '==', schoolId).get();
    const staff = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data: staff });
  } catch (err) {
    console.error('[GET /api/staff]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

/* ──────────────────────────────────────────────────────────
   POST /api/staff  – create new staff member
──────────────────────────────────────────────────────────── */
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name, phone, cnic, salary, address = '',
      email, password, confirmPassword,
      joiningDate, designation, adminId, headId = '',
      schoolId, schoolName = '',
    } = body;

    const err = validatePayload({ name, phone, cnic, salary, email, password, confirmPassword, adminId, schoolId });
    if (err) return NextResponse.json({ success: false, error: err }, { status: 400 });

    const docId = buildDocId(cnic);

    // Prevent duplicates
    const existing = await db.collection("SchoolStaff").doc(docId).get();
    if (existing.exists) {
      return NextResponse.json({ success: false, error: 'Staff with this CNIC already exists.' }, { status: 409 });
    }

    // Check if email exists in any collection
    const emailCheck = await checkEmailExists(email);
    if (emailCheck.exists) {    
      return NextResponse.json(
        {
          success: false,
          error: emailCheck.message || `Email ${email} already exists in ${emailCheck.collection} collection. Please use a different email address.`,
          collection: emailCheck.collection,  
          role: emailCheck.role
        },
        { status: 409 }
      );
    }
    const payload = {
      docId,
      adminId,
      headId,
      schoolId,
      schoolName,
      fullName:    name.trim(),
      email:       email.trim(),
      phoneNumber: phone,
      cnic,
      salary:      Number(salary),
      address:     address.trim(),
      designation,
      joiningDate: joiningDate || new Date().toISOString(),
      password,   // In production: hash this before storing
      role:        'staff',
      status:      'active',
      createdAt:   new Date().toISOString(),
    };

    await db.collection("SchoolStaff").doc(docId).set(payload);
    return NextResponse.json({ success: true, data: { id: docId, ...payload } }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/staff]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

/* ────────────────────────────────────────────────────────────
   PUT /api/staff  – update staff member
   Body must include `docId`
──────────────────────────────────────────────────────────── */
export async function PUT(req) {
  try {
    const body = await req.json();
    const { docId, name, phone, cnic, salary, address, email, designation, joiningDate, status } = body;

    if (!docId) return NextResponse.json({ success: false, error: 'docId is required' }, { status: 400 });

    const ref = db.collection("SchoolStaff").doc(docId);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ success: false, error: 'Staff not found' }, { status: 404 });

    const updates = {
      ...(name        && { fullName:     name.trim()   }),
      ...(phone       && { phoneNumber:  phone         }),
      ...(cnic        && { cnic                        }),
      ...(salary      && { salary:       Number(salary)}),
      ...(address     !== undefined && { address: address.trim() }),
      ...(email       && { email:        email.trim()  }),
      ...(designation && { designation                 }),
      ...(joiningDate && { joiningDate                 }),
      ...(status      && { status                      }),
      updatedAt: new Date().toISOString(),
    };

    await ref.update(updates);
    return NextResponse.json({ success: true, data: { docId, ...updates } });
  } catch (err) {
    console.error('[PUT /api/staff]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

/* ────────────────────────────────────────────────────────────
   DELETE /api/staff?docId=STAFF_xxx
──────────────────────────────────────────────────────────── */
export async function DELETE(req) {
  const { searchParams } = req.nextUrl;
  const docId = searchParams.get('docId');

  if (!docId) return NextResponse.json({ success: false, error: 'docId is required' }, { status: 400 });

  try {
    const ref  = db.collection("SchoolStaff").doc(docId);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ success: false, error: 'Staff not found' }, { status: 404 });

    await ref.delete();
    return NextResponse.json({ success: true, message: 'Staff deleted successfully.' });
  } catch (err) {
    console.error('[DELETE /api/staff]', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}