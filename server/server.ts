import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// const pool = require("pool");


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

const PORT = process.env.PORT

// Running on PORT 3000
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`)
})