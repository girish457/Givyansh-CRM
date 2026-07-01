import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import Company from "./Company.js";
import User from "./User.js";
import fs from "fs";
import path from "path";
import PointHistory from "./PointHistory.js";
import UserMetrics from "./UserMetrics.js";
import SystemSetting from "./SystemSetting.js";

const Candidate = sequelize.define("Candidate", {
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  jobRole: { type: DataTypes.STRING, allowNull: true },
  status: { 
    type: DataTypes.STRING,
    defaultValue: "New"
  },
  followUpDate: { type: DataTypes.DATE, allowNull: true },
  
  // New Fields
  sourcingDate: { type: DataTypes.DATEONLY, allowNull: true },
  recruiterName: { type: DataTypes.STRING, allowNull: true },
  reportingPerson: { type: DataTypes.STRING, allowNull: true },
  coldCalling: { type: DataTypes.STRING, allowNull: true },
  clientName: { type: DataTypes.STRING, allowNull: true },
  designation: { type: DataTypes.STRING, allowNull: true },
  state: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  gender: { type: DataTypes.STRING, allowNull: true },
  dob: { type: DataTypes.DATEONLY, allowNull: true },
  age: { type: DataTypes.INTEGER, allowNull: true },
  qualification: { type: DataTypes.STRING, allowNull: true },
  totalExperience: { type: DataTypes.STRING, allowNull: true },
  sector: { type: DataTypes.STRING, allowNull: true },
  currentOrg: { type: DataTypes.STRING, allowNull: true },
  currentCtc: { type: DataTypes.FLOAT, allowNull: true },
  expectedCtc: { type: DataTypes.FLOAT, allowNull: true },
  noticePeriod: { type: DataTypes.STRING, allowNull: true },
  cvStatus: { type: DataTypes.STRING, allowNull: true },
  offeredSalary: { type: DataTypes.FLOAT, allowNull: true },
  remarks: { type: DataTypes.STRING, allowNull: true },
  remarkReason: { type: DataTypes.TEXT, allowNull: true },
  interviewDate: { type: DataTypes.DATE, allowNull: true },
  interviewTime: { type: DataTypes.STRING, allowNull: true },
  cvSharedWith: { type: DataTypes.STRING, allowNull: true },
  dataType: { type: DataTypes.STRING, defaultValue: 'crm' },
  sourcingBy: { type: DataTypes.STRING, allowNull: true },
  vendorId: { type: DataTypes.INTEGER, allowNull: true },
}, { 
  timestamps: true,
  updatedAt: true 
});

// Define Relationships
Candidate.belongsTo(Company, { foreignKey: "companyId", as: "company" });
Candidate.belongsTo(User, { foreignKey: "assignedTo", as: "recruiter" });
Candidate.belongsTo(User, { foreignKey: "addedBy", as: "creator" });

const Note = sequelize.define("InteractionNote", {
  text: { type: DataTypes.TEXT, allowNull: false },
}, { 
  timestamps: true,
  updatedAt: false 
});

// Note Relationships
Candidate.hasMany(Note, { foreignKey: "candidateId", as: "InteractionNotes" });
Note.belongsTo(Candidate, { foreignKey: "candidateId", as: "candidate" });
Note.belongsTo(User, { foreignKey: "authorId", as: "author" });

