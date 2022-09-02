# Web3 Wallet Multichain
Web3 Wallet Multichain simplifies interation of multiple web3 wallets from multiple blockchains such as Metamask, WalletConnect, TronWeb, TronPro, etc.

## Contract & Web3 Wallet Integration
``` plugin/wallet/index.js``` is develop to connect and interact with user web3 wallet, and ``` plugin/contract/index.js ``` is developed to intaract with the smart contract you setup in the dApp. Also, a utility functions are developed ``` plugin/contract/util.js ```, which contain 2 functions; parseEther(...) and shortAddress(...), which parseEther convert the value of Ether to Wei ``` e.g. parseEther('0.002') ```, and shortAddress shorten wallet address like this ``` 0xTYR...BFT ```.

You will find the demo at the ``` components/Header/Index.vue ```

### Contract setup

First You will need to create a .env file and copy the .env.example content into .env and fill it, you can use the command below: 

```sh
$ touch .env && cp .env.example .env
```
After that you will need to get an [infura](http://infura.io) api key by registering and creating a project, and copy your Api key and put it in .env.

<pre><code>
INFURA_PROJECT_ID=replace-the-infura-api-key-that-you-copied
</code></pre>

If you are going to be interacting with tron contract without connecting a wallet, you will need to get a [TronGrid](https://www.trongrid.io/) API key and your TRX private key and set it up in the .env

<pre><code>
TRONGRID_API_KEY=trongrid-api-key-here
TRON_ACCOUNT_PRIVATE_KEY=trx-private-key-here
</code></pre>

The full tron configuration is located at ```config/network.js```

<pre><code>
module.exports = {
     tron: {
          chain: {
               fullHost: 'https://api.trongrid.io',
               solidityNode: 'https://api.trongrid.io',
               headers: { 
                    "TRON-PRO-API-KEY": process.env.TRONGRID_API_KEY 
               },
               privateKey: process.env.TRON_ACCOUNT_PRIVATE_KEY
          }
     }
}
</code></pre>

### Step 1: Creating contract ABI file

Before we can interact with any smart contract in our dApp we will need the contract ABI. 

First, create a JSON file in ``` artifacts ``` folder ``` e.g. artifacts/erc20.json ```, Copy the contract abi of the deployed smart contract you want to use in the dApp, then paste it in the contract ABI file you just created.

NOTE: you don't need contract ABI for TRC20 or other TRC Token

### Step 2: Setting up contract configuration
Navigate to the folder ``` config/contract.js ``` then add contract settings of the deploy smart contract you are integrating. You can add as many contract setting as you like, as long as you have the ABI JSON file created and have copied the contract ABI you want to integrate into the file.

<pre><code>
module.exports = {
     erc20: {
          address: "0x70a72833d6bF7F508C8224CE59ea1Ef3d0Ea3A38", // contract address of the contract you copied its ABI
          networkRPC: "https://mainnet.infura.io" // this is used when you don't parse signer when initializing smart contract and it is only used for calling read method of the the contract.
     },
     ... (other contract(s) setting goes here)
}
</code></pre>

Note: each of the key (e.g. "erc20") of the contract setting above must match the contract ABI filename you created in step 1. and you can change the contract address has you wish. Also you can add another contract object if you wish to use another contract in your dApp, and repeat step 1 & 2 to set it up.

### Step 3: Initializing the smart contract and calling its properties and methods
Before you can initialize your smart contract and call its properties and methods, you will need to import ``` plugin/contract ``` plugin, and to sign the smart contract you will need to connect user wallet using ``` plugin/wallet ``` plugin.

<pre><code>
import Contract from "../../plugin/contract";
import Wallet from "../../plugin/wallet";

// connecting user web3 wallet
const connection = await Wallet.connect();
const connection = await Wallet.connect(true); // Connect TronLink Wallet by parsing true

// get signer from the connection
const signer = await connection.signer();

// you can also get address, balance, etc. of the signer (account connected to in the wallet)
const connectedAddress = await signer.getAddress();
const connectedAddress = await signer.defaultAddress.base58; // Get TronLink wallet address
const walletBalance = await signer.getBalance();
const walletBalance = await signer.trx.getBalance(); // Get TronLink wallet balance

// Interacting with ERC20 smart contract
//+++++++++++++++++++++++++++++++++++++++++

// initialize the smart contract
// takes 2 parameters
// @param 1: the contract key in the config/contract.js which matches the contract ABI filename
// @param 2: the wallet connected to the dApp 
const erc20 = await Contract.init('erc20', signer);

// calling the read method of the smart contract
const name = await erc20.name();
const name = await erc20.name().call(); // add .call
const symbol = await erc20.symbol();
const balanceOf = await erc20.balanceOf(connectedAddress)

// To retrieve the uint return data
console.log(balanceOf.toString())

// calling the write method of a smart contract
// using approve method as an example
// param 1: the address you want to approve
// param 2: the amount you want to approve for the address in Wei, and it is mandatory that you parse the "signer" instance of the connected wallet when initializing the smart contract
const approve = await erc20.approve("0x15BDBe44F88A17eB4391535854f29406e3Cf0efd", "5000")
const tx = approve.wait();
console.log(tx);


// Interacting with TRC20 Smart Contract
// ++++++++++++++++++++++++++++++++++++++

// Initialize the contract
const trc20 = await Contract.init('trc20', signer);

// Calling contract read method
const name = await trc20.name().call();
const symbol = await trc20.symbol().call();
const balance = await trc20.balanceOf("TEnmkaqvUbMPYajvbC2mmNH9KLo6DR9yQt").call();

// To retrieve the uint return data
console.log(balance.toString())

// Calling contract write method
const amount = parseEther('0.003');// convert ether value to Wei
const tx = await trc20.approve('TEnmkaqvUbMPYajvbC2mmNH9KLo6DR9yQt', amount).send();
console.log(tx); // display transaction response in the console
</code></pre>

### Wallet connection and data
To connect to user wallet you will need to import ``` plugin/wallet ``` plugin and also need infura project ID. In the ``` .env ``` file your will put the infura project ID:

```sh
INFURA_PROJECT_ID=yeowehdwoeuhdiwheuu // put generated infura project id
```
Now that you have that setup, you can now start interacting with the user wallet:

<pre><code>
import Wallet from "../../plugin/wallet";

// instantiate the connection
const connection = await Wallet.connect();
const connection = await Wallet.connect(true); // To connect to TronLink wallet, parse "true" to the connect(...) method

// getting the wallet account instance
const signer = await connection.signer();

//getting wallet address
const walletAddress = await signer.getAddress();
const walletAddress = await signer.defaultAddress.base58; // Getting the TronLink wallet address

// getting wallet balance
const walletBalance = await signer.getBalance();
const walletBalance = await signer.trx.getBalance(); // Getting TronLink wallet balance

// you might want to convert Ether value to Wei, you can use the wallet utility plugin ``` plugin/wallet/util ```
import { parseEther, shortAddress } from '../../plugin/wallet/util'

// convert ether to Wei
const amount = parseEther('0.01')

// to short address, e.g. 0xEDF...B4DE
const shortAddress = shortAddress(walletAddress)

</code></pre>

### Get already connected user wallet
You might want to retrieve already connected wallet data in the dApp, here is how to do it:

<pre><code>
// call the load function of the Wallet instance without calling Wallet.connect();
Wallet.load(async (event, signer) => {
     // There are 3 events available: 
     // 1. accountsChanged: emit when user change their wallet account
     // 2. chainChanged: emit when user change to other network, such as changing from Ethereum to Polygon
     // 3. disconnect:  emit when user disconnect all the connected wallet accounts

     // get user connected account address
     const walletAddress = await signer?.getAddress()
     // initialize smart contract
     const erc20 = await Contract.init('erc20', signer);
     // call smart contract balanceOf method
     const balance = await erc20.balanceOf(walletAddress); // contract balance of a connected wallet

     // set wallet data in store
     this.$store.dispatch('wallet/connectWallet', {
          balance: parseFloat(balance.toString()),
          address: shortAddress(walletAddress),
          energy: 700,
          bandwidth: 10,
          usdt: 0.29,
          obtain: 0.45,
          genergy: 700,
     });

});


// TronLink Load
Wallet.loadTron(async (tronWeb) => {
     const walletAddress = await tronWeb.defaultAddress.base58;
     const walletBalance = await tronWeb.trx.getBalance();
})
</code></pre>

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out the [documentation](https://nuxtjs.org).

## Special Directories

You can create the following extra directories, some of which have special behaviors. Only `pages` is required; you can delete them if you don't want to use their functionality.

### `assets`

The assets directory contains your uncompiled assets such as Stylus or Sass files, images, or fonts.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/assets).

### `components`

The components directory contains your Vue.js components. Components make up the different parts of your page and can be reused and imported into your pages, layouts and even other components.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/components).

### `layouts`

Layouts are a great help when you want to change the look and feel of your Nuxt app, whether you want to include a sidebar or have distinct layouts for mobile and desktop.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/layouts).

### `pages`

This directory contains your application views and routes. Nuxt will read all the `*.vue` files inside this directory and setup Vue Router automatically.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/get-started/routing).

### `plugins`

The plugins directory contains JavaScript plugins that you want to run before instantiating the root Vue.js Application. This is the place to add Vue plugins and to inject functions or constants. Every time you need to use `Vue.use()`, you should create a file in `plugins/` and add its path to plugins in `nuxt.config.js`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/plugins).

### `static`

This directory contains your static files. Each file inside this directory is mapped to `/`.

Example: `/static/robots.txt` is mapped as `/robots.txt`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/static).

### `store`

This directory contains your Vuex store files. Creating a file in this directory automatically activates Vuex.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/store).
