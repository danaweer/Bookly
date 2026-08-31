//import jwt, { type SignOptions } from 'jsonwebtoken' old before env
import jwt  from 'jsonwebtoken'
import type { Response } from "express";
import { env } from "../config/env.js";

export const generateToken = (userId: string, res: Response): string => {
//This function can only receive a string as userId and an Express response as res
// :string shows the return type of the token that is going to be returned from the function
    // const jwtSecret = process.env.JWT_SECRET;//might be string | undefined(type narrowing) //old
    const jwtSecret = env.JWT_SECRET;//might be string | undefined(type narrowing)

    // if(!jwtSecret) {
    //     throw new Error ("JWT_SECRET is not defined");
    // } // this is removed after we imported the validated env

    // const expiresIn = ( //old
    //     process.env.JWT_EXPIRES_IN ?? "7d"
    // ) as NonNullable<SignOptions["expiresIn"]>;//nonnullable removes null | undefined

    const expiresIn = (
        env.JWT_EXPIRES_IN ?? "7d"
    ); //as NonNullable<SignOptions["expiresIn"]>;//nonnullable removes null | undefined

    const payload = { id: userId }; //the payload that is going to be inserted inside of a token(an object)

    const token = jwt.sign(payload, jwtSecret, {
        expiresIn,
    });//produces a token string in this usage.

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict", //stop the browser from sending the cookie in the client side
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days calculated through milliseconds
    }); //returning a cookie in the response to the user
    
    return token;
};

