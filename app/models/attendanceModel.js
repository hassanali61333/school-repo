import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },

  personId: { type: mongoose.Schema.Types.ObjectId, required: true }, // student ya teacher ka ID
  personType: { type: String, enum: ["student", "teacher", "staff"], required: true },

  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ["present", "absent", "leave"], 
    required: true 
  },
  note: { type: String }, // optional reason
}, { timestamps: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);