// app/api/timetable/route.js

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

//=======================================get slots api================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const schoolId = searchParams.get('schoolId');
    const cls = searchParams.get('class');
    const section = searchParams.get('section');

    if (!schoolId || !cls || !section) {
      return NextResponse.json(
        { error: 'schoolId, class and section are required' },
        { status: 400 }
      );
    }

    const snap = await db
      .collection('TimetableSlot')
      .where('schoolId', '==', String(schoolId))
      .where('class', '==', cls)
      .where('section', '==', section)
      .get();

    const slots = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: slots,
    });
  } catch (error) {
    console.error('[GET /api/timetable]', error);

    return NextResponse.json(
      { error: 'Failed to fetch timetable' },
      { status: 500 }
    );
  }
}

//======================================================== create slot============================
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      schoolId,
      class: cls,
      section,
      day,
      period,
      teacherId,
      teacherName,
      subject,
      startTime,
      endTime,
    } = body;

    // Validate required fields
    if (
      !schoolId ||
      !cls ||
      !section ||
      !day ||
      period == null ||
      !teacherId ||
      !subject ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const slotId = `${schoolId}_${cls}_${section}_${day}_${period}`;

    // CHECK IF SLOT ALREADY EXISTS
    const existingSlot = await db.collection('TimetableSlot').doc(slotId).get();
    
    if (existingSlot.exists) {
      return NextResponse.json(
        { 
          success: false,
          message: `A slot already exists for ${day} Period ${period} in Class ${cls}-${section}`,
          exists: true,
          existingData: existingSlot.data()
        },
        { status: 409 }
      );
    }

    // Create new slot if it doesn't exist
    await db.collection('TimetableSlot').doc(slotId).set({
      slotId,
      schoolId: String(schoolId),
      class: cls,
      section,
      day,
      period,
      teacherId: String(teacherId),
      teacherName,
      subject,
      startTime,
      endTime,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Slot created successfully',
      slotId,
    });
  } catch (error) {
    console.error('[POST /api/timetable]', error);

    return NextResponse.json(
      { error: 'Failed to save slot', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/timetable
 * Update an existing timetable slot
 */
export async function PUT(request) {
  try {
    const body = await request.json();

    const {
      slotId,
      schoolId,
      class: cls,
      section,
      day,
      period,
      teacherId,
      teacherName,
      subject,
      startTime,
      endTime,
    } = body;

    
    let finalSlotId = slotId;
    if (!finalSlotId && schoolId && cls && section && day && period != null) {
      finalSlotId = `${schoolId}_${cls}_${section}_${day}_${period}`;
    }

    if (!finalSlotId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'slotId or (schoolId, class, section, day, period) required' 
        },
        { status: 400 }
      );
    }

    // Reference to the document
    const slotRef = db.collection('TimetableSlot').doc(finalSlotId);
    
    // Check if slot exists
    const existingSlot = await slotRef.get();
    
    if (!existingSlot.exists) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Slot not found' 
        },
        { status: 404 }
      );
    }

    // Prepare update data (only include fields that are provided)
    const updateData = {
      updatedAt: new Date(),
    };

    if (teacherId !== undefined) updateData.teacherId = String(teacherId);
    if (teacherName !== undefined) updateData.teacherName = teacherName;
    if (subject !== undefined) updateData.subject = subject;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;

    // Update the slot
    await slotRef.update(updateData);

    // Get the updated document
    const updatedSlot = await slotRef.get();
    const slotData = { slotId: updatedSlot.id, ...updatedSlot.data() };

    return NextResponse.json({
      success: true,
      message: 'Slot updated successfully',
      data: slotData,
    });
  } catch (error) {
    console.error('[PUT /api/timetable]', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update slot',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/timetable?slotId=xxx
 * Delete a timetable slot
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);

    const slotId = searchParams.get('slotId');

    if (!slotId) {
      return NextResponse.json(
        { error: 'slotId required' },
        { status: 400 }
      );
    }

    // Check if slot exists before deleting
    const slotRef = db.collection('TimetableSlot').doc(slotId);
    const existingSlot = await slotRef.get();
    
    if (!existingSlot.exists) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Slot not found' 
        },
        { status: 404 }
      );
    }

    await slotRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Slot deleted successfully',
    });
  } catch (error) {
    console.error('[DELETE /api/timetable]', error);

    return NextResponse.json(
      { error: 'Failed to delete slot' },
      { status: 500 }
    );
  }
}