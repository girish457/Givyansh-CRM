import connectDB from "./server/db.js";
import PointHistory from "./server/models/PointHistory.js";

async function main() {
    try {
        await connectDB();
        const rows = await PointHistory.findAll({
            order: [['id', 'DESC']],
            limit: 10
        });
        console.log("Recent Point Histories in DB:");
        rows.forEach(r => {
            console.log(`ID: ${r.id}, userId: ${r.userId}, candidateId: ${r.candidateId}, actionType: ${r.actionType}, statusName: ${r.statusName}, pointsAwarded: ${r.pointsAwarded}, reason: ${r.reason}`);
        });
    } catch(e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
main();
