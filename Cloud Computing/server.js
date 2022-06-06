// import package yg dibutuhkan
const express = require("express");
const path = require("path");
const createError = require("http-errors");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./routes/router");

const app = express();

// ini middleware untuk nge-read req.body.<params>
app.use(express.json());

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let corsOptions = {
    origin: "http://localhost:8081",
};
app.use(cors(corsOptions));

// set router nya
app.use("/api", router);


// error handling untuk server
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";
    res.status(err.statusCode).json({
        message: err.message,
    });
});

// server app nya
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
