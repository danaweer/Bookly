// import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'; //must have for prisma 5+
import { env } from './env.js'

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL, 
});//new prisma requires this, the adapter

const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === "development"
    ? ["query", "error", "warn"]
    : ["error"],
}); //and this

const connectDB = async () => {
    try {
      await prisma.$connect();
      console.log("DB connected via Prisma");

    } catch (err) {
        if (err instanceof Error) {
          console.error(`Database connection error: ${err.message}`);
        } else {
          console.error("Database connection error:", err);
        }
        throw err;
    }
};//connecting db

const disconnectDB = async () => {
    await prisma.$disconnect();
};// diconnecting db

// catch (err)
//      ↓
// err: unknown
//      ↓
// err instanceof Error
//      ↓
// err: Error
//      ↓
// err.message ✅

export { prisma, connectDB, disconnectDB};