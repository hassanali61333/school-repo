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
    const staff = snap.docs.map(doc => {
      const data = doc.data();
      // Return exactly as stored in Firestore
      return {
        id: doc.id,
        ...data
      };
    });
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
      // Account & school
      adminId,
      headId = '',
      schoolId,
      schoolName = '',
      
      // Staff basic - MATCHING EXACT FIELD NAMES from your data
      fullName,
      email,
      phoneNumber,
      cnic,
      password,
      confirmPassword,
      
      // Staff details
      designation,
      salary,
      address = '',
      joiningDate,
      status = 'active',
      
      // Optional fields
      cnic: cnicFromBody, // Already have cnic above
    } = body;

    // Use fullName as name for validation
    const name = fullName;
    const phone = phoneNumber;
    
    const err = validatePayload({ 
      name, phone, cnic, salary, email, password, confirmPassword, adminId, schoolId 
    });
    
    if (err) {
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const docId = buildDocId(cnic);

    // Prevent duplicates
    const existing = await db.collection("SchoolStaff").doc(docId).get();
    if (existing.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'Staff with this CNIC already exists.' 
      }, { status: 409 });
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
    
    // Create payload with EXACT field names matching your Firestore data
    const payload = {
      docId,
      adminId,
      headId,
      schoolId,
      schoolName,
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber,
      cnic: cnic,
      salary: Number(salary),
      address: address.trim(),
      designation: designation || '',
      joiningDate: joiningDate || new Date().toISOString(),
      password: password, // In production: hash this before storing
      role: 'staff',
      status: status,
      createdAt: new Date().toISOString(),
    };

    await db.collection("SchoolStaff").doc(docId).set(payload);
    
    // Return the created staff member (without password for security)
    const { password: _, ...safePayload } = payload;
    return NextResponse.json({ 
      success: true, 
      data: { id: docId, ...safePayload } 
    }, { status: 201 });
    
  } catch (err) {
    console.error('[POST /api/staff]', err);
    return NextResponse.json({ success: false, error: 'Server error: ' + err.message }, { status: 500 });
  }
}

/* ────────────────────────────────────────────────────────────
   PUT /api/staff  – update staff member
   Body must include `docId`
──────────────────────────────────────────────────────────── */
export async function PUT(req) {
  try {
    const body = await req.json();
    const { 
      docId, 
      fullName, 
      phoneNumber, 
      cnic, 
      salary, 
      address, 
      email, 
      designation, 
      joiningDate, 
      status 
    } = body;

    if (!docId) {
      return NextResponse.json({ success: false, error: 'docId is required' }, { status: 400 });
    }

    const ref = db.collection("SchoolStaff").doc(docId);
    const snap = await ref.get();
    
    if (!snap.exists) {
      return NextResponse.json({ success: false, error: 'Staff not found' }, { status: 404 });
    }

    // Build updates with EXACT field names
    const updates = {};
    
    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
    if (cnic !== undefined) updates.cnic = cnic;
    if (salary !== undefined) updates.salary = Number(salary);
    if (address !== undefined) updates.address = address.trim();
    if (email !== undefined) updates.email = email.trim();
    if (designation !== undefined) updates.designation = designation;
    if (joiningDate !== undefined) updates.joiningDate = joiningDate;
    if (status !== undefined) updates.status = status;
    
    updates.updatedAt = new Date().toISOString();

    await ref.update(updates);
    
    // Get updated data
    const updatedSnap = await ref.get();
    const updatedData = updatedSnap.data();
    const { password: _, ...safeData } = updatedData;
    
    return NextResponse.json({ 
      success: true, 
      data: { id: docId, ...safeData } 
    });
    
  } catch (err) {
    console.error('[PUT /api/staff]', err);
    return NextResponse.json({ success: false, error: 'Server error: ' + err.message }, { status: 500 });
  }
}

/* ────────────────────────────────────────────────────────────
   DELETE /api/staff?docId=STAFF_xxx
──────────────────────────────────────────────────────────── */
export async function DELETE(req) {
  const { searchParams } = req.nextUrl;
  const docId = searchParams.get('docId');

  if (!docId) {
    return NextResponse.json({ success: false, error: 'docId is required' }, { status: 400 });
  }

  try {
    const ref = db.collection("SchoolStaff").doc(docId);
    const snap = await ref.get();
    
    if (!snap.exists) {
      return NextResponse.json({ success: false, error: 'Staff not found' }, { status: 404 });
    }

    await ref.delete();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Staff deleted successfully.',
      deletedDocId: docId 
    });
    
  } catch (err) {
    console.error('[DELETE /api/staff]', err);
    return NextResponse.json({ success: false, error: 'Server error: ' + err.message }, { status: 500 });
  }
}