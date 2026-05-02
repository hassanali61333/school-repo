


// import { NextResponse } from 'next/server';
// import { db } from '@/app/lib/firebase'; // Adjust your firebase import path
// import { collection, query, where, getDocs, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
// import bcrypt from 'bcryptjs';

// // Collections to check for email duplication
// const CHECK_COLLECTIONS = [
//   { name: 'head', label: 'Head' },
//   { name: 'Teacher', label: 'Teacher' },
//   { name: 'students', label: 'Student' },
//   { name: 'user', label: 'User' },
// ];

// // Helper to check email existence across collections
// async function checkEmailExists(email) {
//   const emailLower = email.toLowerCase();
//   const results = await Promise.all(
//     CHECK_COLLECTIONS.map(async (collection) => {
//       try {
//         const q = query(collection(db, collection.name), where('email', '==', emailLower));
//         const snapshot = await getDocs(q);
//         return {
//           collection: collection.name,
//           label: collection.label,
//           exists: !snapshot.empty,
//         };
//       } catch (error) {
//         console.error(`Error checking ${collection.name}:`, error);
//         return {
//           collection: collection.name,
//           label: collection.label,
//           exists: false,
//           error: true,
//         };
//       }
//     })
//   );

//   const existing = results.find(r => r.exists === true);
//   return existing || null;
// }

// // Helper to check if school already has a head
// async function schoolHasHead(schoolId) {
//   try {
//     const q = query(collection(db, 'head'), where('schoolId', '==', schoolId));
//     const snapshot = await getDocs(q);
//     return !snapshot.empty;
//   } catch (error) {
//     console.error('Error checking school head:', error);
//     throw error;
//   }
// }

// // Helper to check if same email exists for same school
// async function duplicateEmailForSchool(email, schoolId) {
//   try {
//     const emailLower = email.toLowerCase();
//     const q = query(
//       collection(db, 'head'),
//       where('email', '==', emailLower),
//       where('schoolId', '==', schoolId)
//     );
//     const snapshot = await getDocs(q);
//     return !snapshot.empty;
//   } catch (error) {
//     console.error('Error checking duplicate:', error);
//     throw error;
//   }
// }

// // Helper to verify admin owns the school
// async function verifyAdminSchool(adminId, schoolId) {
//   try {
//     const q = query(
//       collection(db, 'Schools'),
//       where('adminId', '==', adminId),
//       where('schoolId', '==', schoolId)
//     );
//     const snapshot = await getDocs(q);
//     return !snapshot.empty;
//   } catch (error) {
//     console.error('Error verifying admin school:', error);
//     return false;
//   }
// }

// // Helper to get school details
// async function getSchoolDetails(schoolId) {
//   try {
//     const schoolRef = doc(db, 'Schools', schoolId);
//     const schoolSnap = await getDoc(schoolRef);
//     if (schoolSnap.exists()) {
//       return schoolSnap.data();
//     }
//     return null;
//   } catch (error) {
//     console.error('Error fetching school:', error);
//     return null;
//   }
// }

// // Main POST handler
// export async function POST(req) {
//   try {
//     const body = await req.json();

//     const {
//       headId,
//       adminId,
//       schoolId,
//       name,
//       email,
//       password,
//       role = 'head',
//       imageUrl = null,
//       status = 'active',
//     } = body;

//     // ===== Validation =====
//     if (!adminId) {
//       return NextResponse.json(
//         { error: 'Admin ID is required. Only admin can add a Head.' },
//         { status: 401 }
//       );
//     }

//     if (!schoolId) {
//       return NextResponse.json(
//         { error: 'School ID is required. Please select a school.' },
//         { status: 400 }
//       );
//     }

//     if (!name || name.trim() === '') {
//       return NextResponse.json(
//         { error: 'Head name is required.' },
//         { status: 400 }
//       );
//     }

//     if (!email || !email.includes('@')) {
//       return NextResponse.json(
//         { error: 'Valid email is required.' },
//         { status: 400 }
//       );
//     }

//     if (!password || password.length < 8) {
//       return NextResponse.json(
//         { error: 'Password must be at least 8 characters.' },
//         { status: 400 }
//       );
//     }

//     // ===== Verify admin owns the school =====
//     const isAuthorized = await verifyAdminSchool(adminId, schoolId);
//     if (!isAuthorized) {
//       return NextResponse.json(
//         { error: 'You are not authorized to add a head to this school.' },
//         { status: 403 }
//       );
//     }

