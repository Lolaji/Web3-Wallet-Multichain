const _ = require('lodash');
const config = require('../../config/contract');
const network = require('../../config/network'); 
import { BigNumber } from '../wallet/util';
import TronChain from 'tronweb';
 
class TronContract {

     constructor() {
          this.abi = null;
          this.mainchain = null;
          this.config = null;
          this.options = {
               feeLimit: 1000000000,
               callValue: 50
          }
          
          this.method = {};
          this.signer = null;
          this.issuerAddress = null;

          this.contract = null;
     }

     async init(configName, signer=null) {
          this.mainchain = new TronChain(network.tron.chain);
          if (!_.isNil(signer)) {
               this.mainchain = window.tronWeb;
               this.issuerAddress = this.mainchain.defaultAddress.base58;
          }
          this.config = config[configName];
          this.signer = signer;
          this.abi = require(`../../artifacts/${configName}.json`);
          return await this.mainchain.contract().at(this.config.address);
          // return this;
     }

     async call(name, input=null) {
          let tronWeb = this.mainchain;
          if (!_.isNil(this.signer)) {
               tronWeb = window.tronWeb;
          }

          const method = this.getMethodObj(name);
          const paramString = _.map(method.inputs, 'type');
          const selector = `${name}(${paramString})`;
          let paramArr = [];
          if (method.inputs.length > 0 && !_.isNil(input)) {
               paramArr = _.map(method.inputs, (val, key) => {
                    return {
                         type: val.type,
                         value: input[key]
                    }
               });
          }

          console.log(paramArr);

          const transaction = await this.trigger(
               this.config.address,
               selector, 
               this.options,
               paramArr,
               this.issuerAddress
          )

          const signature = await this.sign(transaction);
          const result = await this.sendRawTransaction(signature);
          return result;

     }

     async view() {
          try {
               const contract = await tronWeb.contract().at(this.config.address);
     
               const name = await contract.name().call();

               return name;
          } catch (error) {
               
          }
     }

     issuer(address) {
          this.issuerAddress = address;
          return this;
     }

     async trigger(address, functionSelector, options = {}, parameters = [], issuerAddress=null) {
          try {
               const tronweb = this.mainchain;
               const issuer = !!issuerAddress? tronWeb.address.toHex(issuerAddress) : null;
               const transaction = await tronweb.transactionBuilder.triggerSmartContract(
                    address,
                    functionSelector,
                    options,
                    parameters,
                    issuer
               );
          
               if (!transaction.result || !transaction.result.result) {
                    throw new Error('Unknown trigger error: ' + JSON.stringify(transaction.transaction));
               }
               return transaction;
          } catch (error) {
               throw new Error(error);
          }
     }

     async sign (transaction) {
          try {
               const tronweb = this.mainchain;
               const signedTransaction = await tronweb.trx.sign(transaction.transaction);
               return signedTransaction;
          } catch (error) {
               console.log(error, 'signerr');
               throw new Error(error);
          }
     };
     
     async sendRawTransaction (signedTransaction) {
          try {
               const tronweb = this.mainchain;
               const result = await tronweb.trx.sendRawTransaction(signedTransaction);
               return result;
          } catch (error) {
               throw new Error(error);
          }
     }

     getMethodObj(name) {
          const method = this.abi.find(elem => {
               return elem.name == name;
          })

          return method;
     }

     setParams(inputs) {
          let paramString = '';
          for(let i; i<inputs.length;i++) {
               paramString+=`${inputs[i].type},`;
               console.log("Type: ", inputs[i].type)
          }
          console.log("Param: ", paramString)
          // return paramString.replace(/^\s+|\s+$/gm,',');
          return paramString;
     }
}

export default new TronContract;