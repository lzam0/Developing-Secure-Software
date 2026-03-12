require("dotenv").config()

const express = require("express");
const cors = require("cors");
// const pool = require("pool");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("client"));

const PORT = process.env.PORT

// Running on PORT 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})