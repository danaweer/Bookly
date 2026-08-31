import express from "express";
import { addBook, deleteBook, updateBook, getAllBooks, getOneBook } from "../controllers/bookController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { addBookSchema, updateBookSchema, getBookParamsSchema } from "../validators/bookValidators.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", validateRequest(addBookSchema), addBook);

router.get("/", getAllBooks);

router.get("/:id", validateRequest(getBookParamsSchema, "params"), getOneBook);

router.patch(
    "/:id",
    validateRequest(getBookParamsSchema, "params"),
    validateRequest(updateBookSchema, "body"),
    updateBook
);

router.delete(
    "/:id",
    validateRequest(getBookParamsSchema, "params"),
    deleteBook
);

export default router