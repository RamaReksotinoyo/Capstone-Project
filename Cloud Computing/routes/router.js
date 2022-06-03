const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { registerValidation, loginValidation } = require("../middleware/auth-validation");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var http = require("http");

// AS CONSUMER

// REGISTER AKUN FISHKU
router.post("/register", registerValidation, (req, res, next) => {
    db.query(`SELECT * FROM consumer WHERE LOWER(email) = LOWER(${db.escape(req.body.email)});`, (err, result) => {
        // email tersedia
        if (result.length) {
            return res.status(409).send({
                msg: "Akun ini sudah ada!",
            });
        } else {

            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).send({
                        msg: err,
                    });
                } else {
                    // sudah meng-hash password -> tambah ke database
                    db.query(`INSERT INTO consumer (name, email, password, phone_number, address) VALUES ('${req.body.name}', ${db.escape(req.body.email)}, ${db.escape(hash)}, '${req.body.phone_number}', '${req.body.address}')`, (err, result) => {
                        if (err) {
                            throw err;
                            return res.status(400).send({
                                msg: err,
                            });
                        }
                        return res.status(201).send({
                            msg: "Akun sudah terdaftar.",
                        });
                    });
                }
            });
        }
    });
});

// LOGIN AKUN FISHKU
router.post("/login", loginValidation, (req, res, next) => {
    db.query(`SELECT * FROM consumer WHERE email = ${db.escape(req.body.email)};`, (err, result) => {
        // akun tidak ditemukan
        if (err) {
            throw err;
            return res.status(400).send({
                msg: err,
            });
        }
        if (!result.length) {
            return res.status(401).send({
                msg: "Email atau password salah",
            });
        }
        // cek password
        bcrypt.compare(req.body.password, result[0]["password"], (bErr, bResult) => {
            // password salah
            if (bErr) {
                throw bErr;
                return res.status(401).send({
                    msg: "Email atau password salah",
                });
            }
            if (bResult) {
                const token = jwt.sign({ id: result[0].id }, "the-super-strong-secrect");
                // login berhasil
                return res.status(200).send({
                    msg: "Logged in.",
                    token,
                    user: result[0],
                });
            }
            return res.status(401).send({
                msg: "Email atau password salah",
            });
        });
    });
});

// MENDAPATKAN DATA CONSUMER DARI DATABASE YG SUDAH TERDAFTAR
router.get("/consumer", registerValidation, (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer") || !req.headers.authorization.split(" ")[1]) {
        return res.status(422).json({
            message: "Sediakan token dari akun yang login",
        });
    }
    const theToken = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(theToken, "the-super-strong-secrect");
    db.query("SELECT * FROM consumer where email = ?", decoded.id, function(err, results, fields) {
        if (err) throw err;
        return res.send({ error: false, data: results[0], message: "Data consumer berhasil didapat." });
    });
});

// DASHBOARD (oke)
router.get("/dashboard/:email", (req, res) => {
    const email = req.params.email;
    const sqlQuery = `SELECT * FROM consumer WHERE email = "${email}"`;

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send({ data: result, message: "Data ditampilkan" });
    });
});

// PROFILE
router.get("/profile/:email", (req, res) => {
    const email = req.params.email;
    const sqlQuery = `SELECT * FROM consumer WHERE email = "${email}"`;

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send({ data: result, message: "Data ditampilkan" });
    });
});

// LIST IKAN DI 1 LOKASI
router.get("/fish_caught", (req, res) => {
    const sqlQuery = "SELECT * FROM fish_caught";
    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
});

// SEARCH IKAN
router.get("/fish_caught/search?fish_name=:fish_name", (req, res) => {
    const fishName = req.params.fish_name;
    const sqlQuery = `SELECT * FROM fish_caught WHERE fish_name = "${fishName}"`;
    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
});

// DETAIL IKAN (berdasarkan nama)
router.get("/fish_caught/:fish_name", (req, res) => {
    const fishName = req.params.fish_name;
    const sqlQuery = `SELECT * FROM fish_caught WHERE fish_name = "${fishName}"`;
    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
});

