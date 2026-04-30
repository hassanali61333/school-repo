import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },

  title: { type: String, required: true }, // "Electricity Bill", "Stationery"
  category: { 
    type: String, 
    enum: ["utility", "salary", "maintenance", "stationery", "other"],
    required: true
  },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  note: { type: String },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model("Expense", expenseSchema);