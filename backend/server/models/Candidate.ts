import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  jobRole: { type: String }, // JD
  status: { 
    type: String, 
    enum: ["New", "Interested", "Not Interested", "Call Later", "No Response", "Hired", "Rejected"],
    default: "New"
  },
  notes: [{
    text: { type: String },
    date: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  }],
  followUpDate: { type: Date },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Recruiter
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema);
