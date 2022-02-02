// Firebase SDK
const admin = require("firebase-admin");

// Private service account
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// Database reference
const db = admin.firestore();

module.exports = { db };
