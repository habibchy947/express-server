import express, { Request, Response } from "express";
import config from "./config";
import initDB, { pool } from "./config/db";
import logger from "./middleware/logger";
import { userRoutes } from "./modules/user/users.routes";
import { todoRoutes } from "./modules/todo/todo.routes";

const app = express()
const port = config.port;

//initializing DB
initDB();

// body parser >>
app.use(express.json());

// app.use(express.urlencoded())  >>> for form data


app.get("/", logger, (req: Request, res: Response) => {
    res.send("Hello Next Level Developer!");
});

// /<-------Users crud------->/
// post users
app.use("/users", userRoutes);

// /<-------Todos crud------->/
app.use("/todos", todoRoutes)

// not found route
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.path
    });
});

app.listen(port, () => {
    console.log(`App listening on port: ${port}`);
});