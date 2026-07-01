import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  adminEmail: { type: String, required: true, unique: true },
  adminPassword: { type: String, required: true }, // Hashed password
  portals: {
    boss: { type: Boolean, default: true },
    manager: { type: Boolean, default: false },
    tl: { type: Boolean, default: false },
    recruiter: { type: Boolean, default: true },
  },
  plan: { type: String, default: "Starter" },
  status: { type: String, enum: ["active", "suspended", "expired"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Company || mongoose.model("Company", CompanySchema);
