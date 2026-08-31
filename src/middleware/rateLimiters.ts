import { rateLimit } from "express-rate-limit";

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many requests, please try again later",
    },
});// for books or readlist used in the server.js file

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true, // to skip the successful attepts as every request counts toward the limit
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: "error",
        message: "Too many authentication attempts. Try again later.",
    },
}); // for users auth, used in the authRoutes file in teh middlewares