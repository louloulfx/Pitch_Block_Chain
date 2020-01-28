const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./text.sql");
const fs = require("fs");
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
    db.run(`CREATE TABLE IF NOT EXISTS blocks (
        idBlock INTEGER PRIMARY KEY AUTOINCREMENT,
        previousHash TEXT,
        nbPageStart INTEGER,
        nbPageFinish INTEGER,
        firstregistration TEXT,
        secondRegistration TEXT,
        thirdRegistration TEXT,
        fourthRegistration TEXT,
        fifthRegistration TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);

    let stmt = db.prepare(
      "INSERT INTO blocks (previousHash, nbPageStart, nbPageFinish, firstRegistration, secondRegistration, thirdRegistration, fourthRegistration, fifthRegistration) VALUES (?,?,?,?,?,?,?,?)"
    );
    for (let i = 0; i < data.toRead.pageArray.length; i += 5) {
      iterationLeft = data.toRead.pageArray.length - i;
      stmt.run(
        "anyHash",
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
    }
    stmt.finalize();

    db.each("SELECT * FROM blocks", function(err, row) {
      console.log(row);
    });
  });

  db.close();
});
