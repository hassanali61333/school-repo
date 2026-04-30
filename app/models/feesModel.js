import mongoose from "mongoose";

const feesSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },

  month: { type: String, required: true }, // "January", "February"
  year: { type: Number, required: true },

  amount: { type: Number, required: true },
  lateFine: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  status: { 
    type: String, 
    enum: ["paid", "unpaid", "partial"], 
    default: "unpaid" 
  },

  paidDate: { type: Date },
  challanNumber: { type: String },
  paymentMethod: { type: String, enum: ["cash", "bank"], default: "cash" },
  note: { type: String },
}, { timestamps: true });

export default mongoose.models.Fees || mongoose.model("Fees", feesSchema);