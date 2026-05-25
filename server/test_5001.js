const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('ok'));
const server = app.listen(5001, () => {
  console.log('started 5001');
});
setTimeout(() => {
  console.log('Still alive? ', server.listening);
}, 2000);
