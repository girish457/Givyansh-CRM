import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import User from "./User.js";
import Company from "./Company.js";

const Feedback = sequelize.define("Feedback", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  recruiterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id"
    }
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "companies",
      key: "id"
    }
  },
  feedbackType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false
  },
  toTL: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  toManager: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  toBoss: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM("Sent", "Read", "Replied"),
    defaultValue: "Sent"
  },
  readByTL: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readByTLAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  readByTLId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id"
    }
  },
  readByManager: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readByManagerAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  readByManagerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id"
    }
  },
  readByBoss: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readByBossAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  readByBossId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id"
    }
  },
  isClosed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: "feedbacks"
});

const FeedbackReply = sequelize.define("FeedbackReply", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  feedbackId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "feedbacks",
      key: "id"
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id"
    }
  },
  senderRole: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: "feedback_replies"
});

// Relationships
Feedback.belongsTo(User, { foreignKey: "recruiterId", as: "recruiter" });
Feedback.belongsTo(Company, { foreignKey: "companyId", as: "company" });
Feedback.hasMany(FeedbackReply, { foreignKey: "feedbackId", as: "replies", onDelete: "CASCADE" });

FeedbackReply.belongsTo(Feedback, { foreignKey: "feedbackId", as: "feedback" });
FeedbackReply.belongsTo(User, { foreignKey: "senderId", as: "sender" });

Feedback.belongsTo(User, { foreignKey: "readByTLId", as: "tlReader" });
Feedback.belongsTo(User, { foreignKey: "readByManagerId", as: "managerReader" });
Feedback.belongsTo(User, { foreignKey: "readByBossId", as: "bossReader" });

export { Feedback, FeedbackReply };
