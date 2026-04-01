import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://streamqueue:streamqueue@localhost:5432/streamqueue",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  nodeEnv: process.env.NODE_ENV || "development",

  // Subscription tier limits for concurrent streams
  tierLimits: {
    basic: 1,
    standard: 2,
    premium: 4,
  } as Record<string, number>,

  // Session heartbeat timeout in minutes
  sessionTimeoutMinutes: 5,
};
