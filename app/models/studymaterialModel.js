import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },

  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true }, // ImageKit ya koi bhi storage
  fileType: { type: String }, // "pdf", "doc", "ppt"
  class: { type: String }, // konsi class ke liye
  subject: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.models.StudyMaterial || mongoose.model("StudyMaterial", studyMaterialSchema);