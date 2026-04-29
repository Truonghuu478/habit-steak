import { PrismaClient } from "@prisma/client";
import { DATABASE_URL } from "../config/env.js";

export const prisma = new PrismaClient({
	datasources: {
		db: {
			url: DATABASE_URL
		}
	}
});