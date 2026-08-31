import { z } from 'zod'

const ratingSchema = z.coerce.number()
        .int("Rating must be an integer")
        .min(1, "Rating must be between 1 and 10")
        .max(10, "Rating must be between 1 and 10")
        .nullable()
        .optional();

const notesSchema = z.string().nullable().optional();

const addToReadlistItemSchema = z.object({
    bookId: z.string().uuid(),
    status: z.enum(["PLANNING","READING","COMPLETED"], {
        error: () => ({
            message: "Status must be one of: PLANNING, READING, COMPLETED",
        }),
    }).optional(),
    rating: ratingSchema,
    notes: notesSchema,
});// in here we define everything that we expect from the body in the add function controller

const updateToReadlistItemSchema = z.object({
    status: z.enum(["PLANNING", "READING", "COMPLETED"]).optional(),
    rating: ratingSchema,
    notes: notesSchema,
}).refine(
    (data) => Object.keys(data).length > 0, //the rule
    {
        message: "At least one field must be provided for update", //the message
    } //custom rule to provide at least one
); // it does not include the id of the book, not changeable

const getReadlistItemSchema = z.object({
    id: z.string().uuid(),
});

//types
export type ReadlistParams = z.infer<typeof getReadlistItemSchema>
export type AddToReadlistItem = z.infer<typeof addToReadlistItemSchema>
export type UpdateReadlistItem = z.infer<typeof updateToReadlistItemSchema>

export { addToReadlistItemSchema, updateToReadlistItemSchema, getReadlistItemSchema };