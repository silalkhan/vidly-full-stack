const mongoose = require("mongoose");

async function connectTestDatabase() {
  // Use a separate database name so integration tests do not touch development data.
  const dbHost = process.env.DB_HOST || "172.17.16.1";
  const dbName = process.env.DB_NAME || "vidly_test";
  const replicaSet = process.env.DB_REPLICA_SET;
  const connectionOption = replicaSet
    ? `replicaSet=${encodeURIComponent(replicaSet)}`
    : "directConnection=true";
  const uri = `mongodb://${dbHost}:27017/${dbName}?${connectionOption}`;

  // Avoid opening a second connection when Jest reuses the test process.
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  }
}

async function closeTestDatabase() {
  // Release the shared connection after the integration suite finishes.
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = { connectTestDatabase, closeTestDatabase };
