import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodType } from "zod";

type ValidationTarget = "body" | "params";

export const validateRequest = 
    (schema: ZodType, target: ValidationTarget= "body"): RequestHandler => {
        return (req: Request, res: Response, next: NextFunction) => {

            // const allowedTargets = ["body", "params", "query"]; //default is body

            // if (!allowedTargets.includes(target)) {
            //     throw new Error(`Invalid validation target: ${target}`);
            // } //before typing the validationTarget

            const result = schema.safeParse(req[target]); //it will check if the body of the request passes or matches the schema we created and will give the parsed data -> this is the validation

            if(!result.success){

                const flatErrors = result.error.issues.map(
                (issue) => issue.message)

                console.log(flatErrors);

                return res.status(400).json({ message: flatErrors.join(", ") });
            } 

            req[target] = result.data; //passing the valid result to the controller through the req.body or params or query -> the validated data
            next(); //move on with the request
        };//this is the actual middleware function
}