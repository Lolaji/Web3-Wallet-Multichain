module.exports = {
     erc20: {
          address: "0x70a72833d6bF7F508C8224CE59ea1Ef3d0Ea3A38",
          networkRPC: "https://mainnet.infura.io/v3/",
          is_tron: false
     },
     trc20: {
          address: process.env.TRON_ADDRESS,
          is_tron: true,
     }
}