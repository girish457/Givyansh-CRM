import { sequelize } from "./db.js";
import User from "./models/User.js";
import Company from "./models/Company.js";

async function fixUsers() {
  try {
    console.log("Starting users companyId cleanup...");
    // Find or create "First Attempt" company
    const [company] = await Company.findOrCreate({
      where: { name: "First Attempt" },
      defaults: {
        adminEmail: "admin@firstattempt.digital",
        adminPassword: "password123",
        plan: "Enterprise"
      }
    });

    console.log(`Company "First Attempt" ID: ${company.id}`);

    // Update users where companyId is null and role is not superadmin
    const [updatedCount] = await User.update(
      { companyId: company.id },
      { where: { companyId: null, role: ["boss", "manager", "tl", "recruiter"] } }
    );

    console.log(`Successfully updated ${updatedCount} users to have companyId = ${company.id}`);
  } catch (err) {
    console.error("Error updating users:", err);
  } finally {
    process.exit();
  }
}

fixUsers();
