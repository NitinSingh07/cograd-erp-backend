const admin = require("firebase-admin");
const serviceAccount = require("./mera-bachha-8b3a2-firebase-adminsdk-78at1-1a4bd3b45a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
