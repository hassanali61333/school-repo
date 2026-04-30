import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },

  // Personal Info
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female"] },
  photo: { type: String },
  bFormNumber: { type: String },

  // Contact Info
  address: { type: String },
  city: { type: String },
  phone: { type: String, required: true }, // father ka number
  whatsapp: { type: String },
  email: { type: String },

  // School Info
  rollNumber: { type: String, required: true },
  class: { type: String, required: true }, // "1", "2" ... "12"
  section: { type: String }, // "A", "B", "C"
  admissionDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ["active", "left", "expelled"], 
    default: "active" 
  },

  // Fees
  monthlyFee: { type: Number, default: 0 },
  admissionFee: { type: Number, default: 0 },

}, { timestamps: true });

export default mongoose.models.Student || mongoose.model("Student", studentSchema);