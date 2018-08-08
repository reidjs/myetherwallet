export default function web3OverideMew (web3, wallet) {
  if (!wallet) return web3

  const methodOverides = {
    signTransaction (tx, privateKey) {
      return new Promise((resolve, reject) => {
        console.log(tx, privateKey, '-- HOW COULD I TRIGGER THE CONFIRMATION MODAL IN HERE---')
        // pass in this?  something else?
        wallet.signTransaction(tx)
          .then(_result => {
            resolve(_result)
          })
          .catch(_error => {
            reject(_error)
          })
        // res()
      })
    },
    sign (data) {
      return new Promise((resolve, reject) => {
        console.log(data, '-- HOW COULD I TRIGGER THE CONFIRMATION MODAL IN HERE---')
        wallet.sign(data)
          .then(_result => {
            resolve(_result)
          })
          .catch(_error => {
            reject(_error)
          })
        // res()
      })
    }
  }

  web3.eth.sendTransaction.method.accounts = {
    wallet: [{
      privateKey: true,
      ...methodOverides
    }],
    ...methodOverides
  }

  web3.eth.signTransaction = methodOverides.signTransaction
  web3.eth.sign = methodOverides.sign
  // web3.eth.signTransaction.
  return web3
}