import connectDB, { sequelize } from "./server/db.js";
import User from "./server/models/User.js";
import UserMetrics from "./server/models/UserMetrics.js";

async function run() {
    try {
        await connectDB();
        console.log("DB connected.");
        const user = await User.findOne({ where: { role: "recruiter" } });
        if (!user) {
            console.log("No recruiter user found");
            process.exit(0);
        }
        console.log("Found recruiter user:", user.id, user.name, user.companyId);

        const PointHistory = sequelize.models.PointHistory;
        const UserMetricsModel = sequelize.models.UserMetrics;

        console.log("UserMetrics model:", !!UserMetricsModel);
        console.log("PointHistory model:", !!PointHistory);

        console.log("Testing findOrCreate...");
        const [metrics, created] = await UserMetricsModel.findOrCreate({ where: { userId: user.id } });
        console.log("Metrics findOrCreate success:", metrics.userId, "created:", created);

        console.log("Testing findAll...");
        const allMetrics = await UserMetricsModel.findAll({
            include: [{ model: User, as: "user", where: { companyId: user.companyId }, attributes: ["id"] }],
            order: [["totalCoins", "DESC"]]
        });
        console.log("All metrics length:", allMetrics.length);

        console.log("Testing point history find...");
        const history = await PointHistory.findAll({
            where: { userId: user.id },
            order: [["createdAt", "DESC"]],
            limit: 50
        });
        console.log("History length:", history.length);

        console.log("All tests passed!");
    } catch (err) {
        console.error("DIAGNOSTIC ERROR:", err);
    } finally {
        process.exit(0);
    }
}

run();
