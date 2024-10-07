const TronWeb = require('tronweb');

const tronWeb = new TronWeb({
  fullHost: 'http://127.0.0.1:8090'
});

tronWeb.trx.getCurrentBlock().then(block => {
  console.log('Current Block:', block);
}).catch(err => {
  console.error('Error:', err);
});
