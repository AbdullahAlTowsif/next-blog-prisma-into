import { Request, Response } from "express";
import { UserService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
    try {
        const result = await UserService.createUser(req.body)
        res.status(201).send(result)
    } catch (error) {
        // console.log(error);
        res.status(500).send(error)
    }
}

const getAllFromDB = async (req: Request, res: Response) => {
    try {
        const result = await UserService.getAllFromDB()
        res.send(result)
    } catch (error) {
        console.log(error);
    }
}

const getUserById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const result = await UserService.getUserById(id)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).send(error);
    }
}

export const UserController = {
    createUser,
    getAllFromDB,
    getUserById,
}
