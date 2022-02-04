const express = require("express");
const router = express.Router();
const {
  appendToDatabase,
  readFromDatabase,
  replaceDatabase,
  modifyInDatabase,
  deleteFromDatabase,
} = require("../util");

router
  // CREATE new page
  .post("/", (req, res) => appendToDatabase(res, "pages", req.body))

  // READ all pages
  .get("/", (_req, res) => readFromDatabase(res, "pages"))

  // UPDATE all pages
  .put("/", (req, res) => replaceDatabase(res, "pages", req.body))

  // UPDATE single page
  .put("/:index", (req, res) =>
    modifyInDatabase(res, "pages", req.params.index, req.body)
  )

  // DELETE single page
  .delete("/:index", (req, res) =>
    deleteFromDatabase(res, "pages", req.params.index)
  );

module.exports = router;
