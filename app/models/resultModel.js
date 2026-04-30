import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },

  class: { type: String, required: true },
  section: { type: String },
  exam: { type: String, required: true }, // "Monthly", "Mid Term", "Final"
  year: { type: Number, required: true },

  subjects: [
    { name: { type: String },  totalMarks: { type: Number }, obtainedMarks: { type: Number }, }],

  totalMarks: { type: Number },
  obtainedMarks: { type: Number },
  percentage: { type: Number },
  grade: { type: String }, 
  status: { type: String, enum: ["pass", "fail"], default: "pass" },
}, { timestamps: true });

export default mongoose.models.Result || mongoose.model("Result", resultSchema);