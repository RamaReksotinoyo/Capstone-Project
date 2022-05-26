const mysql = require("mysql");

// buat konfigurasi koneksi database
const dbconn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "comeandgetit?got7",
    database: "fishku",
    multipleStatements: true,
});

// buat koneksi ke database
dbconn.connect((err) => {
    if (err) throw err;
    console.log("Database connected.");
});

module.exports = dbconn;