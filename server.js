require('dotenv').config();
const express = require('express');
const { connectDb } = require('./db/db');
const indexRoutes = require('./routes/indexRoutes');
const server = express();
const port = process.env.PORT || 6000
const path = require('path')

server.use(express.json());
server.use('/api', indexRoutes);

server.use('/public', express.static(path.join(__dirname, 'public')))

server.listen(port, () => {
    connectDb();
    console.log(`Server Is Connected At Port ${port}`);
})
