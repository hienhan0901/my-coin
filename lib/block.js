const { DIFFICULTY } = require("../config/config");

const crypto = require("crypto-js");

class Block {
    constructor(timeStamp, previousHash, hash, data, nonce, difficulty) {
        this.timeStamp = timeStamp;
        this.previousHash = previousHash;
        this.hash = this.doHash();
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    };

    doHash() {
        return crypto.SHA256(this.timeStamp + this.previousHash + JSON.stringify(this.data) + this.nonce + this.difficulty).toString();
    };

    static genesis() {
        return new this('GenesisTime', 'GenesisPreviousHash', 'GenesisHash', [], 0, DIFFICULTY);
    };

    mineBLock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.doHash();
        }

        // console.log(`Block mined: ${this.hash}`);
    };
}

// const ge = Block.genesis();
// console.log(ge);
// const vd = new Block(Date.now(),ge.hash, '',{abc: "abc"},0,4);
// const vd2 = new Block(Date.now(),vd.hash, '',{abc: "aaaa"},0,4);

// console.log(vd);
// console.log(vd2);
// vd2.mineBLock(vd2.difficulty);
// console.log(vd2);


module.exports = Block;