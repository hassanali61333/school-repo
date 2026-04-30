import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },

  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["clerk", "sweeper", "guard", "other"], 
    required: true 
  },
  phone: { type: String, required: true },
  cnic: { type: String },
  address: { type: String },
  salary: { type: Number, default: 0 },
  joiningDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ["active", "resigned"], 
    default: "active" 
  },
}, { timestamps: true });

export default mongoose.models.Staff || mongoose.model("Staff", staffSchema);