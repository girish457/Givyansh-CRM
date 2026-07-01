import bcrypt from "bcryptjs";
import connectDB, { sequelize } from "./db.js";
import User from "./models/User.js";
import Company from "./models/Company.js";

async function forceSeed() {
    try {
        await connectDB();
        await sequelize.sync();
        
        const superEmail = "givyansh7790@gmail.com";
        const dummyEmails = [
            "givyansh779081@gmail.com",
            "givyansh77908136@gmail.com",
            "givyansh7790813609@gmail.com",
            "givyansh779081360977@gmail.com"
        ];
        const dummyPassword = await bcrypt.hash("7790813609", 12);

        // Force reset
        await User.destroy({ where: { email: [superEmail, ...dummyEmails] } });

        await User.create({ name: "Givyansh Master", email: superEmail, password: dummyPassword, role: "superadmin" });
        const boss = await User.create({ name: "The Boss", email: "givyansh779081360977@gmail.com", password: dummyPassword, role: "boss" });
        const manager = await User.create({ name: "Demo Manager", email: "givyansh7790813609@gmail.com", password: dummyPassword, role: "manager", reportingTo: boss.id });
        const tl = await User.create({ name: "Demo Team Lead", email: "givyansh77908136@gmail.com", password: dummyPassword, role: "tl", reportingTo: manager.id });
        const recruiter = await User.create({ name: "Demo Recruiter", email: "givyansh779081@gmail.com", password: dummyPassword, role: "recruiter", reportingTo: tl.id });

        console.log("SUCCESS: Database seeding complete with real dummy IDs.");
    } catch (err) {
        console.error("FAIL:", err.message);
    } finally {
        process.exit();
    }
}

forceSeed();
