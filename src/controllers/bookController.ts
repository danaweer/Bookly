import { prisma } from '../config/db.js'
import type { Prisma } from "@prisma/client"; //Import Prisma’s type
import type { Request, Response } from "express";
import type { AddBookBody, UpdateBookBody, BookParams } from '../validators/bookValidators.js';

// type BookParams = {
//     id: string;
// }; //req.params has the shape of type BookParams 

// type AddBookBody = {
//     title: string;
//     overview?: string | null; //might be a string | null | undefined -> this one is excluded
//     releaseYear: number;
//     genres: string[];
//     author: string;
// };

// type UpdateBookBody = {
//     title?: string;
//     overview?: string | null;
//     releaseYear?: number;
//     genres?: string[];
//     author?: string;
// };

const addBook = async (req: Request<Record<string, never>, unknown, AddBookBody>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }; //this guarantees the user is not undefined but a User -> type safety

    const { title, overview, releaseYear, genres, author } = req.body;

    const existingBook = await prisma.book.findFirst({
        where: { 
            title, releaseYear, author }, 
    })
    if(existingBook) {
        return res.status(400).json({ error: "Book already exists "});
    }

    const book = await prisma.book.create({
        data: {
            title,
            releaseYear,
            genres,
            author,
            createdById: req.user.id,
            ...(overview !== undefined && {overview: overview}), //Add overview to the object only if the user actually provided it. IF overview exists THEN give me { overview }
        },
    });

    return res.status(201).json({
        status:"Success",
        data: {
            book,
        }
    });
}; //create


const deleteBook = async (req: Request<BookParams>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    };

    const book = await prisma.book.findUnique({
        where: {id: req.params.id},
    })

    if(!book){
        return res.status(404).json({error:"Book not found"});
    }
    if(book.createdById !== req.user.id){
        return res.status(403).json({error:"Not allowed to delete this Book"});
    }

    await prisma.book.delete({
        where: {id: req.params.id},
    });

    return res.status(200).json({
        status: "Success",
        message: "Book deleted successfully",
    });
}; //remove


const updateBook = async (req: Request<BookParams, unknown, UpdateBookBody>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    };
    
    const { title, overview, releaseYear, genres, author } = req.body;

    const book = await prisma.book.findUnique({
        where: {id: req.params.id}
    })
    if(!book){
        return res.status(404).json({error: "Book does not exist"});
    }
    if(book.createdById !== req.user.id){
        return res.status(403).json({error: "Not allowed to update this Book"})
    }

    const updatedBook: Prisma.BookUpdateInput = {}; 
    //→ describes what PRISMA accepts for database update, prisma created the type
    //it was updatebook = {};
    // then this const updatedBook: UpdateBookBody = {};

    if(title !== undefined) updatedBook.title = title;
    if(overview !== undefined) updatedBook.overview = overview;
    if(releaseYear !== undefined) updatedBook.releaseYear = releaseYear;
    if(genres !== undefined) updatedBook.genres = genres;
    if(author !== undefined) updatedBook.author = author;

    const updatedBookItem = await prisma.book.update({
        where: {id: req.params.id},
        data: updatedBook,
    });

    return res.status(200).json({
        status: "Success",
        data: updatedBookItem,
    });
}; //update


const getAllBooks = async (_req: Request, res: Response) => {
    const books = await prisma.book.findMany();
    
    return res.status(200).json({
        status: "Success",
        data: {
            books,
        },
    });
}; //get all book


const getOneBook = async (req: Request<BookParams>, res: Response) => {
    const book = await prisma.book.findUnique({
        where: {id: req.params.id}
    });
    if(!book){
        return res.status(404).json({error: "Book does not exist"});
    };
    return res.status(200).json({
        status: "Success",
        data: book,
    });
}; //get one books


export { addBook, deleteBook, updateBook, getAllBooks, getOneBook };