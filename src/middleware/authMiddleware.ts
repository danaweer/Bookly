import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma } from "../config/db.js";
import type {Request, Response, NextFunction,} from "express";
import { env } from "../config/env.js";

// Read the token from the request
// Check if the token is valid
// Find the authenticated user
// Attach the user to req.user

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    let token: string | undefined;

    // 1. Check Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        token = req.headers.authorization.slice(7).trim();
    } else {
        // 2. Otherwise check the cookie
        const cookieToken = req.cookies?.jwt;

        if (typeof cookieToken === "string") {
            token = cookieToken;
        }
    }
    // 3. No token at all
    if (!token) {
        return res.status(401).json({
            error: "Not authorized, no token provided",
        });
    }
    // 4. Verify JWT
    let decoded: string | JwtPayload;

    try {
        decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
        console.error("JWT verification failed:", err);

        return res.status(401).json({
            error: "Not authorized",
        });
    }
    // 5. Make sure our JWT contains the id we expect
    if (
        typeof decoded === "string" ||
        typeof decoded.id !== "string"
    ) {
        return res.status(401).json({
            error: "Invalid token payload",
        });
    }
    // 6. Find the user in the database
    const user = await prisma.user.findUnique({
        where: {
            id: decoded.id,
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
    // 7. Token belongs to a user that no longer exists
    if (!user) {
        return res.status(401).json({
            error: "User no longer exists",
        });
    }
    // 8. Attach authenticated user to the request
    req.user = user;
    // 9. Continue to the next middleware/controller
    next();
};