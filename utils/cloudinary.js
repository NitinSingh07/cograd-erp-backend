const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;

dotenv.config();

cloudinary.config({
  cloud_name: "dc15q9hcp",
  api_key: "661673753759274",
  api_secret: "7LiAj8DOJ2OJ1kZ8fLR4WV-05P8",
});

module.exports = cloudinary;

// let store the sercets in dotenv file.
//make sure you have added the api secret in the dotenv file

// THE END OF env.API_SECRET and other must be the name
//you specified in the dotenv file
