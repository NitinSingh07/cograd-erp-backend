const multer = require("multer");

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    let fileExt = file.originalname.split(".").pop();
    const fileName = `${new Date().getTime()}.${fileExt}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/webm"];
  if (!allowedTypes.includes(file.mimetype)) {
    req.fileValidationError = "File type must be audio/mpeg, audio/mp3, audio/wav, or audio/webm";
    return cb(null, false, req.fileValidationError);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
}).single("audio");

module.exports = upload;