// --- REAL-TIME GAMIFICATION ENGINE HOOKS ---
const assignGamificationPoints = async (candidate, isNew) => {
  const logHook = (msg) => {
    try {
      fs.appendFileSync(path.resolve(process.cwd(), "gamification_hook_log.txt"), `[${new Date().toISOString()}] Candidate ${candidate.id || 'new'} | isNew: ${isNew} | ${msg}\n`);
    } catch (e) {}
  };

  try {
    logHook(`Starting gamification points evaluation. Remarks: "${candidate.remarks}", cvStatus: "${candidate.cvStatus}", status: "${candidate.status}"`);
    if (!PointHistory || !UserMetrics) {
      logHook("ERROR: PointHistory or UserMetrics is not loaded!");
      return;
    }

    // Fetch config
    let economy = {
      register: 0.30, connected: 0.2, notConnected: -0.3, interested: 0.3,
      notInterested: 0.1, statusNotInterested: -5, goForInterview: 7,
      interviewDone: 8, interviewNotDone: -0.5, callNotPick: -0.5,
      processingForInterview: 2, selected: 10, rejected: -7,
      processingForJoining: 12, joined: 18, dropped: -20,
      teamSelection: 5, teamJoining: 8, teamDropped: -10,
      leadCreated: 2
    };
    if (SystemSetting) {
      const dbConfig = await SystemSetting.findOne({ where: { key: "gamification_economy" } });
      if (dbConfig) {
         try {
           const parsed = JSON.parse(dbConfig.value);
           if (parsed.points) {
             economy = { ...economy, ...parsed.points };
           } else {
             economy = { ...economy, ...parsed };
           }
         } catch(e) {}
      }
    }

    const remarks = (candidate.remarks || "").toLowerCase().replace(/[\s_]+/g, "");
    const cvStatus = (candidate.cvStatus || "").toLowerCase().replace(/[\s_]+/g, "");

    const userId = candidate.assignedTo || candidate.addedBy;
    if (!userId) {
      logHook("ERROR: No assignedTo or addedBy user ID found on candidate!");
      return;
    }
    logHook(`Target User ID for points: ${userId}`);

    // Helper to evaluate status change/remarks action
    const evaluateStatusAction = async (remarksVal, cvStatusVal, economyConfig) => {
      let actionType = null;
      let points = 0;

      if (remarksVal === "notinterested" || remarksVal === "notselected") {
         actionType = "not_interested";
         points = economyConfig.notInterested;
         const pastHistories = await PointHistory.findAll({ where: { candidateId: candidate.id } });
         const passedCrucial = pastHistories.some(h => [
           "go_for_interview", "interview_done", "interview_not_done", 
           "selected", "rejected", "joined", "dropped"
         ].includes(h.actionType));
         if (passedCrucial) points = economyConfig.statusNotInterested;
      }
      else if (remarksVal === "connected") { actionType = "connected"; points = economyConfig.connected; }
      else if (remarksVal === "notconnected") { actionType = "not_connected"; points = economyConfig.notConnected; }
      else if (remarksVal === "callnotpick" || remarksVal === "callnotpicked") { actionType = "call_not_pick"; points = economyConfig.callNotPick; }
      else if (remarksVal === "interested") { actionType = "interested"; points = economyConfig.interested; }
      else if (remarksVal === "processingforinterview" || remarksVal === "processforinterview") { actionType = "processing_for_interview"; points = economyConfig.processingForInterview; }
      else if (remarksVal === "goforinterview" || remarksVal === "interviewscheduled" || remarksVal === "interviewrescheduled") { actionType = "go_for_interview"; points = economyConfig.goForInterview; }
      else if (remarksVal === "interviewdone" || remarksVal === "allroundsdone" || remarksVal === "processingfornextround" || remarksVal === "interviewed" || (remarksVal.includes("round") && remarksVal.includes("done"))) { actionType = "interview_done"; points = economyConfig.interviewDone; }
      else if (remarksVal === "interviewnotdone" || remarksVal === "interviewnotattended") { actionType = "interview_not_done"; points = economyConfig.interviewNotDone; }
      else if (remarksVal === "selected" || cvStatusVal === "selected") { actionType = "selected"; points = economyConfig.selected; }
      else if (remarksVal === "rejected" || cvStatusVal === "rejected") { actionType = "rejected"; points = economyConfig.rejected; }
      else if (remarksVal === "processingforjoining" || remarksVal === "processforjoining" || remarksVal === "processtojoining") { actionType = "processing_for_joining"; points = economyConfig.processingForJoining; }
      else if (remarksVal === "joined" || cvStatusVal === "joined" || remarksVal === "hired") { actionType = "joined"; points = economyConfig.joined; }
      else if (remarksVal === "dropped" || remarksVal === "fallout") { actionType = "dropped"; points = economyConfig.dropped; }

      if (!actionType) return null;
      return {
        actionType,
        points,
        statusName: candidate.remarks || "New",
        reason: `Triggered by ${actionType}`
      };
    };

    // Build list of actions to award
    const actionsToAward = [];
    if (isNew) {
      // 1. Sourcing/Registration Action
      if (candidate.dataType === 'lead') {
        actionsToAward.push({
          actionType: "lead_created",
          points: economy.leadCreated !== undefined ? economy.leadCreated : 2,
          statusName: "Lead Created",
          reason: `candidate_lead_${candidate.id}`
        });
      } else {
        actionsToAward.push({
          actionType: "register",
          points: economy.register,
          statusName: "Candidate Registered (Sourced)",
          reason: `candidate_registration_${candidate.id}`
        });
      }

      // 2. Initial Remarks status Action (if any)
      if (remarks || cvStatus) {
        const initialStatusAct = await evaluateStatusAction(remarks, cvStatus, economy);
        if (initialStatusAct) {
          actionsToAward.push(initialStatusAct);
        }
      }
    } else {
      // Update event status checks
      if (candidate.changed("remarks") || candidate.changed("status") || candidate.changed("cvStatus")) {
        const updateStatusAct = await evaluateStatusAction(remarks, cvStatus, economy);
        if (updateStatusAct) {
          actionsToAward.push(updateStatusAct);
        }
      }
    }

    if (actionsToAward.length === 0) {
      logHook("No actionable status found (remarks/cvStatus did not match any gamified event).");
      return;
    }

    // Process actions
    for (const act of actionsToAward) {
      const { actionType, points, statusName, reason } = act;
      logHook(`Evaluating Action inside loop: ${actionType} with points: ${points}`);

      const existingHistory = await PointHistory.findAll({
        where: { userId, candidateId: candidate.id }
      });

      const hasAwardedThisAction = existingHistory.some(h => h.actionType === actionType);

      // Rejoin Logic: If joined->dropped->joined
      if (actionType === "joined") {
        if (hasAwardedThisAction) {
          const droppedCount = existingHistory.filter(h => h.actionType === "dropped").length;
          const rejoinedCount = existingHistory.filter(h => h.actionType === "rejoin_compensation").length;
          if (droppedCount > rejoinedCount) {
            const compPoints = Math.abs(economy.dropped);
            await PointHistory.create({
              userId, candidateId: candidate.id, actionType: "rejoin_compensation",
              statusName: "Re-Joined", pointsAwarded: compPoints,
              reason: "Candidate re-joined after dropping. Penalty withdrawn."
            });
            const [metrics] = await UserMetrics.findOrCreate({ where: { userId } });
            metrics.totalCoins += compPoints;
            await metrics.save();
          }
          continue; // Done with this action
        }
      }

      if (actionType === "dropped") {
        await PointHistory.create({
          userId, candidateId: candidate.id, actionType: "dropped",
          statusName: "Dropped", pointsAwarded: economy.dropped,
          reason: "Candidate dropped"
        });
        const [metrics] = await UserMetrics.findOrCreate({ where: { userId } });
        metrics.totalCoins += economy.dropped;
        await metrics.save();

        const recruiter = await User.findByPk(userId);
        if (recruiter && recruiter.reportingTo) {
          const tlDropPenalty = economy.teamDropped;
          await PointHistory.create({
            userId: recruiter.reportingTo,
            candidateId: candidate.id,
            actionType: "tl_team_dropped",
            statusName: "Team Candidate Dropped",
            pointsAwarded: tlDropPenalty,
            reason: `Team member ${recruiter.name} candidate dropped`
          });
          const [tlMetrics] = await UserMetrics.findOrCreate({ where: { userId: recruiter.reportingTo } });
          tlMetrics.totalCoins += tlDropPenalty;
          await tlMetrics.save();
        }
        continue; // Done with this action
      }

      // Normal Deduplication & Backwards Progression Logic
      const higherActionsThanConnected = [
        "interested", "processing_for_interview", "go_for_interview", 
        "interview_done", "selected", "processing_for_joining", 
        "joined", "dropped", "rejected", "not_interested", "status_not_interested",
        "interview_not_done"
      ];

      const hasReachedHigherThanConnected = actionType === "connected" && existingHistory.some(h => 
        higherActionsThanConnected.includes(h.actionType)
      );

      const isBackwardsMove = hasAwardedThisAction || hasReachedHigherThanConnected;

      if (isBackwardsMove) {
         logHook(`Deduplication/Backwards triggered: actionType "${actionType}" was either awarded previously or candidate has reached a higher status. Applying backwards revert penalty.`);
         await PointHistory.create({
           userId, candidateId: candidate.id, actionType: "backwards_penalty",
           statusName: candidate.remarks || "Backwards Status", pointsAwarded: -1,
           reason: hasReachedHigherThanConnected ? `Status moved backwards to connected from a higher status` : `Status reverted to a previously awarded status: ${actionType}`
         });
         const [metrics] = await UserMetrics.findOrCreate({ where: { userId } });
         metrics.totalCoins -= 1;
         await metrics.save();
         logHook("Backwards penalty applied. Metrics updated.");
         continue; // Done with this action
      }

      // Apply the points
      await PointHistory.create({
        userId,
        candidateId: candidate.id,
        actionType,
        statusName,
        pointsAwarded: points,
        reason
      });

      // Update global metrics for Recruiter
      const [metrics] = await UserMetrics.findOrCreate({ where: { userId } });
      metrics.totalCoins += points;
      if (actionType === "selected") metrics.totalSelections += 1;
      if (actionType === "joined") metrics.totalJoinings += 1;
      if (actionType === "register") metrics.uniqueCandidatesSourced += 1;
      await metrics.save();

      logHook(`Successfully awarded ${points} coins for ${actionType} to user ${userId}. New total: ${metrics.totalCoins}`);

      // HIERARCHY GAMIFICATION AWARDS
      if (User && (actionType === "selected" || actionType === "joined")) {
        const recruiter = await User.findByPk(userId);
        if (recruiter && recruiter.reportingTo) {
           const tlPoints = actionType === "selected" ? (economy.teamSelection || 5) : (economy.teamJoining || 8);
           const existingTLAward = await PointHistory.findOne({
              where: { userId: recruiter.reportingTo, candidateId: candidate.id, actionType: `tl_team_${actionType}` }
           });

           if (!existingTLAward) {
              await PointHistory.create({
                 userId: recruiter.reportingTo,
                 candidateId: candidate.id,
                 actionType: `tl_team_${actionType}`,
                 statusName: `Team ${actionType}`,
                 pointsAwarded: tlPoints,
                 reason: `Team member ${recruiter.name} candidate ${actionType}`
              });
              const [tlMetrics] = await UserMetrics.findOrCreate({ where: { userId: recruiter.reportingTo } });
              tlMetrics.totalCoins += tlPoints;
              await tlMetrics.save();
           }

           const tl = await User.findByPk(recruiter.reportingTo);
           if (tl && tl.reportingTo) {
               const mgrPoints = actionType === "selected" ? 10 : 20;
               const existingMgrAward = await PointHistory.findOne({
                  where: { userId: tl.reportingTo, candidateId: candidate.id, actionType: `mgr_team_${actionType}` }
               });

               if (!existingMgrAward) {
                  await PointHistory.create({
                     userId: tl.reportingTo,
                     candidateId: candidate.id,
                     actionType: `mgr_team_${actionType}`,
                     statusName: `Hierarchy ${actionType}`,
                     pointsAwarded: mgrPoints,
                     reason: `Hierarchy member ${recruiter.name} candidate ${actionType}`
                  });
                  const [mgrMetrics] = await UserMetrics.findOrCreate({ where: { userId: tl.reportingTo } });
                  mgrMetrics.totalCoins += mgrPoints;
                  await mgrMetrics.save();
               }
           }
        }
      }
    }

    // Unique count calculations for register
    if (isNew) {
      try {
        const uniquePhoneCount = await Candidate.count({
          where: { assignedTo: userId },
          distinct: true,
          col: 'phone'
        });
        const milestoneIndex = Math.floor(uniquePhoneCount / 200);
        logHook(`Unique phone count: ${uniquePhoneCount}, milestoneIndex: ${milestoneIndex}`);
        for (let i = 1; i <= milestoneIndex; i++) {
          const uniqueKey = `recruiter_unique_200_count_${userId}_${i}`;
          const alreadyAwarded = await PointHistory.findOne({ where: { userId, reason: uniqueKey } });
          if (!alreadyAwarded) {
            await PointHistory.create({
              userId,
              actionType: "recruiter_unique_200",
              statusName: "200 Recruiter Unique Candidates",
              pointsAwarded: 50,
              reason: uniqueKey
            });
            const [metrics] = await UserMetrics.findOrCreate({ where: { userId } });
            metrics.totalCoins += 50;
            await metrics.save();
            logHook(`Awarded 50 points for Recruiter Unique 200 Milestone #${i}`);
          }
        }

        // Team unique check
        const recruiter = await User.findByPk(userId);
        if (recruiter && recruiter.reportingTo) {
          const teamRecruiters = await User.findAll({
            where: { reportingTo: recruiter.reportingTo, role: 'recruiter' },
            attributes: ['id']
          });
          const teamRecruiterIds = teamRecruiters.map(r => r.id);
          const teamUniquePhoneCount = await Candidate.count({
            where: { assignedTo: teamRecruiterIds },
            distinct: true,
            col: 'phone'
          });
          const teamMilestoneIndex = Math.floor(teamUniquePhoneCount / 200);
          logHook(`Team unique phone count: ${teamUniquePhoneCount}, teamMilestoneIndex: ${teamMilestoneIndex}`);
          for (let i = 1; i <= teamMilestoneIndex; i++) {
            const uniqueKey = `team_unique_200_count_${recruiter.reportingTo}_${i}`;
            const alreadyAwarded = await PointHistory.findOne({ where: { reason: uniqueKey } });
            if (!alreadyAwarded) {
              await PointHistory.create({
                userId,
                actionType: "team_unique_200",
                statusName: "200 Team Unique Candidates",
                pointsAwarded: 70,
                reason: uniqueKey
              });
              const [metrics] = await UserMetrics.findOrCreate({ where: { userId } });
              metrics.totalCoins += 70;
              await metrics.save();
              logHook(`Awarded 70 points to recruiter ${userId} for Team Unique 200 Milestone #${i}`);
            }
          }
        }
      } catch (e) {
        logHook(`ERROR during unique count calculations: ${e.message}`);
        console.error("Unique candidate points calculation error:", e);
      }
    }
  } catch (error) {
    console.error("Gamification Hook Error:", error);
  }
};

Candidate.afterCreate(async (candidate, options) => {
  await assignGamificationPoints(candidate, true);
});

Candidate.afterUpdate(async (candidate, options) => {
  await assignGamificationPoints(candidate, false);
});

export { Candidate, Note };
