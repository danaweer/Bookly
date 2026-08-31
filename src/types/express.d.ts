import "express-serve-static-core";

//declaration merging.
//The Express Request object in my application may also contain a user property.
declare module "express-serve-static-core" {
    interface Request {
        user?: {
            id: string;
            name: string;
            email: string;
        };
    }
}
//the ? means not every request is authenticated.
// POST /auth/login
// → req.user probably doesn't exist

// GET /readlist
// → authMiddleware runs
// → req.user exists