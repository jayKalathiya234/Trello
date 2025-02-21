require('dotenv').config();
const express = require('express');
const { connectDb } = require('./db/db');
const indexRoutes = require('./routes/indexRoutes');
const server = express();
const port = process.env.PORT || 4000
const path = require('path')
const cors = require('cors');
const conectChat = require('./socket');
const http = require('http')
const SERVER = http.createServer(server);


server.use(express.json());
// server.use(cors());
server.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

server.use('/api', indexRoutes);
server.use('/public', express.static(path.join(__dirname, 'public')))

conectChat(SERVER)
server.listen(port, () => {
    connectDb();
    console.log(`Server Is Connected At Port ${port}`);
})
