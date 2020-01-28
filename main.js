const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./text.sql");

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
  stmt.run("anyHash", 0, 1, "test1", "test2", "test3", "test4", "test5");
  stmt.finalize();

  db.each("SELECT * FROM blocks", function(err, row) {
    console.log(row);
  });
});

db.close();
