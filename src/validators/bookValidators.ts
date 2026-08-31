import { z } from 'zod'

const currentYear = new Date().getFullYear(); //gets the current year

const addBookSchema = z.object({
    title: z.string().trim().min(1),
    overview: z.string().nullable().optional(),
    releaseYear: z.number().int().min(1900).max(currentYear),
    genres: z.array(z.string().trim().min(1)).min(1),
    author: z.string().trim().min(1),
});

const updateBookSchema = addBookSchema.partial().refine(
    (data) => Object.keys(data).length > 0, //the rule
    {
        message: "At least one field must be provided for update", //the message
    } //custom rule to provide at least one
);

const getBookParamsSchema = z.object({
    id: z.string().uuid(),
}); 

export type AddBookBody = z.infer<typeof addBookSchema>;
export type UpdateBookBody = z.infer<typeof updateBookSchema>;
export type BookParams = z.infer<typeof getBookParamsSchema>;

export { addBookSchema, updateBookSchema, getBookParamsSchema };