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
      res.status(200).send(rows);
    });
  });
});
app.get("/actualchain", (req, res) => {
  db.serialize(function() {
    db.all("SELECT * FROM blocks", function(err, rows) {
      res.status(200).send(rows);
    });
  });
});
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

    function mineBlock(nbPageStart) {
      let nowBlock = [];
      let previousHash = 0;
      nbPageStart = nbPageStart - 1;
      // let T = 30 * Math.random(0, 1)
      let nbPageFin = nbPageStart + 4;
      if (nbPageFin > 707) {
        nbPageFin = 708;
        nbPageFin = nbPageFin - nbPageStart;
        console.log(nbPageFin, "yes");
      }
      console.log(nbPageFin);
      let encript = data.toRead.pageArray[nbPageStart].nbPage;
      let hash = crypto
        .createHmac("sha256", "bVwDy-R4CyM-VdPnW-pV2Fc-88F9M")
        .update(encript.toString())
        .digest("hex");
      nowBlock.push(
        previousHash,
        hash,
        nbPageStart,
        nbPageFin,
        data.toRead.pageArray[nbPageStart].content,
        nbPageFin > 1 ? data.toRead.pageArray[nbPageStart + 1].content : "",
        nbPageFin > 2 ? data.toRead.pageArray[nbPageStart + 2].content : "",
        nbPageFin > 3 ? data.toRead.pageArray[nbPageStart + 3].content : "",
        nbPageFin > 4 ? data.toRead.pageArray[nbPageStart + 4].content : ""
      );
      console.log(nowBlock);

      previousHash = hash;
    }

    mineBlock(1);

    stmt.finalize();
    // db.each("SELECT * FROM blocks limit 4", function(err, row) {
    //   console.log(row);
    // });
  });
});

app.listen(port);
console.log("Server launched on port : ", port);