// DETAIL IKAN POST KE CART
router.post("/cart", (req, res) => {
    const id_fish = req.body.id_fish;
    const id_consumer = req.body.id_consumer;
    const qty = req.body.qty;
    const notes = req.body.notes;
    const expedition = req.body.expedition;

    const sqlQuery = `INSERT INTO cart (id_fish, id_consumer, qty, expedition_service, notes) 
                      VALUES ('${id_fish}', '${id_consumer}','${qty}', '${expedition}','${notes}')`;

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
});

// TOTAL HARGA (di tabel cart)
router.get("/total_price", (req, res) => {
    const total_price = "SELECT a.price, b.qty, (a.price*b.qty) AS total_price FROM fish_caught a INNER JOIN cart b ON a.id_fish = b.id_fish";

    db.query(total_price, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
});

router.put("/total_price/:id_cart", (req, res) => {
    const total = req.body.total_price;
    const id_cart = req.params.id_cart;
    const sqlQuery = `UPDATE cart SET total_price = '${total}' WHERE id_cart = '${id_cart}'`;


    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
})

// ORDER ambil data dari cart
router.get("/order/:id_cart", (req, res) => {
    const cart = req.params.id_cart;
    const sqlQuery = `SELECT * FROM cart WHERE id_cart = ${cart}`;

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
});

// ORDER PESANAN
router.post("/order", (req, res) => {
    const id_cart = req.body.id_cart;
    const id_fisher = req.body.id_fisher;
    const address = req.body.address;

    const sqlQuery = `INSERT INTO ordering(id_cart, id_fisher, address) VALUES('${id_cart}', '${id_fisher}', '${address}')`;

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
});

// HISTORY
router.post("/history", (req, res) => {
    const id_order = req.body.id_order;
    const status_order = req.body.status_order;
    const sqlQuery = `INSERT INTO history(id_order, status_order) VALUES('${id_order}', '${status_order}')`;

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
});

router.get("/history/:id_history", (req, res) => {
    const id_history = req.params.id_history;
    const sqlQuery = `SELECT * FROM history WHERE id_history = ${id_history}`;

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
});

// ------------------------------------------------------------------------------------------------------------------

// AS FISHER

// REGISTER AKUN FISHKU
router.post("/registerFisher", registerValidation, (req, res, next) => {
    db.query(`SELECT * FROM fisher WHERE LOWER(email) = LOWER(${db.escape(req.body.email)});`, (err, result) => {
        // email tersedia
        if (result.length) {
            return res.status(409).send({
                msg: "Akun ini sudah ada!",
            });
        } else {

            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).send({
                        msg: err,
                    });
                } else {
                    // sudah meng-hash password -> tambah ke database
                    db.query(`INSERT INTO fisher(name, email, password, phone_number, location_harbor) VALUES('${req.body.name}', ${db.escape(req.body.email)}, ${db.escape(hash)}, '${req.body.phone_number}', '${req.body.location_harbor}')`,
                        (err, result) => {
                            if (err) {
                                throw err;
                                return res.status(400).send({
                                    msg: err,
                                });
                            }
                            return res.status(201).send({
                                msg: "Akun sudah terdaftar.",
                            });
                        }
                    );
                }
            });
        }
    });
});

// LOGIN AKUN FISHKU
router.post("/loginFisher", loginValidation, (req, res, next) => {
    db.query(`SELECT * FROM fisher WHERE email = ${ db.escape(req.body.email) };`, (err, result) => {
        // akun tidak ditemukan
        if (err) {
            throw err;
            return res.status(400).send({
                msg: err,
            });
        }
        if (!result.length) {
            return res.status(401).send({
                msg: "Email atau password salah",
            });
        }
        // cek password
        bcrypt.compare(req.body.password, result[0]["password"], (bErr, bResult) => {
            // password salah
            if (bErr) {
                throw bErr;
                return res.status(401).send({
                    msg: "Email atau password salah",
                });
            }
            if (bResult) {
                const token = jwt.sign({ id: result[0].id }, "the-super-strong-secrect");

                return res.status(200).send({
                    msg: "Logged in.",
                    token,
                    user: result[0],
                });
            }
            return res.status(401).send({
                msg: "Email atau password salah",
            });
        });
    });
});

