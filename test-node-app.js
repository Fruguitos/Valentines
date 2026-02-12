const a = require('./app.js');
console.log('typeof initAll:', typeof a.initAll);
console.log('keys:', Object.keys(a));
console.log('global.ValentineApp exists:', !!global.ValentineApp);
