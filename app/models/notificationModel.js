import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },

  title: { type: String, required: true },
  message: { type: String, required: true },
  sentTo: { 
    type: String, 
    enum: ["all", "students", "parents", "teachers"], 
    default: "all" 
  },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);