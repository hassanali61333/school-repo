import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },

  personId: { type: mongoose.Schema.Types.ObjectId, required: true },
  personType: { type: String, enum: ["teacher", "staff"], required: true },

  month: { type: String, required: true },
  year: { type: Number, required: true },

  basicSalary: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  deduction: { type: Number, default: 0 },
  totalSalary: { type: Number, required: true },

  status: { 
    type: String, 
    enum: ["paid", "unpaid"], 
    default: "unpaid" 
  },
  paidDate: { type: Date },
  note: { type: String },
}, { timestamps: true });

export default mongoose.models.Salary || mongoose.model("Salary", salarySchema);