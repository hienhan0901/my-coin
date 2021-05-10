const { v4 } = require('uuid');
const crypto = require("crypto-js");
const util = require('../util/util');
const config = require('../config/config');

class Transaction {
    // constructor(object){ 
    //     this.id = object.id;
    //     this.input = object.input;
    //     this.outputs = object.outputs;
    // }

    constructor(fromWallet, toAddress, amount) {
        this.id = v4();
        this.input = null;
        this.outputs = [];

        if (fromWallet.balance < amount) {
            console.log(`Balance not enough!!!`);
            return;
        }

        this.outputs.push(...[
            {
                amount: fromWallet.balance - amount,
                address: fromWallet.publicKey
            },
            {
                amount: amount,
                address: toAddress
            }
        ]);
        this.input = {
            timeStamp: Date.now(),
            amount: fromWallet.balance,
            address: fromWallet.publicKey,
            signature: fromWallet.sign(util.hash(JSON.stringify(this.outputs)))
        }
    }

    verify() {
        return util.verifySignature(this.input.address, this.input.signature, util.hash(JSON.stringify(this.outputs)))
    }

    update(fromWallet, toAddress, amount) {
        const fromWalletOutput = this.outputs.find(output => output.address === fromWallet.publicKey);

        if (fromWalletOutput.amount < amount) {
            console.log(`Balance not enough!!!`);
            return;
        }

        fromWalletOutput.amount -= amount;
        this.outputs.push(
            {
                amount: amount,
                address: toAddress
            }
        );
        this.input = {
            timeStamp: Date.now(),
            signature: fromWallet.sign(util.hash(JSON.stringify(this.outputs)))
        }
    }

    static reward(minerWallet) {
        this.id = v4();

        this.outputs = [{
            amount: config.MINING_REWARD,
            address: minerWallet.publicKey
        }];

        this.input = {
            timeStamp: Date.now(),
            amount: config.BLOCKCHAIN_WALLET_BALANCE,
            address: 'BlockchainWallet',
            signature: fromWallet.sign(util.hash(JSON.stringify(this.outputs)))
        }
    }
};

module.exports = Transaction;

// const a = new Transaction;
// console.log(a);