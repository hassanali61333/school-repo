import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin"; // Firebase Admin config

// ✅ IMPORTANT: Add this config for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    // ✅ FORM DATA READ
    const form = await req.formData();

    const schoolId = form.get("schoolId");
    const schoolName = form.get("schoolName");
    const displayName = form.get("displayName");
    const address = form.get("address");
    const establishedYear = form.get("establishedYear");
    const schoolType = form.get("schoolType");
    const adminId = form.get("adminId");
    const imageFile = form.get("image");
    
    // Parse facilities
    let facilities = form.get("facilities");
    try {
      facilities = facilities ? JSON.parse(facilities) : {};
    } catch (error) {
      console.error("Error parsing facilities:", error);
      facilities = {};
    }

    // ===== Validation =====
    if (!schoolName || !address || !establishedYear) {
      return NextResponse.json(
        { error: "Missing required fields", message: "Please fill all required fields" },
        { status: 400 }
      );
    }

    const year = Number(establishedYear);
    const currentYear = new Date().getFullYear();

    if (year < 1850 || year > currentYear) {
      return NextResponse.json(
        { error: "Invalid year", message: `Year must be between 1850 and ${currentYear}` },
        { status: 400 }
      );
    }

    // ===== Duplicate Check =====
    const schoolsRef = db.collection("Schools");
    const snapshot = await schoolsRef
      .where("schoolName", "==", schoolName.toLowerCase())
      .get();

    if (!snapshot.empty) {
      return NextResponse.json(
        { error: "School already exists", message: "A school with this name already exists" },
        { status: 409 }
      );
    }

    // ===== IMAGE HANDLING =====
    let imageData = null;

    if (imageFile && imageFile.size > 0) {
      try {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        imageData = {
          name: imageFile.name,
          type: imageFile.type,
          size: imageFile.size,
          base64: buffer.toString("base64"),
        };
      } catch (error) {
        console.error("Error processing image:", error);
      }
    }

    // ===== Generate School ID if not provided =====
    const finalSchoolId = schoolId || `SCH-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // ===== Save Data =====
    const newSchool = {
      schoolId: finalSchoolId,
      schoolName: schoolName.toLowerCase(),
      displayName: displayName || schoolName,
      address,
      establishedYear: year,
      schoolType: schoolType || "public",
      adminId: adminId || null,
      facilities,
      image: imageData,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(newSchool).forEach(key => {
      if (newSchool[key] === undefined) {
        delete newSchool[key];
      }
    });

    await schoolsRef.doc(finalSchoolId).set(newSchool);

    return NextResponse.json({
      success: true,
      message: "School registered successfully",
      data: {
        ...newSchool,
        image: imageData ? { name: imageData.name, type: imageData.type } : null
      }
    });

  } catch (error) {
    console.error("API Error Details:", error);
    
    // Send detailed error for debugging
    return NextResponse.json(
      { 
        error: "Server error", 
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 },
    );
  }
}

//=================================================get school==================================================

export async function GET() {
  try {
    const snapshot = await db.collection("Schools").get();

    const schools = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: schools,
    });

  } catch (error) {
    console.error("GET Schools Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch schools",
      },
      { status: 500 }
    );
  }
}

//===============================================delete school===========================================


export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId required" },
        { status: 400 }
      );
    }

    // ===== Check karo school exist karta hai =====
    const schoolRef = db.collection("Schools").doc(schoolId);
    const schoolDoc = await schoolRef.get();

    if (!schoolDoc.exists) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 404 }
      );
    }

    // ===== Delete karo =====
    await schoolRef.delete();

    return NextResponse.json({
      success: true,
      message: "School deleted successfully",
    });

  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

//=======================================================edit school================================


export async function PUT(req) {
  try {
    const form = await req.formData();

    const schoolId = form.get("schoolId");
    const schoolName = form.get("schoolName");
    const displayName = form.get("displayName");
    const address = form.get("address");
    const establishedYear = form.get("establishedYear");
    const schoolType = form.get("schoolType");
    const imageFile = form.get("image");

    let facilities = form.get("facilities");
    try {
      facilities = facilities ? JSON.parse(facilities) : {};
    } catch {
      facilities = {};
    }

    // ===== Validation =====
    if (!schoolId) {
      return NextResponse.json({ error: "schoolId required" }, { status: 400 });
    }

    // ===== School exist check =====
    const schoolRef = db.collection("Schools").doc(schoolId);
    const schoolDoc = await schoolRef.get();

    if (!schoolDoc.exists) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // ===== Duplicate name check (apne alawa) =====
    if (schoolName) {
      const dupSnap = await db.collection("Schools")
        .where("schoolName", "==", schoolName.toLowerCase()).get();

      const duplicate = dupSnap.docs.find(doc => doc.id !== schoolId);
      if (duplicate) {
        return NextResponse.json({ error: "School name already exists" }, { status: 409 });
      }
    }

    // ===== Image handle =====
    let imageData = schoolDoc.data().image; // purani image rakho by default

    if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageData = {
        name: imageFile.name,
        type: imageFile.type,
        base64: buffer.toString("base64"),
      };
    }

    // ===== Update =====
    const updatedSchool = {
      ...schoolDoc.data(),
      schoolName: schoolName?.toLowerCase() || schoolDoc.data().schoolName,
      displayName: displayName || schoolDoc.data().displayName,
      address: address || schoolDoc.data().address,
      establishedYear: establishedYear ? Number(establishedYear) : schoolDoc.data().establishedYear,
      schoolType: schoolType || schoolDoc.data().schoolType,
      facilities,
      image: imageData,
      updatedAt: new Date().toISOString(),
    };

    await schoolRef.update(updatedSchool);

    return NextResponse.json({ success: true, data: updatedSchool });

  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}