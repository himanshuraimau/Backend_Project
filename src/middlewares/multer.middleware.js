import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define the destination folder where uploaded files will be stored
    cb(null, "./public/keep/");
  },
  filename: function (req, file, cb) {
    // Define how uploaded files should be named
    cb(null, Date.now() + '-' + file.originalname);
  }
});
export const upload = multer({ 
    storage, 
}) 