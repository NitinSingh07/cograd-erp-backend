// middleware/upload.js

const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({ storage }).array('documents', 5); // 'documents' is the field name

module.exports = upload;
