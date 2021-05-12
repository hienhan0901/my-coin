// const webSocket = require('ws');

// const P2P_PORT = process.env.P2P_PORT || 5000;

// const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
// const MESSAGE_TYPES = {
//     chain: "CHAIN",
//     transaction: "TRANSACTION",
//     clear_transactions: "CLEAR_TRANSACTIONS"
// }

// class P2pServer {
//     constructor(blockchain, transactionPool) {
//         this.blockchain = blockchain;
//         this.sockets = [];
//         this.transactionPool = transactionPool;
//     }

//     listen() {
//         const server = new webSocket.Server({ port: P2P_PORT });
//         server.on('connection', socket => {
//             this.connectSocket(socket);
//         });

//         this.connectToPeers();
//         console.log(`Listening for Peer-to-Peer connections on port : ${P2P_PORT}`);
//     }
//     connectSocket(socket) {
//         this.sockets.push(socket);
//         console.log('Socket Connected!');
//         this.messageHandler(socket);

//         this.sendChain(socket);
//     }
//     connectToPeers() {
//         peers.forEach((peer) => {
//             const socket = new webSocket(peer);
//             socket.on('open', () => this.connectSocket(socket));
//         })
//     }



//     messageHandler(socket) {
//         socket.on('message', message => {
//             const data = JSON.parse(message);
//             // switch(data.type){
//             //     case MESSAGE_TYPES.chain : this.blockchain.replaceChain(data.chain);
//             //                                break;
//             //     case MESSAGE_TYPES.transaction : this.transactionPool.updateOrAddTransaction(data.transaction);
//             //                                      break;
//             //     case MESSAGE_TYPES.clear_transactions : this.transactionPool.clear();
//             //                                      break;
//             // }  
//         });
//     }

//     sendTransaction(socket, transaction) {
//         socket.send(JSON.stringify({
//             type: MESSAGE_TYPES.transaction,
//             transaction
//         }));
//     }

//     sendChain(socket) {
//         socket.send(JSON.stringify({
//             type: MESSAGE_TYPES.chain,
//             chain: this.blockchain.chain
//         }));
//     }

//     syncChain() {
//         this.sockets.forEach(socket => {
//             this.sendChain(socket);
//         })
//     }

//     broadcastTransaction(transaction) {
//         this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
//     }

//     broadcastClearTransaction(transaction) {
//         this.sockets.forEach(socket => socket.send(JSON.stringify({
//             type: MESSAGE_TYPES.clear_transactions
//         })));
//     }
// }

// module.exports = P2pServer;


const webSocket = require('ws')

const P2P_PORT = process.env.P2P_PORT || 5000;
// const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

const MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2,
    QUERY_TRANSACTION_POOL: 3,
    RESPONSE_TRANSACTION_POOL: 4
}

