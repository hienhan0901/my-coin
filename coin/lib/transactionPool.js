const Transaction = require("./transaction")

class TransactionPool {
    constructor() {
        this.transactions = [];
    };

    addTransaction(transaction) {
        this.transactions.push(transaction);
    };

    updateOrAddTransaction(transaction){
        let transactionWithID = this.transactions.find(t => t.id === transaction.id);

        if(transactionWithID){
            this.transactions[this.transactions.indexOf(transactionWithID)] = transaction;
        }else{
            this.transactions.push(transaction);
        }

    }

    clear() {
        this.transactions = [];
    };

    validTransactions() {
        return this.transactions.filter((tx)=>{
            const totalOutputAmount = tx.outputs.reduce((s, output) => {
                return s + output.amount;
            }, 0);
            
            if(totalOutputAmount != tx.input.amount) {
                console.log("Amount not match!!!")
                return;
            }
            
            if(!Transaction.verifyTransaction(tx)) { 
                console.log('Transaction failed to verify!!!')
                return;
            }

            return tx;
        })
    };

};

module.exports = TransactionPool;

// const a = new TransactionPool();
// const tx1 = new Transaction({
//     "id": "8676c910-7272-11e8-86ef-85c52672e7ed",
//     "input": {
//         "timeStamp": 1529269684257,
//         "amount": 500,
//         "address": "0423141eab6d1875ae22a96dac794328ba962913bdbbb6a7e1c9cfb4ffd0e7989fac58a722d79b4a5891fb8875831e20e9e54e58856ac074ef15eb7d6ef3a0a761",
//         "signature": {
//             "r": "861d22558e1387ea4e081c156dd796b24fd2ba783b218ffc7a853207f2361b68",
//             "s": "cf5677f392142cd083df68189b3200a19e32e2ea1da34d63c2a188ef8a0a6186",
//             "recoveryParam": 0
//         }
//     },
//     "outputs": [
//         {
//             "amount": 450,
//             "address": "0423141eab6d1875ae22a96dac794328ba962913bdbbb6a7e1c9cfb4ffd0e7989fac58a722d79b4a5891fb8875831e20e9e54e58856ac074ef15eb7d6ef3a0a761"
//         },
//         {
//             "amount": 50,
//             "address": "047648c967013eec3f332d103227eee7decde237cac3984bb9523f70f6cbc486060906f412f19039d70f8892a9b388a51664a740adca61e7386a038cb99ce42864"
//         }
//     ]
// });
// const tx2 = new Transaction({
//     "id": "8676c910-7272-11e8-86ef-85c52672e7e2",
//     "input": {
//         "timeStamp": 1529269684257,
//         "amount": 500,
//         "address": "0423141eab6d1875ae22a96dac794328ba962913bdbbb6a7e1c9cfb4ffd0e7989fac58a722d79b4a5891fb8875831e20e9e54e58856ac074ef15eb7d6ef3a0a761",
//         "signature": {
//             "r": "861d22558e1387ea4e081c156dd796b24fd2ba783b218ffc7a853207f2361b68",
//             "s": "cf5677f392142cd083df68189b3200a19e32e2ea1da34d63c2a188ef8a0a6186",
//             "recoveryParam": 0
//         }
//     },
//     "outputs": [
//         {
//             "amount": 450,
//             "address": "0423141eab6d1875ae22a96dac794328ba962913bdbbb6a7e1c9cfb4ffd0e7989fac58a722d79b4a5891fb8875831e20e9e54e58856ac074ef15eb7d6ef3a0a761"
//         },
//         {
//             "amount": 50,
//             "address": "047648c967013eec3f332d103227eee7decde237cac3984bb9523f70f6cbc486060906f412f19039d70f8892a9b388a51664a740adca61e7386a038cb99ce42864"
//         }
//     ]
// });
// a.addTransaction(tx1)
// a.addTransaction(tx2)
// console.log(a);
// console.log('VALID' +a.validTransactions().toString())a.clear();
// console.log(a)