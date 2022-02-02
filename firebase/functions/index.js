// General imports
const express = require("express");
const cors = require("cors");

// Firebase functions
const functions = require("firebase-functions");

const { db } = require("./firebase");

const app = express();
app.use(cors());

// Pages routes
app.get("/pages/", (req, res) => {
  db.collection("pages")
    .get()
    .then((querySnapshot) => {
      const pages = querySnapshot.docs.map((doc) => doc.data());
      res.status(200).json(pages);
    });
});

app.post("/pages/", (req, res) => {
  const data = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).json({
      BadRequest:
        "Invalid request body. Must be an array containing page objects.",
    });
  }
  const pagesRef = db.collection("pages");
  let numSucceeded = 0,
    numFailed = 0;

  function sendResponse() {
    if (numSucceeded + numFailed < data.length) {
      return;
    }
    if (numFailed < data.length) {
      return res.status(200).json({
        success: `Created ${numSucceeded} document(s). ${numFailed} document(s) failed.`,
      });
    }
    res.status(400).json({
      BadRequest: `Document IDs ${0}-${
        data.length - 1
      } are all taken. No data was created.`,
    });
  }

  for (let i = 0; i < data.length; i++) {
    pagesRef
      .doc(`${i}`)
      .create(data[i])
      .then(() => sendResponse(numSucceeded++))
      .catch(() => sendResponse(numFailed++));
  }
});

app.put("/pages/:id", (req, res) => {
  const data = req.body;
  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      BadRequest:
        "Invalid request body. Must be an object containing at least one field to update.",
    });
  }
  const id = req.params.id;

  db.collection("pages")
    .doc(id)
    .update(data)
    .then(
      res.status(200).json({ success: `Updated document with ID '${id}'.` })
    )
    .catch(() =>
      res.status(404).json({
        NotFound: `Document with ID '${id}' was not located. No changes were made.`,
      })
    );
});

app.delete("/pages/:id", (req, res) => {
  db.collection("pages")
    .doc(req.params.id)
    .delete()
    .then(() =>
      res
        .status(200)
        .json({ success: `Document with id '${req.params.id}' was deleted. ` })
    );
});

// 404 route
app.get("*", (req, res) => {
  res
    .status(404)
    .json({ NotFound: `Cannot ${req.method} ${req.originalUrl}.` });
});

exports.api = functions.region("europe-west1").https.onRequest(app);
