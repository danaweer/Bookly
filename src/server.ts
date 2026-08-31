// const express = require('express'); //import the express package
import express from "express"; // this is the module way
import bookRoutes from "./routes/bookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import readlistRoute from "./routes/readlistRoutes.js"
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { apiLimiter } from "./middleware/rateLimiters.js";
import type { Request, Response, NextFunction } from "express";
import type { Server } from "node:http";
import { env } from './config/env.js'

import { connectDB, disconnectDB } from "./config/db.js";

const app = express(); //our app uses express

const corsOptions = {
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}// CORS configuration controlling which frontend origin
// can make cross-origin requests to this API

app.use(helmet());// adds security headers to the response

app.use(cors(corsOptions)); //will allow the forntend to communicate with the backend
app.use(apiLimiter);
//Body parsing middlewares
app.use(express.json()); //this will allow the json to be handled and read from the body
app.use(express.urlencoded({ extended: true })); // to automatically parse data from an html form submission so that you can access in teh req.body
app.use(cookieParser()); //can actually read the JWT cookie in the authentication part of the auth

//api routes
app.use("/books", bookRoutes);
app.use("/auth", authRoutes); //in the url e.g.. /auth/register
app.use("/readlist", readlistRoute);

app.use((_req, res) => {
    return res.status(404).json({
        status: "error",
        message: "Route not found",
    });
}); // if the user reached a route does'nt exist

// Return API errors as JSON instead of Express's default HTML error page.
//Keep the fourth parameter, because Express recognizes error middleware by the four-argument signature
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
        // First narrow unknown → object
        if (typeof err === "object" && err !== null) {
            // Prisma database unavailable
            if ("code" in err && err.code === "P1001") {
                return res.status(503).json({
                    status: "error",
                    message: "Database is currently unavailable",
                });//This err object actually contains a property named code.
            }
            // Prisma unique constraint violation
            if ("code" in err &&err.code === "P2002") {
                return res.status(409).json({
                    status: "error",
                    message:
                        "A resource with these unique values already exists",
                });
            }
            // Invalid JSON sent to express.json()
            if ("status" in err && "type" in err && err.status === 400 &&
                err.type === "entity.parse.failed") {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid JSON body",
                });
            }
        }
        // Anything else
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
);

const PORT = 5001; 
let server: Server | undefined;

const startServer = async (): Promise<void> => {
    try {
        await connectDB();

        // start listening third
        server = app.listen(PORT, () => {
            console.log(`Server running on PORT ${PORT}`);
        });

    } catch (err) {
        console.error("Failed to start the server:", err);
        process.exit(1);
    }
};

await startServer();

// Close HTTP server safely
const closeServer = (): Promise<void> => {

    return new Promise((resolve, reject) => {
        // Server may not have started yet
        if (!server) {
            resolve();
            return;
        }
        server.close((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};

// Shared graceful-shutdown function
const shutdown = async (exitCode: number): Promise<void> => {

    try {
        await closeServer();
        await disconnectDB();

    } catch (err) {
        if (err instanceof Error) {
            console.error(
                "Shutdown error:",
                err.message
            );
        } else {
            console.error(
                "Shutdown error:",
                err
            );
        }
    } finally {
        process.exit(exitCode);
    }
};

// Handle Unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:",err);
    void shutdown(1);
});

// Uncaught synchronous exception
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:",err);
    void shutdown(1);
});

// Production shutdown signal
process.on("SIGTERM", () => {
    console.log( "SIGTERM received, shutting down gracefully");
    void shutdown(0);
});

// Ctrl+C during local development in the terminal
process.on("SIGINT", () => {
        console.log("SIGINT received, shutting down gracefully");
        void shutdown(0);
});//SIGTERM which is a signal when the app is stopped in production it will gracefully shutdown the service and exit the database normally
