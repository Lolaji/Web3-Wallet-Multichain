const path = require('../resolveConfigPath');
const mainConfigObj = path;
console.log("Main Config: ", mainConfigObj)
const _ = require('lodash')
const config = require('../config/contract');
const networkConfig = require('../config/network');
const { ethers } = require('ethers');
const TronWeb = require('tronweb');

class Contract {
     constructor(){
          this.abi=null;
          this.contract=null;
          this.config = null;
     }

     async init(configName, signer=null) {
          this.config = config[configName];
          let network;

          try {
               if (!!this.config) {
                    if (!!signer) {
                         network = await signer;
                    } else {
                         if (this.config.is_tron) {
                              network = new TronWeb(networkConfig.tron.chain);
                         } else {
                              network = new ethers.providers.JsonRpcProvider(this.config.networkRPC);
                         }
                    }

                    if (!_.isNil(this.config.is_tron) && this.config.is_tron == true) {
                         return await network.contract().at(this.config.address);
                    }

                    let abi = require(`../artifacts/${configName}.json`);
                    return new ethers.Contract(this.config.address, abi, network);
     
               } else {
                    throw "Contract config is not set!"
               }
          } catch (error) {
               console.error(error);
          }
     }
}

export default new Contract;