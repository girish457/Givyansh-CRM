import AuditLog from "./backend/server/models/AuditLog.js";

async function main() {
    try {
        const logs = await AuditLog.findAll({
            order: [["createdAt", "DESC"]],
            limit: 20
        });

        console.log("Recent audit logs:");
        logs.forEach(log => {
            console.log(`- Time: ${log.createdAt.toISOString()}, Action: ${log.action}, User: ${log.performedBy}, Details: ${log.details}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
main();
