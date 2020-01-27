const crypto = require("crypto");
class Block {
  constructor(index, data, previousHash) {
    this.index = index;
    this.timestamp = Math.floor(Date.now() / 1000);
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.getHash();
  }

  getHash() {
    var encript =
      JSON.stringify(this.data) +
      this.previousHash +
      this.index +
      this.timestamp;
    var hash = crypto
      .createHmac("sha256", "oui")
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

BChain.addBlock({ content: "blabla", page: "1" });
BChain.addBlock({ content: "blabla", page: "2" });
BChain.addBlock({ content: "Yes", page: "3" });
console.dir(BChain, { depth: null });

BChain.chain[0].data.page = "1";

console.log("Validité : ", BChain.chainIsValid());
