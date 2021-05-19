const crypto = require("crypto-js");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

module.exports = {
    hash(data) {
        return crypto.SHA256(data).toString();

    },
    
    genKeyPair() {
        return ec.genKeyPair();
    },

    keyFromPrivate(privateKey) {
        return ec.keyFromPrivate(privateKey);
    },

    verifySignature(publicKey, signature, dataHash) {
        return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);
    }
}