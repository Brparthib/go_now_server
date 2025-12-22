import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: string;
  DB_URL: string;
  NODE_ENV: string;
  BCRYPT_SALT_ROUND: string;
  ADMIN_PHONE: string;
  ADMIN_PASSWORD: string;
  JWT: {
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRES: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES: string;
  };
  FRONTEND_URL: string;
}

const loadEnvVars = (): EnvConfig => {
  const requiredEnvVars: string[] = [
    "PORT",
    "DB_URL",
    "NODE_ENV",
    "BCRYPT_SALT_ROUND",
    "ADMIN_PHONE",
    "ADMIN_PASSWORD",
    "AGENT_PHONE",
    "AGENT_PASSWORD",
    "USER_PHONE",
    "USER_PASSWORD",
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES",
    "MINIMUM_BALANCE",
    "CHARGE_LIMIT",
    "PERCENTAGE_LIMIT",
    "FRONTEND_URL",
  ];

  requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable ${key}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as string,
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
    ADMIN_PHONE: process.env.ADMIN_PHONE as string,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
    JWT: {
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
      JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
      JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
    },
    FRONTEND_URL: process.env.FRONTEND_URL as string,
  };
};

export const envVars = loadEnvVars();