class P2pServer {
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }

    listen() {
        const server = new webSocket.Server({port: P2P_PORT});
        server.on('connection', (ws) => {
            this.initConnection(ws);
        });
        console.log('p2p server listening on port: ' + P2P_PORT);
    };

    getSockets() {
        return sockets;
    }

    initConnection(ws) {
        this.sockets.push(ws);
        this.initMessageHandler(ws);
        this.initErrorHandler(ws);
        write(ws, queryChainLengthMsg());

        // query transactions pool only some time after chain query
        setTimeout(() => {
            this.broadcast(queryTransactionPoolMsg());
        }, 500);
    };

    initMessageHandler(ws) {
        ws.on('message', (data) => {
            try {
                const message = JSONToObject(data);
                if (message === null) {
                    console.log('could not parse received JSON message: ' + data);
                    return;
                }
                console.log('Received message: %s', JSON.stringify(message));
                switch (message.type) {
                    case MessageType.QUERY_LATEST:
                        write(ws, this.responseLatestMsg());
                        break;
                    case MessageType.QUERY_ALL:
                        write(ws, this.responseChainMsg());
                        break;
                    case MessageType.RESPONSE_BLOCKCHAIN:
                        const receivedBlocks = JSONToObject(message.data);
                        if (receivedBlocks === null) {
                            console.log('invalid blocks received: %s', JSON.stringify(message.data));
                            break;
                        }
                        this.handleBlockchainResponse(receivedBlocks);
                        break;
                    case MessageType.QUERY_TRANSACTION_POOL:
                        write(ws, this.responseTransactionPoolMsg());
                        break;
                    case MessageType.RESPONSE_TRANSACTION_POOL:
                        const receivedTransactions = JSONToObject(message.data);
                        if (receivedTransactions === null) {
                            console.log('invalid transaction received: %s', JSON.stringify(message.data));
                            break;
                        }
                        
                        if (JSON.stringify(this.transactionPool.transactions)===JSON.stringify(receivedTransactions)) {
                            break;
                        }
                        else {
                            this.transactionPool.transactions = receivedTransactions.map(t=>t);
                            this.broadCastTransactionPool();
                            break;
                        }

                        // receivedTransactions.forEach((transaction) => {
                        //     try {
                        //         this.transactionPool.addTransaction(transaction);
                        //         // if no error is thrown, transaction was indeed added to the pool
                        //         // let's broadcast transaction pool
                        //         this.broadCastTransactionPool();
                        //     } catch (e) {
                        //         console.log(e.message);
                        //     }
                        // });
                        break;
                }
            } catch (e) {
                console.log(e);
            }
        });
    };

    initErrorHandler(ws) {
        const closeConnection = (myWs) => {
            console.log('connection failed to peer: ' + myWs.url);
            this.sockets.splice(this.sockets.indexOf(myWs), 1);
        };
        ws.on('close', () => closeConnection(ws));
        ws.on('error', () => closeConnection(ws));
    }

    connectToPeers(newPeer) {
        const ws = new webSocket(newPeer);
        ws.on('open', () => {
            this.initConnection(ws);
        });
        ws.on('error', () => {
            console.log('connection failed');
        });
    };

    handleBlockchainResponse(receivedBlocks) {

        if (receivedBlocks.length === 0) {
            console.log('received block chain size of 0');
            return;
        }
        const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
        const latestBlockHeld = this.blockchain.getLastBlock();

        if (receivedBlocks.length > this.blockchain.chain.length) {
            console.log('blockchain behind');
            if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
                if (this.blockchain.addMinedBlock(latestBlockReceived)) {
                    this.broadcast(this.responseLatestMsg());
                }
            } else if (receivedBlocks.length === 1) {
                console.log('We have to query the chain from our peer');
                this.broadcast(queryAllMsg());
            } else {
                console.log('Received blockchain is longer than current blockchain');
                if (this.blockchain.replaceChain(receivedBlocks)) {
                    this.broadcastLatest();
                }
            }
        } else {
            console.log('received blockchain is not longer than received blockchain. Do nothing');
        }
    }

    responseTransactionPoolMsg() {
        return {
            'type': MessageType.RESPONSE_TRANSACTION_POOL,
            'data': JSON.stringify(this.transactionPool.transactions)
        }
    }

    responseLatestMsg() {
        return {
            'type': MessageType.RESPONSE_BLOCKCHAIN,
            'data': JSON.stringify([this.blockchain.getLastBlock()])
        };
    }

    responseChainMsg() {
        return {
            'type': MessageType.RESPONSE_BLOCKCHAIN,
            'data': JSON.stringify(this.blockchain)
        }
    }

    broadcast(message) {
        return this.sockets.forEach((socket) => write(socket, message));
    }

    broadcastLatest() {
        this.broadcast(this.responseLatestMsg());
    }

    broadCastTransactionPool() {
        this.broadcast(this.responseTransactionPoolMsg());
    }
}

const JSONToObject = function (data) {
    try {
        return JSON.parse(data);
    } catch (e) {
        console.log(e);
        return null;
    }
};

const write = function (ws, message) {
    return ws.send(JSON.stringify(message));
};

const queryAllMsg = function () {
    return ({ 'type': MessageType.QUERY_ALL, 'data': null });
}

const queryChainLengthMsg = function () {
    return {
        'type': MessageType.QUERY_LATEST,
        'data': null
    };
}

const queryTransactionPoolMsg = function () {
    return {
        'type': MessageType.QUERY_TRANSACTION_POOL,
        'data': null
    }
}
module.exports = P2pServer;