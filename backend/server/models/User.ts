import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  role: { 
    type: String, 
    enum: ["superadmin", "boss", "manager", "tl", "recruiter"], 
    required: true,
    default: "recruiter"
  },
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Company", 
    required: function() { return (this as any).role !== "superadmin"; } // Not required for Superadmin
  },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
