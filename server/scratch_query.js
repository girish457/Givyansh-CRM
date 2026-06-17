import { sequelize } from "./db.js";
import { Candidate } from "./models/Candidate.js";

async function queryCandidates() {
  try {
    const list = await Candidate.findAll({
      limit: 10,
      order: [["updatedAt", "DESC"]],
      attributes: ["id", "name", "remarks", "interviewDate", "interviewTime", "followUpDate", "addedBy", "assignedTo"]
    });
    console.log("CANDIDATES:");
    console.log(JSON.stringify(list, null, 2));
  } catch (err) {
    console.error("Error querying candidates:", err);
  } finally {
    process.exit();
  }
}
queryCandidates();
