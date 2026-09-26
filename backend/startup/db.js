const winston = require("winston");
const mongoose = require("mongoose");
const config = require("../config");

module.exports = async function connectDB() {
  // Read database settings from the environment with local defaults.
  const dbHost = config.get("DB_HOST") || "172.17.16.1";
  const dbName = config.get("DB_NAME") || "vidly";
  const replicaSet = config.get("DB_REPLICA_SET");
  // A replica set needs its replicaSet option; otherwise use a direct connection.
  const connectionOption = replicaSet
    ? `replicaSet=${encodeURIComponent(replicaSet)}`
    : "directConnection=true";
  const uri = `mongodb://${dbHost}:27017/${dbName}?${connectionOption}`;

  // Open one shared Mongoose connection for the application.
  try {
    await mongoose.connect(uri);
    winston.info(`Connected to MongoDB (${dbName})...`);
  } catch (err) {
    winston.error("Could not connect to MongoDB...", err);
    process.exit(1);
  }
};
