const BlockChain = require('./lib/blockchain');
const Blockchain = require('./lib/blockchain');
const TransactionPool = require('./lib/transactionPool');
const Wallet = require('./lib/wallet');
const Transaction = require('./lib/transaction')

let send = new Wallet();
let receive = new Wallet();
let third = new Wallet();

let bc = new BlockChain();
let tp = new TransactionPool();

console.log(`Sender: ${send.getPublicKey()} --- ${send.getPrivate()}`)
console.log(`Receiver: ${receive.getPublicKey()} --- ${receive.getPrivate()}`)
console.log(`Third: ${third.getPublicKey()} --- ${third.getPrivate()}`)
// console.log(bc)
// console.log(tp)
console.log('---------------------')


send.createTransaction(receive.getPublicKey(), 20, bc, tp)
receive.createTransaction(send.getPublicKey(), 1, bc, tp)
third.createTransaction(send.getPublicKey(), 2, bc, tp)
send.createTransaction(receive.getPublicKey(), 20, bc, tp)
receive.createTransaction(send.getPublicKey(), 1, bc, tp)
send.createTransaction(receive.getPublicKey(), 2, bc, tp)
console.log(tp.transactions)

bc.addBlock(tp.transactions)

console.log(bc.chain[1])
console.log(send.getBalance(bc))
console.log(receive.getBalance(bc))
console.log(third.getBalance(bc))

// console.log(tp.transactions)

