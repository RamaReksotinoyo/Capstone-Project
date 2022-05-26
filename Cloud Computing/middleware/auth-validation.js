// import check dari express validator
const { check } = require("express-validator");

// mengecek validasi register 
exports.registerValidation = [
    check("name", "Nama harus diisi.").not().isEmpty(),
    check("email", "Isi dengan email yang valid.").isEmail().normalizeEmail({ gmail_remove_dots: true }),
    check("password", "Password harus diisi minimal 6 kata").isLength({ min: 6 }),
];

// mengecek validasi login
exports.loginValidation = [check("email", "Isi dengan email yang valid").isEmail().normalizeEmail({ gmail_remove_dots: true }), check("Password harus diisi minimal 6 kata").isLength({ min: 6 })];