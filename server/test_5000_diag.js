const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('ok'));
const server = app.listen(5000, () => {
  console.log('started 5000');
});
server.on('close', () => console.log('SERVER CLOSED EVENT'));
server.on('error', (err) => console.log('SERVER ERROR EVENT:', err));
setTimeout(() => {
  console.log('Still alive? ', server.listening);
}, 2000);
