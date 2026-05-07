import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin"; // Firebase Admin config



export async function POST(req) {
  try {
    // ✅ FORM DATA READ (IMPORTANT CHANGE)
    const form = await req.formData();

    const schoolId = form.get("schoolId");
    const schoolName = form.get("schoolName");
    const displayName = form.get("displayName");
    const address = form.get("address");
    const establishedYear = form.get("establishedYear");
    const schoolType = form.get("schoolType");
    const adminId = form.get("adminId");
   const status = form.get("status") || "active";
    const imageFile = form.get("image"); // 📁 FILE

    // optional JSON string (if you send facilities as string)
    let facilities = form.get("facilities");
    try {
      facilities = facilities ? JSON.parse(facilities) : {};
    } catch {
      facilities = {};
    }

    // ===== Validation =====
    if (!schoolName || !address || !establishedYear) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const year = Number(establishedYear);
    const currentYear = new Date().getFullYear();

    if (year < 1850 || year > currentYear) {
      return NextResponse.json(
        { error: "Invalid year" },
        { status: 400 }
      );
    }

    // ===== Duplicate Check =====
    const snapshot = await db
      .collection("Schools")
      .where("schoolName", "==", schoolName.toLowerCase())
      .get();

    if (!snapshot.empty) {
      return NextResponse.json(
        { error: "School already exists" },
        { status: 409 }
      );
    }

    // ===== IMAGE HANDLING (simple base64) =====
    let imageData = null;

    if (imageFile && typeof imageFile !== "string") {
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      imageData = {
        name: imageFile.name,
        type: imageFile.type,
        base64: buffer.toString("base64"),
      };
    }

    // ===== Save Data =====
    const newSchool = {
      schoolId: schoolId || `school-${Date.now()}`,
      schoolName: schoolName.toLowerCase(),
      displayName,
      address,
      establishedYear: Number(establishedYear),
      schoolType,
      adminId,
      facilities,
      image: imageData, // ✅ stored image
      status,
      createdAt: new Date().toISOString(),
    };

    await db.collection("Schools").doc(newSchool.schoolId).set(newSchool);

    return NextResponse.json({
      success: true,
      data: newSchool,
    });

  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
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
    const status = form.get("status");

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
      status: status || schoolDoc.data().status,
    };

    await schoolRef.update(updatedSchool);

    return NextResponse.json({ success: true, data: updatedSchool });

  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}