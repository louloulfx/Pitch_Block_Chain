const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./text.sql");
const fs = require("fs");
const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const Cors = require("cors");

const app = express();
const port = 3000;
let lastReceived = {};
app.use(Cors());

app.get("/latestblock", (req, res) => {
  db.serialize(function() {
    db.all("SELECT * FROM blocks ORDER BY idBlock DESC LIMIT 1", function(
      err,
      rows
    ) {
      console.log(rows);
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
function getLatest() {
  lastReceived = {};
  for (let i = 3000; i < 3005; i++) {
    if (port != i) {
      fetch("http://localhost:" + i + "/latestblock")
        .then(res => res.json())
        .then(json => (lastReceived = json[0]))
        .catch(err => {
          console.log("Aucune réponse du port : " + i);
        })
        .then(() => {
          console.log(lastReceived, "bug");
        });
    }
  }
}

getLatest();

function broadcastblock(block) {
  for (let i = 3000; i < 3005; i++) {
    if (port != i) {
      fetch("http://localhost:" + i + "/broadcastblock", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: block
      }).catch(err => {
        console.log("L'hôte " + i + " n'a pas été atteint !");
      });
    }
  }
  db.serialize(function() {
    let stmt = db.prepare(
      "INSERT INTO blocks (previousHash, hash, nbPageStart, nbPageFinish, firstRegistration, secondRegistration, thirdRegistration, fourthRegistration, fifthRegistration) VALUES (?,?,?,?,?,?,?,?,?)"
    );

    stmt.run(
      block[0],
      block[1],
      block[2],
      block[3],
      block[4],
      block[5],
      block[6],
      block[7],
      block[8]
    );

    stmt.finalize();
  });
}

function mineBlock(nbPageStart, data) {
  let previousHash = lastReceived.hash == undefined ? 0 : lastReceived.hash;
  console.log(nbPageStart);
  let nowBlock = [];
  nbPageStart = nbPageStart - 1;
  // let T = 30 * Math.random(0, 1)
  let nbPageFin = nbPageStart + 5;
  if (nbPageFin > 707) {
    nbPageFin = 708;
    nbPageFin = nbPageFin - nbPageStart;
  }
  let encript = data.toRead.pageArray[nbPageStart].nbPage;
  let hash = crypto
    .createHmac("sha256", "bVwDy-R4CyM-VdPnW-pV2Fc-88F9M")
    .update(encript.toString())
    .digest("hex");
  console.log(nbPageFin);
  let firstRegistration = data.toRead.pageArray[nbPageStart].content;
  let secondRegistration =
    nbPageFin > 1 ? data.toRead.pageArray[nbPageStart + 1].content : "";
  let thirdRegistration =
    nbPageFin > 2 ? data.toRead.pageArray[nbPageStart + 2].content : "";
  let fourthRegistration =
    nbPageFin > 3 ? data.toRead.pageArray[nbPageStart + 3].content : "";
  let fifthRegistration =
    nbPageFin > 4 ? data.toRead.pageArray[nbPageStart + 4].content : "";
  nowBlock.push(
    previousHash,
    hash,
    nbPageStart,
    nbPageFin,
    firstRegistration,
    secondRegistration,
    thirdRegistration,
    fourthRegistration,
    fifthRegistration
  );
  console.log(nowBlock);

  if (
    nowBlock.nbPageStart > lastReceived.nbPageStart ||
    lastReceived.nbPageStart == undefined
  ) {
    broadcastblock(nowBlock);
  }
}

toRead.then(data => {
  console.log(data.toRead.pageArray.length);
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
  });
  console.log(lastReceived);
  setTimeout(() => {
    mineBlock(
      lastReceived.nbPageFinish == undefined
        ? 1
        : lastReceived.nbPageFinish + 1,
      data
    );
  }, 5000);
});

app.listen(port);
console.log("Server launched on port :", port);
