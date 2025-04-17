const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const methodOverride = require("method-override");

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "./public")));

// Define `files` directory
const filesDir = path.join(__dirname, "./files");

//Create a new note (CREATE)
app.post("/notes", function (req, res) {
  let filename = req.body.title.trim().split(" ").join(""); // Remove spaces
  filename = filename.charAt(0).toUpperCase() + filename.slice(1); // Capitalize first letter

  const fileContent = req.body.Details;

  fs.writeFile(`${filesDir}/${filename}`, fileContent, function (err) {
    if (err) return res.status(500).json({ error: "Error creating file" });
    res.redirect("/notes");
  });
});

//  Read all notes (READ LIST)
app.get("/notes", function (req, res) {
  fs.readdir(filesDir, function (err, files) {
    if (err) return res.status(500).json({ error: "Error reading directory" });
    res.render("html.ejs", { files });
  });
});

// Read a single note (READ CONTENT)
app.get("/notes/:filename", function (req, res) {
  const filePath = `${filesDir}/${req.params.filename}`;

  fs.readFile(filePath, "utf-8", function (err, filedata) {
    if (err) return res.status(500).json({ error: "Error reading file" });
    res.render("show.ejs", { filename: req.params.filename, filedata });
  });
});

//  Load edit page for a note (EDIT VIEW)
app.get("/edit/:filename", function (req, res) {
  const filePath = `${filesDir}/${req.params.filename}`;

  fs.readFile(filePath, "utf-8", function (err, filedata) {
    if (err) return res.status(500).json({ error: "Error reading file" });
    res.render("edit.ejs", { filename: req.params.filename, filedata });
  });
});

//  Update a note (UPDATE CONTENT & NAME)
app.put("/notes/:filename", function (req, res) {
  const oldFilename = req.params.filename;
  const newFilename = req.body.newFilename.trim() + ".txt";
  const newContent = req.body.newContent;

  const oldFilePath = `${filesDir}/${oldFilename}`;
  const newFilePath = `${filesDir}/${newFilename}`;

  // Rename file first (if name is changed)
  fs.rename(oldFilePath, newFilePath, function (err) {
    if (err) return res.status(500).json({ error: "Error renaming file" });

    // Then update content
    fs.writeFile(newFilePath, newContent, function (err) {
      if (err)
        return res.status(500).json({ error: "Error updating file content" });

      res.redirect("/notes");
    });
  });
});

//  Delete a note (DELETE)
app.delete("/notes/:filename", function (req, res) {
  console.log("Deleting file:", req.params.filename); // Debugging

  const filePath = `${filesDir}/${req.params.filename}`;

  if (!req.params.filename || req.params.filename.trim() === "") {
    return res.status(400).send("Invalid filename request");
  }

  fs.unlink(filePath, function (err) {
    if (err) return res.status(500).json({ error: "Error deleting file" });

    res.redirect("/notes");
  });
});

//  Start server
app.listen(3000, () => {
  console.log("RESTful API Running on port 3000");
});
