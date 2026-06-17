import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import User from "./User.js";
import Company from "./Company.js";

const Policy = sequelize.define("Policy", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "companies",
      key: "id"
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  effectiveDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "1.0"
  },
  severityLevel: {
    type: DataTypes.ENUM("Informational", "Mandatory", "Critical"),
    allowNull: false,
    defaultValue: "Informational"
  },
  status: {
    type: DataTypes.ENUM("Draft", "Active", "Archived"),
    allowNull: false,
    defaultValue: "Draft"
  },
  assignedToType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "All" // "All", "Managers", "TLs", "Recruiters", "Individual", "Custom"
  },
  assignedToIds: {
    type: DataTypes.TEXT, // JSON string of IDs
    allowNull: true
  },
  documents: {
    type: DataTypes.TEXT, // JSON string of [{ name, url, docType }]
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id"
    }
  },
  createdByName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdByRole: {
    type: DataTypes.STRING,
    allowNull: false
  },
  modifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id"
    }
  },
  modifiedByName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  versionHistory: {
    type: DataTypes.TEXT, // JSON string of historical versions
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: "policies"
});

const PolicyAcknowledgement = sequelize.define("PolicyAcknowledgement", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id"
    }
  },
  policyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "policies",
      key: "id"
    }
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false
  },
  openedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  readDuration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0 // in seconds
  },
  pagesViewed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  scrollProgress: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  documentsViewed: {
    type: DataTypes.TEXT, // JSON string list of viewed document names
    allowNull: true
  },
  accepted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  acceptedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  device: {
    type: DataTypes.STRING,
    allowNull: true
  },
  browser: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: "policy_acknowledgements"
});

const PolicyAuditLog = sequelize.define("PolicyAuditLog", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  policyId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id"
    }
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userRole: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false // e.g. View, Open, Download, Scroll, Accept, Create, Edit, Archive, Reactivate, Delete
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  device: {
    type: DataTypes.STRING,
    allowNull: true
  },
  browser: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  updatedAt: false,
  tableName: "policy_audit_logs"
});

// Relationships
Policy.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Policy.belongsTo(User, { foreignKey: "modifiedBy", as: "modifier" });
Policy.belongsTo(Company, { foreignKey: "companyId", as: "company" });
Policy.hasMany(PolicyAcknowledgement, { foreignKey: "policyId", as: "acknowledgements", onDelete: "CASCADE" });

PolicyAcknowledgement.belongsTo(Policy, { foreignKey: "policyId", as: "policy" });
PolicyAcknowledgement.belongsTo(User, { foreignKey: "userId", as: "user" });

export { Policy, PolicyAcknowledgement, PolicyAuditLog };
