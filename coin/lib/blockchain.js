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

    addMinedBlock(newMinedBlock) {
        const newChain = this.chain.map(b => b);
        newChain.push(newMinedBlock);
        if (newChain.isValidChain()) {
            this.chain.push(newMinedBlock);
            return true;
        }
        return false;
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    };
    
    isValidChain() {
        if(JSON.stringify(this.chain[0])!== JSON.stringify(Block.genesis())) return false;

        for(let i = 1; i < this.chain.length; i++) {
            if((this.chain[i].previousHash !== this.chain[i-1].hash) || (this.chain[i].hash !== this.chain[i].doHash())) {
                return false;
            }
        };

        return true;
    }

    replaceChain(newChain){
        if(newChain.length <= this.chain.length){
            console.log('Received chain is not longer than the current chain.');
            return false;
        }

        if(!this.isValidChain(newChain)){
            console.log('The Received chain is not valid.');
            return false;
        }

        console.log('Replacing the blockchain with the new Chain.');
        this.chain = newChain;
        return true;
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