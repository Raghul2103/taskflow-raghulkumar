import dotenv from 'dotenv';
dotenv.config();

const config = {
  mongodb: {
    url: process.env.MONGODB_URI || "mongodb://localhost:27017/taskflow",
    databaseName: "taskflow",
    options: {
      // Deprecated options removed
    }
  },
  migrationsDir: "migrations",
  changelogCollectionName: "migrations",
  migrationStrategy: "stateless",
};

export default config;
