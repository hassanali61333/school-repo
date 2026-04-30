import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },

  name: { type: String, required: true },
  fatherName: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female"] },
  photo: { type: String },
  cnic: { type: String },

  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },

  subject: { type: String }, // konsa subject padhata hai
  qualification: { type: String },
  joiningDate: { type: Date, default: Date.now },

  salary: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ["active", "resigned", "terminated"], 
    default: "active" 
  },
}, { timestamps: true });

export default mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);