// MENDAPATKAN DATA fisher DARI DATABASE YG SUDAH TERDAFTAR
router.get("/fisher", registerValidation, (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer") || !req.headers.authorization.split(" ")[1]) {
        return res.status(422).json({
            message: "Sediakan token dari akun yang login",
        });
    }
    const theToken = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(theToken, "the-super-strong-secrect");
    db.query("SELECT * FROM fisher where email = ?", decoded.id, function(err, results, fields) {
        if (err) throw err;
        return res.send({ error: false, data: results[0], message: "Data fisher berhasil didapat." });
    });
});

// DASHBOARD FISHER
router.get("/dashboardFisher/:email", (req, res) => {
    const email = req.params.email;
    const sqlQuery = `SELECT * FROM fisher WHERE email = "${email}"`;

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send({ data: result, message: "Data ditampilkan" });
    });
});

// PROFILE FISHER
router.get("/profileFisher/:email", (req, res) => {
    const email = req.params.email;
    const sqlQuery = `SELECT * FROM fisher WHERE email = "${email}"`;

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send({ data: result, message: "Data ditampilkan" });
    });
});

// FISH CAUGHT HANDLE
// buat data2 fish caught product
router.post("/sendFishData", (req, res) => {
    const id_fisher = req.body.id_fisher;
    const location_harbor = req.body.location_harbor;
    const fish_name = req.body.fish_name;
    const time_caught = req.body.time_caught;
    const desc_fish = req.body.desc_fish;
    const stock = req.body.stock;
    const price = req.body.price;

    const sqlQuery = `INSERT INTO fish_caught(id_fisher, location_harbor, fish_name, time_caught, desc_fish, stock, price) VALUES('${id_fisher}', '${location_harbor}', '${fish_name}', '${time_caught}', '${desc_fish}', '${stock}', '${price}')`;

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
});

// lihat data2 fish caught product
router.get("/getFishData", (req, res) => {
    const sqlQuery = "SELECT * FROM fish_caught";

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
});

// ubah data2 fish caught product
router.put("/editFishData/:id_fish", (req, res) => {
    const id_fish = req.params.id_fish;
    const location_harbor = req.body.location_harbor;
    const fish_name = req.body.fish_name;
    const time_caught = req.body.time_caught;
    const desc_fish = req.body.desc_fish;
    const stock = req.body.stock;
    const price = req.body.price;

    const sqlQuery = `UPDATE fish_caught SET location_harbor = '${location_harbor}', fish_name = '${fish_name}', time_caught = '${time_caught}', desc_fish = '${desc_fish}', stock = '${stock}', price = '${price}' WHERE id_fish = '${id_fish}'`;

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
});

// hapus data fish caught
router.delete("/deleteFishData/:id_fish", (req, res) => {
    const id_fish = req.params.id_fish;
    const sqlQuery = `DELETE FROM fish_caught WHERE id_fish = ${ id_fish }`;

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
});

// ORDER yg masuk (buat fisher)
router.get("/getOrder", (req, res) => {
    const sqlQuery = "SELECT * FROM ordering";
    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });

})

router.get("/getOrder/:id_order", (req, res) => {
    const order = req.params.id_order;
    const sqlQuery = `SELECT * FROM ordering WHERE id_order = ${ order }`;

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
});

// HISTORY
router.post("/historyFisher", (req, res) => {
    const id_order = req.body.id_order;
    const status_order = req.body.status_order;

    const sqlQuery = `INSERT INTO history(id_order, status_order) VALUES('${id_order}', '${status_order}')`;

    db.query(sqlQuery, (err, result) => {
        if (err) throw err;
        return res.send(result);
    });
});

module.exports = router;
