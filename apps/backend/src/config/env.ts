const getRequiredEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
};

const getRequiredNumberEnv = (name: string) => {
  const value = Number(getRequiredEnv(name));

  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a valid number`);
  }

  return value;
};

export const DATABASE_URL = getRequiredEnv("DATABASE_URL");
export const JWT_SECRET = getRequiredEnv("JWT_SECRET");
export const PORT = getRequiredNumberEnv("PORT");
export const CLIENT_ORIGIN = getRequiredEnv("CLIENT_ORIGIN");
export const APP_TIMEZONE = process.env.APP_TIMEZONE ?? "Asia/Ho_Chi_Minh";