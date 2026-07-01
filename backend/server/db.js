import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import net from "net";

dotenv.config();

let isDbConnected = false;

const DB_URL = process.env.DATABASE_URL;

let sequelize;
if (DB_URL) {
  sequelize = new Sequelize(DB_URL, {
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      connectTimeout: 15000,
      ssl: {
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 50,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    hooks: {
      beforeDefine(attributes, options) {
        const name = options.freezeTableName ? options.name.singular : options.name.plural;
        options.tableName = (options.tableName || name).toLowerCase();
      }
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || "fast_rms",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "",
    {
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT || 3306,
      dialect: "mysql",
      logging: false,
      dialectOptions: {
        connectTimeout: 5000
      },
      pool: {
        max: 50,
        min: 2,
        acquire: 15000,
        idle: 10000
      },
      hooks: {
        beforeDefine(attributes, options) {
          const name = options.freezeTableName ? options.name.singular : options.name.plural;
          options.tableName = (options.tableName || name).toLowerCase();
        }
      }
    }
  );
}

const testHostPort = (host, port = 3306, timeout = 500) => {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.connect(port, host, () => {
      socket.destroy();
      resolve();
    });
    socket.on('error', (err) => {
      socket.destroy();
      reject(err);
    });
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error("timeout"));
    });
  });
};

const connectDB = async () => {
  if (process.env.DATABASE_URL || process.env.DB_HOST) {
    try {
      await sequelize.authenticate();
      isDbConnected = true;
      console.log("MySQL Connected via Environment Variables");
    } catch (err) {
      isDbConnected = false;
      console.error("MySQL Connection via Environment Variables Failed:", err.message);
    }
    return;
  }

  const candidateHosts = ["127.0.0.1", "localhost", "::1"];
  let workingHost = null;
  let workingPort = 3306;

  console.log("Probing MySQL loopback hosts on ports 3306 and 3307...");
  for (const port of [3306, 3307]) {
    for (const host of candidateHosts) {
      try {
        await testHostPort(host, port, 400);
        workingHost = host;
        workingPort = port;
        console.log(`Successfully reached host: ${host} on port ${port}`);
        break;
      } catch (e) {
        // Silence connection errors during probe
      }
    }
    if (workingHost) break;
  }

  if (!workingHost) {
    // Fallback to testing default host just in case
    workingHost = "127.0.0.1";
    workingPort = 3306;
  }

  try {
    sequelize.config.host = workingHost;
    sequelize.config.port = workingPort;
    if (sequelize.connectionManager?.config) {
      sequelize.connectionManager.config.host = workingHost;
      sequelize.connectionManager.config.port = workingPort;
    }
    await sequelize.authenticate();
    isDbConnected = true;
    console.log(`MySQL Connected to fast_rms via Sequelize on ${workingHost}:${workingPort}`);
  } catch (err) {
    isDbConnected = false;
    console.error("MySQL Connection Failed:", err.message);
    console.warn("WARNING: Database is offline. Running backend in offline survival mode.");
  }
};

export { sequelize, isDbConnected };
export default connectDB;
