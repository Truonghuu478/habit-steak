const getRequiredEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
};

export const databaseUrl = process.env.DATABASE_URL;
export const jwtSecret = getRequiredEnv("JWT_SECRET");
export const port = Number(process.env.PORT ?? 4000);
export const clientOrigin = process.env.CLIENT_ORIGIN;
export const appTimezone = process.env.APP_TIMEZONE ?? "Asia/Ho_Chi_Minh";