import express, { NextFunction, Request, Response } from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path"


dotenv.config({ path: path.join(process.cwd(), '.env') })

const app = express()
const port = 5000;
//DB
// pool
const pool = new Pool({
    connectionString: `${process.env.CONNECTION_STR}`
});

const initDB = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        age INT,
        phone VARCHAR(15),
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
        `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS todos(
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT false,
        due_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
    `)
};

initDB();

// parser
app.use(express.json());

// app.use(express.urlencoded())  >>> for form data

// middleware
const logger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}\n`)
    next()
}

app.get("/", logger, (req: Request, res: Response) => {
    res.send("Hello Next Level Developer!");
});

/<-------Users crud------->/
// post users
app.post("/users", async (req: Request, res: Response) => {
    const { name, email } = req.body;
    try {
        const result = await pool.query(`INSERT INTO users(name, email) VALUES($1, $2) RETURNING *`,
            [name, email])
        // console.log(result.rows[0])
        res.status(500).json({
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
});

// get all users
app.get("/users", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM users`);
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
});

//get single users
app.get("/users/:id", async (req: Request, res: Response) => {
    // console.log(req.params.id);
    // res.send({message: "API is cool..."});
    try {
        const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.params.id]);
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
});

//update user
app.put("/users/:id", async (req: Request, res: Response) => {
    const { name, email } = req.body;
    try {
        const result = await pool.query(`UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *`,
            [name, email, req.params.id]
        );
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
});

// delete user
app.delete("/users/:id", async (req: Request, res: Response) => {
    // console.log(req.params.id);
    try {
        const result = await pool.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
        console.log(result)
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
});


/<-------Todos crud------->/

//post todo
app.post("/todos", async (req: Request, res: Response) => {
    const { user_id, title } = req.body;
    try {
        const result = await pool.query(`INSERT INTO todos(user_id, title) VALUES($1, $2) RETURNING *`, [user_id, title]);
        res.status(201).json({
            success: true,
            message: "Todos created successfully",
            data: result.rows[0]
        })
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message,
            details: err
        })
    }
});

//get all todo
app.get("/todos", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM todos`);
        res.status(200).json({
            success: true,
            message: "Todos retrieved successfully",
            data: result.rows
        })
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: "Todos not found"
        })
    }
});

//get single todo
app.get("/todos/:id", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM todos WHERE id = $1`, [req.params.id]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Todos not found"
            })
        } else {
            res.status(200).json({
                success: true,
                message: "Todo retrieved successfully",
                data: result.rows[0]
            })
        }
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

//update todo
app.put("/todos/:id", async (req: Request, res: Response) => {
    const {title} = req.body;
    try {
        const result = await pool.query(`UPDATE todos SET title=$1 WHERE id=$2 RETURNING *`, [title, req.params.id])
        if(result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Todos not found"
            })
        } else {
            res.status(200).json({
                success: true,
                message: "Todos updated successfully",
                data: result.rows[0]
            })
        }
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

//delete todo
app.delete("/todos/:id", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`DELETE FROM todos WHERE id = $1`, [req.params.id])

        if (result.rowCount === 0) {
            res.status(404).json({
                success: false,
                message: "Todos not found"
            })
        } else {
            res.status(200).json({
                success: true,
                message: "Todos deleted succesfully",
                data: result.rows
            })
        }
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
    // console.log(result)
})

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