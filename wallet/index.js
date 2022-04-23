// require('dotenv').config()
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import WalletConnectProvider from "@walletconnect/web3-provider";
import { device } from './util';
const config = require('../../config/network');

class Wallet {
     constructor() {
          this.isTron = false;
          this.isConnected = false;
          this.providerInstance = null;
     }

     async connect(is_tron=false) {
          try {
               if (is_tron) {
                    this.isTron = true;
                    const response = await window.tronLink?.request({method: 'tron_requestAccounts'});
                    if (window.tronWeb && window.tronWeb.ready && window.tronLink) {
                         this.providerInstance = await window.tronWeb;
                         this.isConnected = true;
                    } else {
                         const dev = device();
                         if (!!dev.mobile()) {
                              alert("Please use the TronLink Pro mobile wallet browser!");
                         } else {
                              alert ("Please login to your tronlink wallet or install the TronLink extension!");
                         }
                    }
     
               } else {
                    let web3Modal = new Web3Modal({
                         network: "mainnet", // optional
                         cacheProvider: true, // optional
                         providerOptions: {
                              walletconnect: {
                                   package: WalletConnectProvider, // required
                                   options: {
                                     infuraId: process.env.INFURA_PROJECT_ID, // required
                                   }
                              }
                         }
                    });
                    let connection = await web3Modal.connect();
                    let provider = new ethers.providers.Web3Provider(connection);
                    this.providerInstance = provider;
                    this.isConnected = true;
               }
               return this;
               
          } catch (error) {
               console.error(error);
               return error;
          }
     }

     async load(callback=null) {
          try {
               const { ethereum } = window;
                    
               if (ethereum) {
                    const provider = new ethers.providers.Web3Provider(ethereum);
                    const signer = provider.getSigner();
                    callback("loaded", signer);

                    ethereum.on('accountsChanged', () => {
                         callback('accountsChanged', signer);
                    })

                    ethereum.on('chainChanged', () => {
                         callback("chainChanged", signer)
                    })
     
     
                    ethereum.on('disconnect', (error) => {
                         callback("disconnect", signer)
                    })
               }
                    
                    


          } catch (error) {
               console.log(error);
          }
     }

     connected () {
          return this.isConnected;
     }

     async loadTron(callback=null) {
          const { tronWeb } = window;

          if (tronWeb) {
               callback(tronWeb);
          }
     }

     async signer() {
          if (!!this.providerInstance) {
               if (this.isTron) {
                    return this.providerInstance;
               }
               return await this.providerInstance.getSigner();
          }
          return
     }

     async provider(){
          return this.providerInstance;
     }
}

export default new Wallet;