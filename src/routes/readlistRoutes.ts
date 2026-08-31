import express from "express";
import { addToReadlist, removeFromReadlist, updateFromReadlist, getAllReadlist, getOneReadlist } from "../controllers/readlistController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js"; 
import { addToReadlistItemSchema, updateToReadlistItemSchema, getReadlistItemSchema } from "../validators/readlistValidators.js"

const router = express.Router();
// router.post("/", authMiddleware, addToReadlist); if you want to add the middleware to a single route and not all of them

// router.use(authMiddleware); // to apply the middleware before and on any request

router.post("/", authMiddleware, validateRequest(addToReadlistItemSchema), addToReadlist); //it haves the validate middleware that passes the schema as an argument

router.get("/", authMiddleware, getAllReadlist);

router.get("/:id", authMiddleware, validateRequest(getReadlistItemSchema, "params"),  getOneReadlist);

router.patch("/:id",
    authMiddleware,
    validateRequest(getReadlistItemSchema, "params"),
    validateRequest(updateToReadlistItemSchema, "body"),
    updateFromReadlist
);

router.delete(
    "/:id",
    authMiddleware,
    validateRequest(getReadlistItemSchema, "params"),
    removeFromReadlist
);

export default router