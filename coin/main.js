const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const Blockchain = require('./lib/blockchain');
const P2pServer = require('./server/p2pServer');
const Wallet = require('./lib/wallet');
const TransactionPool = require('./lib/transactionPool');
const Miner = require('./lib/miner');
const util = require("./util/util");
const { MINING_REWARD } = require('./config/config');

const HTTP_PORT = process.env.HTTP_PORT || 3000;
const app = express();
app.use(cors())

const bc = new Blockchain();
const tp = new TransactionPool();
var wallet = null;
const p2pServer = new P2pServer(bc, tp);
var miner = null;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//get the whole blockchain
app.get('/blocks', (req, res) => {
    res.json(bc.chain);
});

app.get('/blocks/:id', (req, res) => {
    res.json(bc.getBlock(req.params.id));
});

//add blocks to blockchain
// app.post('/mine', (req, res) => {

//     console.log(req.body.data);
//     const block = bc.addBlock(req.body.data);
//     console.log(`New block added : ${block.toString()}`);

//     p2pServer.syncChain();
//     res.redirect('/blocks');

// });

//get all transactions
app.get('/transactions', (req, res) => {
    res.json(tp.transactions);
});

//perform transaction
app.post('/transact', (req, res) => {
    if(wallet === null) {return res.status(204).json({})};
    const { recipient, amount } = req.body;
    const transaction = wallet.createTransaction(recipient, amount, bc, tp);
    p2pServer.broadcastTransaction(transaction);
    res.redirect('/transactions');
});

//mine blockchain and clears old transaction pool then broadcast new chain
app.get('/mine-transactions', (req, res) => {
    if(miner === null) {return res.status(204).json({})};
    const block = miner.mine();
    console.log(block);
    res.redirect('/blocks');
})

//get own public key
app.get('/publicKey', (req, res) => {
    if(wallet === null) {return res.status(204).json({})};
    res.json({ "PublicKey": wallet.publicKey });
});

app.get('/balance', (req, res) => {
    if(wallet === null) {return res.status(204).json({})};
    res.json({ "balance": wallet.getBalance(bc) });
});

app.get('/signUp', (req, res) => {
    const wallet = util.genKeyPair(); 
    return res.json({
        "publicKey": wallet.getPublic().encode('hex'),
        "privateKey": wallet.getPrivate().toString('hex')
    })
})

app.post('/logIn', (req, res) => {
    wallet = new Wallet(util.keyFromPrivate(req.body.privateKey));
    miner = new Miner(wallet, bc, tp, p2pServer);
    return res.json({
        "publicKey": wallet.publicKey,
        "privateKey": req.body.privateKey
    })
})

app.get('/logOut', (req, res) => {
    if(wallet === null) {return res.status(204).json({})};
    miner = null;
    wallet = null;
    res.status(200).json({})
})

app.get('/history', (req, res) => {
    if(wallet === null) {return res.status(204).json({})};


    res.json( wallet.getHistory(bc) );
})

app.listen(HTTP_PORT, () => {
    console.log(`server started on port ${HTTP_PORT}`);
});

p2pServer.listen()