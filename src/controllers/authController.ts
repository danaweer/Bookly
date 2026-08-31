import { prisma } from '../config/db.js'
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';
import type { Request, Response } from "express";
import type { RegisterBody, LoginBody } from '../validators/userValidators.ts'


// type RegisterBody = {
//     name: string, 
//     email: string, 
//     password: string,
// };

// type LoginBody = {
//     email: string, 
//     password: string,
// }

const register = async (req: Request<Record<string, never>, unknown, RegisterBody>, res: Response) => {

    const { name, email, password } = req.body;

    //registering a NEW User
    //check if the user already exist
    const userExists = await prisma.user.findUnique({
        where: {email: email},
    }); //this is to check if the user that have the email is equal to the email that came from the requested body, there is no 2 users that have the same email

    if(userExists){
        return res
            .status(400)
            .json({ error: "User already exists with this email" });
    }

    //Hash password
    const salt = await bcrypt.genSalt(10); //the amount of hash you want it to be
    const hashedPassword = await bcrypt.hash(password, salt); //takes 2 arguments and that how you hash the password

    // Create User
    const user = await prisma.user.create({
        data: {
            name, 
            email, 
            password: hashedPassword,
        },
    });

    // Generate JWT Token
    const token = generateToken(user.id, res);

    res.status(201).json({
        status: "success",
        data:{
            user:{
                id: user.id, //from the generated id from DB
                name: name, //from teh body
                email: email, //from teh body
            },
            token,
        },
    }); //returning a response to the user a success message along with the data that is being saved
}; // registering a new user

// -----------------------------------------------------------------------------

const login = async (req: Request<Record<string, never>, unknown, LoginBody>, res: Response) => {
    const { email, password } = req.body;
    //check if hte user email exists in the table
    const user = await prisma.user.findUnique({
        where: {email: email},
    });

    if(!user){
        return res.status(401).json({ error: "Invalid email or password" });
    }

    //verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = generateToken(user.id, res);

    res.status(200).json({
        status: "success",
        data:{
            user:{
                id: user.id, 
                email: email, 
            },
            token,
        },
    });
} //logging a user

// -----------------------------------------------------------------------------

const logout = async (_req:Request, res: Response) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({
        status: "success",
        message: "Logged out successfully"
    });
}; //logging out a user

export { register, login, logout };