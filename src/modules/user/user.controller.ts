import { Request, Response } from "express";
import { userService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
    const { name, email } = req.body;
    try {
        const result = await userService.createUser(name, email)
        // console.log(result.rows[0])
        res.status(201).json({
            success: true,
            message: "Data inserted successfully",
            data: result.rows[0]
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getUser = async (req: Request, res: Response) => {
    try {
        const result = await userService.getUser()
        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: result.rows,
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            details: error
        })
    }
}

const getSingleUser = async (req: Request, res: Response) => {
   
    try {
        const result = await userService.getSingleUser(req.params.id as string);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
        } else {
            res.status(200).json({
                success: true,
                message: "User fetched successfully...",
                data: result.rows[0]
            });
        };
        // console.log(result.rows)
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            details: err
        });
    };
}

const updateUser = async (req: Request, res: Response) => {
    const { name, email } = req.body;
    try {
        const result = await userService.updateUser(name, email, req.params.id as string)
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
        } else {
            res.status(200).json({
                success: true,
                message: "User updated successfully...",
                data: result.rows[0]
            });
        };
        // console.log(result.rows)
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            details: err
        });
    };
}

const deleteUser = async (req: Request, res: Response) => {
    // console.log(req.params.id);
    try {
        const result = await userService.deleteUser(req.params.id as string)
        // console.log(result)
        if (result.rowCount === 0) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
        } else {
            res.status(200).json({
                success: true,
                message: "User deleted successfully...",
                data: result.rows
            });
        };
        // console.log(result.rows)
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            details: err
        });
    };
}

export const userController = {
    createUser,
    getUser,
    getSingleUser,
    updateUser,
    deleteUser
}