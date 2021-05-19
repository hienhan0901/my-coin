const { DIFFICULTY } = require('../config/config');
const Block = require('./block');


class BlockChain {
    constructor() {
        this.chain = [Block.genesis()];
        this.miningReward = 10;
    };

    addBlock(data) {
        const lastBlock = this.getLastBlock();
        const block = new Block(Date.now(), lastBlock.hash, '', data, 0, lastBlock.difficulty);
        block.mineBLock(block.difficulty);
        this.chain.push(block);
        return block;
    };

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    };

    getBlock(index) {
        if (index < 0 || index > this.chain.length - 1) {return {}};
        return this.chain[index];
    }
    
    isValidChain() {
        if(JSON.stringify(this.chain[0])!== JSON.stringify(Block.genesis())) return false;

        for(let i = 1; i < this.chain.length; i++) {
            if((this.chain[i].previousHash !== this.chain[i-1].hash) || (this.chain[i].hash !== this.chain[i].doHash())) {
                return false;
            }
        };

        return true;
    }

    sameChainValid(chain){
        if(JSON.stringify(chain[0])!== JSON.stringify(this.chain[0])) return false;

        for(let i=1;i<chain.length;i++){
            let block = chain[i];
            let lastBlock = chain[i-1];

            if(block.previousHash !== lastBlock.hash) {
                return false;
            }
        }
        return true;
    }

    replaceChain(newChain){
        if(newChain.length <= this.chain.length){
            console.log('Received chain is not longer than the current chain.');
            return;
        }

        if(!this.sameChainValid(newChain)){
            console.log('The Received chain is not valid.');
            return;
        }

        console.log('Replacing the blockchain with the new Chain.');
        this.chain = newChain;
    }
};

module.exports = BlockChain;

// const bc = new BlockChain;
// bc.addBlock({hien: 'asas',asdasd:'asdasd'});
// console.log('-------------------------')
// console.log(bc);
// // bc.chain[1].hash = 'sadasdasdas';
// // console.log('-------------------------')
// // console.log(bc);
// console.log(bc.isValidChain());