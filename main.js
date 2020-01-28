const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./text.sql");
const fs = require("fs");

class Block {
  constructor(index, data, previousHash) {
    this.index = index;
    this.timestamp = Math.floor(Date.now() / 1000);
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.getHash();
    console.log(this.hash);
  }

  getHash() {
    var encript =
      JSON.stringify(this.data) +
      this.previousHash +
      this.index +
      this.timestamp;
    var hash = crypto
      .createHmac("sha256", "bVwDy-R4CyM-VdPnW-pV2Fc-88F9M")
      .update(encript)
      .digest("hex");
    return hash;
  }
}

class BlockChain {
  constructor() {
    this.chain = [];
  }

  addBlock(data) {
    let index = this.chain.length;
    let previousHash =
      this.chain.length !== 0 ? this.chain[this.chain.length - 1].hash : 0;
    let block = new Block(index, data, previousHash);
    this.chain.push(block);
  }

  chainIsValid() {
    for (var i = 0; i < this.chain.length; i++) {
      if (this.chain[i].hash !== this.chain[i].getHash()) return false;
      if (i > 0 && this.chain[i].previousHash !== this.chain[i - 1].hash)
        return false;
    }
    return true;
  }
}

const BChain = new BlockChain();

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
      // console.log(i);
      // console.log(i == 0);
      // console.log(data.toRead.pageArray[i].nbPage);
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

  db.close();
});
// BChain.addBlock({ content: "blabla", page: "1" });
// BChain.addBlock({ content: "blabla", page: "2" });
// BChain.addBlock({ content: "Yes", page: "3" });
// console.dir(BChain, { depth: null });

// BChain.chain[0].data.page = "1";

// console.log("Validité : ", BChain.chainIsValid());
