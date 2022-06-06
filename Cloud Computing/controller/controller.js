const processFile = require("../middleware/upload");
const { format } = require("util");
const { Storage } = require("@google-cloud/storage");

// instansiasi storage client dengan credentials
const storage = new Storage({ keyFilename: "google-cloud-key.json" });
const bucket = storage.bucket("fishku-image");
const upload = async(req, res) => {

    try {
        await processFile(req, res);
        if (!req.file) {
            return res.status(400).send({ message: "Upload gambarnya" });
        }

        // buat new blob di bucket and upload gamabr.
        const blob = bucket.file(req.file.originalname);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });
        blobStream.on("error", (err) => {
            res.status(500).send({ message: err.message });
        });

        blobStream.on("finish", async(data) => {
            // buat URL untuk akses file langsung via HTTP.
            const publicUrl = format(
                `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            );
            try {
                // buat file menjadi public 
                await bucket.file(req.file.originalname).makePublic();
            } catch {
                return res.status(500).send({
                    message: `Upload gambar berhasil: ${req.file.originalname}, tapi akses public gagal`,
                    url: publicUrl,
                });
            }
            res.status(200).send({
                message: "Upload gambar berhasil: " + req.file.originalname,
                url: publicUrl,
            });
        });
        blobStream.end(req.file.buffer);
    } catch (err) {
        if (err.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: "Gambar tidak bisa lebih dari 3 MB",
            });
        }
        res.status(500).send({
            message: `Tidak bisa upload gambar: ${req.file.originalname}. ${err}`,
        });
    }
};

const getListFiles = async(req, res) => {
    try {
        const [files] = await bucket.getFiles();
        let fileInfos = [];
        files.forEach((file) => {
            fileInfos.push({
                name: file.name,
                url: file.metadata.mediaLink,
            });
        });
        res.status(200).send(fileInfos);
    } catch (err) {
        console.log(err);
        res.status(500).send({
            message: "Tidak bisa menampilkan list data gambar",
        });
    }
};
const download = async(req, res) => {
    try {
        const [metaData] = await bucket.file(req.params.name).getMetadata();
        res.redirect(metaData.mediaLink);

    } catch (err) {
        res.status(500).send({
            message: "Tidak bisa download gambar. " + err,
        });
    }
};

module.exports = {
    upload,
    getListFiles,
    download,
};