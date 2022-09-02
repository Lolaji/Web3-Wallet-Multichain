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