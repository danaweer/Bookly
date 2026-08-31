import { prisma } from '../config/db.js'
import type { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import type { ReadlistParams, AddToReadlistItem, UpdateReadlistItem } from '../validators/readlistValidators.ts'

// type ReadlistParams = {
//     id: string;
// }; 

// type AddToReadlistItem = {
//     bookId: string,
//     status?: "PLANNING" | "READING" | "COMPLETED", 
//     rating?: number | null, 
//     notes?: string | null,
// };

// type UpdateReadlistItem = {
//     status?: "PLANNING" | "READING" | "COMPLETED",
//     rating?: number | null, 
//     notes?: string | null,
// };

const addToReadlist = async (req: Request<Record<string, never>, unknown, AddToReadlistItem>, res: Response) => {

    if (!req.user) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }; //this guarantees the user is not undefined but a User -> type safety

    const {bookId, status, rating, notes} = req.body;

    //Verify book exists in the books table
    const book = await prisma.book.findUnique({
        where: { id: bookId },
    });
    if(!book) {
        return res.status(404).json({ error: "Book Not Found"});
    }

    //Verify book if it was added already
    const existingInReadlist = await prisma.readListItem.findUnique({
        where: { userId_bookId: {
            // userId: userId, before
            userId: req.user.id, //we will get the user from the request instead of the body
            bookId: bookId,
        } }, 
    })
    if(existingInReadlist) {
        return res.status(400).json({ error: "Book already in the readlist"});
    }

    const readlistItem = await prisma.readListItem.create({
        data: {
            userId: req.user.id,
            bookId,
            status: status ?? "PLANNING", //Use "PLANNING" only if status is null or undefined.
            ...(rating !== undefined && { rating }),
            ...(notes !== undefined && { notes }),
        }
    });

    return res.status(201).json({
        status: "Success",
        data: {
            readlistItem,
        }
    });
}; // adding the readlist


const removeFromReadlist = async (req: Request<ReadlistParams>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }; //this guarantees the user is not undefined but a User -> type safety
    
    //find readlistItem item and verify ownership
    const readlistItem = await prisma.readListItem.findUnique({
        where: {id:req.params.id},
    });//the .id is the same as the :id in the routes folder -> this will return 
                                                            // readlistItem = {
                                                            //     id: "item-123",
                                                            //     userId: "user-555",
                                                            //     bookId: "book-10",
                                                            //     status: "READING"
                                                            // }
    if(!readlistItem){
        return res.status(404).json({ error : "Readlist Item Not Found"});
    }
    // Ensure only owner can delete the item
    if(readlistItem.userId !== req.user.id){
        return res.status(403).json({error: "Not allowed to delete this watchlistItem"});
    }

    await prisma.readListItem.delete({
        where: { id:req.params.id },
    });

    return res.status(200).json({
        status: "Success",
        message: "Book Removed from readlist",
    })
}; // removing the readlist


const updateFromReadlist = async (req: Request<ReadlistParams, unknown, UpdateReadlistItem>, res: Response) => {

    if (!req.user) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }; //this guarantees the user is not undefined but a User -> type safety

    const { status, rating, notes } = req.body;

    //find readlist item and verify ownership
    const readlistItem = await prisma.readListItem.findUnique({
        where: {id: req.params.id},
    })
    //Verify readlist item exists
    if(!readlistItem){
        return res.status(404).json({error: "ReadlistItem Not Found"});
    }
    // Ensure only owner can update the item
    if(readlistItem.userId !== req.user.id){
        return res.status(403).json({error: "Not allowed to update this watchlistItem"});
    }
    // Build update data
    const updateData: Prisma.ReadListItemUpdateInput = {};
    // const validStatuses = ["PLANNING", "READING", "COMPLETED"];
    if (status !== undefined) updateData.status = status;
    if(rating !== undefined) updateData.rating = rating;
    if(notes !== undefined) updateData.notes = notes;

    // Update the readlist
    const updatedReadlistItem = await prisma.readListItem.update({
        where: {id: req.params.id},
        data: updateData,
    });

    return res.status(200).json({
        status: "Success",
        data: updatedReadlistItem,
    });

}; // updating the readlist


const getAllReadlist = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }; //this guarantees the user is not undefined but a User -> type safety
    
    const readlist = await prisma.readListItem.findMany({
        where: {userId: req.user.id}
    });

    return res.status(200).json({
        status: "Success",
        data: readlist,
    })
}; // get all readlist


const getOneReadlist = async (req: Request<ReadlistParams>, res: Response) => {
    if (!req.user) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }; //this guarantees the user is not undefined but a User -> type safety

    const readlistItem = await prisma.readListItem.findUnique({
        where: {id: req.params.id}
    });

    if(!readlistItem){
        return res.status(404).json({error: "ReadlistItem Not Found"});
    }

    if(readlistItem.userId !== req.user.id){
        return res.status(403).json({error: "Not allowed to fetch this watchlistItem"});
    }
    
    return res.status(200).json({
        status: "Success",
        data: readlistItem,
    });
}; // get one readlist


export { addToReadlist, removeFromReadlist, updateFromReadlist, getAllReadlist, getOneReadlist };