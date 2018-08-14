/*====== SHA256 with Crypto-js =============================|
|	Learn more: Crypto-js: https://github.com/brix/crypto-js	|
|==========================================================*/

const SHA256 = require('crypto-js/sha256');

/*====== Persist data with LevelDB =================|
|	Learn more: level: https://github.com/Level/level	|
|==================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

/*=================== Functions ====================|
|                 List of functions                 |
|==================================================*/

// Add data to levelDB with key/value pair
function addLevelDBData(key, value) {
  db.put(key, JSON.stringify(value), function(err) {
    if (err) return console.log('Block ' + key + ' submission failed', err);
  });
}

// Get data from levelDB with key
function getLevelDBData(key) {
  return new Promise((resolve, reject) => {
    db.get(key, function(err, value) {
      if (err) {
        console.log("Not found!", err);
        reject(err);
      } else {
        resolve(value);
      }
    });
  });
}

// Add data to levelDB with value
function addDataToLevelDB(value) {
  let i = 0;
  db.createReadStream().on('data', function(data) {
    i++;
  }).on('error', function(err) {
    return console.log('Unable to read data stream!', err)
  }).on('close', function() {
    console.log('Block #' + i);
    addLevelDBData(i, value);
  });
}

/*====== Block Class =================|
|	Class with a constructor for block	|
|====================================*/

class Block{
	constructor(data){
		this.hash = "",
		this.height = 0,
		this.body = data,
		this.time = 0,
		this.previousBlockHash = ""
	}
}

/*====== Blockchain Class ====================|
|	Class with a constructor for new Blockchain	|
|============================================*/

class Blockchain {
	constructor(){
    this.chain = [];
    this.addBlock(new Block("First block in the chain - Genesis block"));
	}

	// Add new block  
	// 1. addBlock(newBlock) includes a method to store newBlock within LevelDB
	addBlock(newBlock){
		// Block height
		newBlock.height = this.chain.length;
		// UTC timestamp
		newBlock.time = new Date().getTime().toString().slice(0,-3);
		// previous block hash
		if(this.chain.length>0){
			newBlock.previousBlockHash = this.chain[this.chain.length-1].hash;
		}
		// Block hash with SHA256 using newBlock and converting to a string
		newBlock.hash = SHA256(JSON.stringify(value)).toString();
		// Adding block object to chain
		this.chain.push(value);
    // Add the newblock to the function addDataToLevelDB
    addDataToLevelDB(JSON.stringify(newBlock));
	}

	// 6. Modify getBlockHeight() function to retrieve current block height
	//		within the LevelDB chain
  getBlockHeight(){
    return this.chain.length-1;
  }

	// 5. Modify getBlock() function to retrieve a block by its block heigh
	//		within the LevelDB chain
  getBlock(blockHeight) {
    getLevelDBData(blockHeight)
    .then(value => console.log(JSON.parse(value)))
    .catch(err => console.log(err));
  }

	// validate block
	// 3. Modify the validateBlock() function to validate a block stored within levelDB
  validateBlock(blockHeight){
    // get block object
    let block = this.getBlock(blockHeight);
    // get block hash
    let blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString();
    // Compare
    if (blockHash===validBlockHash) {
      return true;
    } else {
      console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
      return false;
    }
  }

  // Validate blockchain
  validateChain(){
    let errorLog = [];
    for (var i = 0; i < this.chain.length-1; i++) {
      // validate block
      if (!this.validateBlock(i))errorLog.push(i);
      // compare blocks hash link
      let blockHash = this.chain[i].hash;
      let previousHash = this.chain[i+1].previousBlockHash;
      if (blockHash!==previousHash) {
        errorLog.push(i);
      }
    }
    if (errorLog.length>0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: '+errorLog);
    } else {
      console.log('No errors detected');
    }
  }
}

/*====== Testing =============================================================|
|	- Self-invoking function to add blocks to chain															|
|	- Learn more:																																|
|		https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/	|
|																																							|
|	* 100 Milliseconds loop = 36,000 blocks per hour														|
|			( 13.89 hours for 500,000 blocks )																			|
|	Bitcoin blockchain adds 8640 blocks per day																	|
|			( new block every 10 minutes )																					|
|============================================================================*/

(function theLoop (i) {
	setTimeout(function () {
		addDataToLevelDB('Testing data');
		if (--i) theLoop(i);
	}, 100);
})(10);