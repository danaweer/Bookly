import { z } from 'zod'

const emailSchema = z.string().trim().toLowerCase().email({ message: "Invalid email address format" })

const passwordSchema = z.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(32, { message: "Password cannot exceed 32 characters" })
        .refine((val) => /[A-Z]/.test(val), {
            message: "Must contain at least one uppercase letter",
        })
        .refine((val) => /[a-z]/.test(val), {
            message: "Must contain at least one lowercase letter",
        })
        .refine((val) => /[0-9]/.test(val), {
            message: "Must contain at least one number",
        })
        .refine((val) => /[^A-Za-z0-9]/.test(val), {
            message: "Must contain at least one special character",
        })

const userRegistrationValidatorSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters")
        .max(50, "Name must be under 50 characters")
        .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
    email: emailSchema,
    password: passwordSchema,
});

const userLoginValidatorSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, { message: "Password is required" }),
    //the password here is not strongly checked, the controller woul do the job if the password matched to the val in the table or not
});
//Registration validates password quality. Login validates credentials.

//types
export type RegisterBody =
    z.infer<typeof userRegistrationValidatorSchema>;

export type LoginBody =
    z.infer<typeof userLoginValidatorSchema>;

export { userRegistrationValidatorSchema, userLoginValidatorSchema };