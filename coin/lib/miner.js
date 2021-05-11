const Transaction = require('./transaction');
const Wallet = require('./wallet');

class Miner {
    constructor(wallet, blockchain, transactionPool,  p2pServer) {
        this.wallet = wallet;
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.p2pServer = p2pServer;
    }

    mine() {
        const validTransactions = this.transactionPool.validTransactions();
        validTransactions.push(
            Transaction.reward( Wallet.blockchainWallet(), this.wallet)
        )
        const block = this.blockchain.addBlock(validTransactions);
        this.p2pServer.syncChain();
        this.p2pServer.broadcastClearTransaction();
        this.transactionPool.clear();

        return block;
    }
}

module.exports = Miner;