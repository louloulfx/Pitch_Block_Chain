const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./text.sql");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.get("/latestblock", (req, res) => {
  db.serialize(function() {
    db.all("SELECT * FROM blocks ORDER BY idBlock DESC LIMIT 1", function(
      err,
      rows
    ) {
      res.send(rows);
    });
  });
});
app.get("/actualchain", (req, res) => {});
app.post("/broadcastblock", (req, res) => {});

let toRead = new Promise((resolve, reject) => {
  fs.readFile("./allPages.json", (err, data) => {
    if (err) throw err;
    resolve({ toRead: JSON.parse(data) });
  });
});

toRead.then(data => {
  console.log(data.toRead.pageArray.length);
  console.log("here");
  db.serialize(function() {
    db.run("DROP TABLE IF EXISTS blocks");
    db.run(`CREATE TABLE IF NOT EXISTS blocks (
        idBlock INTEGER PRIMARY KEY AUTOINCREMENT,
        previousHash TEXT,
        hash TEXT,
        nbPageStart INTEGER,
        nbPageFinish INTEGER,
        firstregistration TEXT,
        secondRegistration TEXT,
        thirdRegistration TEXT,
        fourthRegistration TEXT,
        fifthRegistration TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

    let stmt = db.prepare(
      "INSERT INTO blocks (previousHash, hash, nbPageStart, nbPageFinish, firstRegistration, secondRegistration, thirdRegistration, fourthRegistration, fifthRegistration) VALUES (?,?,?,?,?,?,?,?,?)"
    );
    let previousHash = 0;
    for (let i = 0; i < data.toRead.pageArray.length; i += 5) {
      iterationLeft = data.toRead.pageArray.length - i;

      let encript = data.toRead.pageArray[i].nbPage;
      let hash = crypto
        .createHmac("sha256", "bVwDy-R4CyM-VdPnW-pV2Fc-88F9M")
        .update(encript.toString())
        .digest("hex");
      stmt.run(
        previousHash,
        hash,
        data.toRead.pageArray[i].nbPage,
        iterationLeft > 5
          ? data.toRead.pageArray[i + 4].nbPage
          : data.toRead.pageArray.length,
        data.toRead.pageArray[i].content,
        iterationLeft > 1 ? data.toRead.pageArray[i + 1].content : "",
        iterationLeft > 2 ? data.toRead.pageArray[i + 2].content : "",
        iterationLeft > 3 ? data.toRead.pageArray[i + 3].content : "",
        iterationLeft > 4 ? data.toRead.pageArray[i + 4].content : ""
      );

      previousHash = hash;
    }
    stmt.finalize();

    db.each("SELECT * FROM blocks limit 4", function(err, row) {
      console.log(row);
    });
  });
});

app.listen(port);
console.log("Server launched on port : ", port);