//     // ===== Check email duplication across all collections =====
//     const emailExists = await checkEmailExists(email);
//     if (emailExists) {
//       return NextResponse.json(
//         { error: `This email is already used by a ${emailExists.label}.` },
//         { status: 409 }
//       );
//     }

//     // ===== Check if school already has a head =====
//     const hasHead = await schoolHasHead(schoolId);
//     if (hasHead) {
//       return NextResponse.json(
//         { error: 'This school already has a Head assigned.' },
//         { status: 409 }
//       );
//     }

//     // ===== Check duplicate email + school combination =====
//     const isDuplicate = await duplicateEmailForSchool(email, schoolId);
//     if (isDuplicate) {
//       return NextResponse.json(
//         { error: 'A head with this email already exists for the selected school.' },
//         { status: 409 }
//       );
//     }

//     // ===== Get school details =====
//     const schoolDetails = await getSchoolDetails(schoolId);
//     if (!schoolDetails) {
//       return NextResponse.json(
//         { error: 'School not found.' },
//         { status: 404 }
//       );
//     }

//     // ===== Hash password =====
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ===== Create head document =====
//     const newHeadId = headId || `head-${Date.now()}`;
//     const emailLower = email.toLowerCase();

//     const headData = {
//       headId: newHeadId,
//       adminId,
//       schoolId,
//       name: name.trim(),
//       email: emailLower,
//       password: hashedPassword,
//       role: 'head',
//       imageUrl: imageUrl || null,
//       schoolName: schoolDetails.displayName || schoolDetails.schoolName || 'Unknown School',
//       status: status,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     // Save to Firestore
//     await setDoc(doc(db, 'head', newHeadId), headData);

//     // Optional: Update school document to link head
//     const schoolRef = doc(db, 'Schools', schoolId);
//     await updateDoc(schoolRef, {
//       headId: newHeadId,
//       headName: name.trim(),
//       headEmail: emailLower,
//       headAssignedAt: new Date().toISOString(),
//     });

//     // Remove password from response
//     const { password: _, ...responseData } = headData;

//     return NextResponse.json({
//       success: true,
//       message: 'Head assigned to school successfully',
//       data: responseData,
//     });

//   } catch (error) {
//     console.error('Add Head API Error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error. Failed to add head.' },
//       { status: 500 }
//     );
//   }
// }

// // GET handler to fetch available schools for an admin
// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const adminId = searchParams.get('adminId');

//     if (!adminId) {
//       return NextResponse.json(
//         { error: 'Admin ID is required' },
//         { status: 400 }
//       );
//     }

//     // Get all schools for this admin
//     const schoolsQuery = query(
//       collection(db, 'Schools'),
//       where('adminId', '==', adminId)
//     );
//     const schoolsSnapshot = await getDocs(schoolsQuery);
    
//     if (schoolsSnapshot.empty) {
//       return NextResponse.json({
//         success: true,
//         data: [],
//         message: 'No schools found for this admin',
//       });
//     }

//     // Get all schools that already have heads
//     const headsQuery = query(collection(db, 'head'));
//     const headsSnapshot = await getDocs(headsQuery);
//     const schoolsWithHeads = new Set();
    
//     headsSnapshot.forEach(doc => {
//       const data = doc.data();
//       if (data.schoolId) {
//         schoolsWithHeads.add(data.schoolId);
//       }
//     });

//     // Filter schools without heads
//     const availableSchools = [];
//     schoolsSnapshot.forEach(doc => {
//       const schoolData = doc.data();
//       const schoolId = schoolData.schoolId || doc.id;
      
//       if (!schoolsWithHeads.has(schoolId)) {
//         availableSchools.push({
//           id: schoolId,
//           name: schoolData.displayName || schoolData.schoolName || 'Unnamed School',
//           image: schoolData.imageUrl || schoolData.imageName || null,
//           address: schoolData.address,
//           schoolType: schoolData.schoolType,
//         });
//       }
//     });

//     return NextResponse.json({
//       success: true,
//       data: availableSchools,
//       total: availableSchools.length,
//     });

//   } catch (error) {
//     console.error('GET Schools Error:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch schools' },
//       { status: 500 }
//     );
//   }
// }