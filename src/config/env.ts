import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),

    JWT_EXPIRES_IN: z.enum([
        "15m",
        "30m",
        "1h",
        "6h",
        "12h",
        "1d",
        "7d",
        "30d",
    ]).default("7d"),

    CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),

    NODE_ENV: z.enum([
        "development",
        "test",
        "production",
    ]).default("development"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error(
        "Invalid environment variables:",
        parsedEnv.error.flatten().fieldErrors
    );

    process.exit(1);
}

export const env = parsedEnv.data;