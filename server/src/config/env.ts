import "dotenv/config";

const getRequiredEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
};

export const port = Number(process.env.PORT ?? 4000);
export const clientOrigin = process.env.CLIENT_ORIGIN;
export const appTimezone = "Asia/Ho_Chi_Minh";
export const jwtSecret = getRequiredEnv("JWT_SECRET");