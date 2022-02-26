//const express = require('express');
import express from 'express';
import { Server }  from 'socket.io';
import cors from 'cors';
import { createClient } from 'redis';

const app = express();
const port = 4001;
app.use(cors());
const server = app.listen(port, console.log(`Server is running on port ${port}`));
const io = new Server(server);

io.on('connection', socket => {
    connectToRedis();
    socket.join('room 1');
    Promise.all([fetchSockets()]).then((value) => {
        // ATTENTION: This relies on one room existing.
        if(value[0].length >= 4) {
            setTimeout(() => {
                io.to('room 1').emit('game-start', {userIds: [], something: 1});
            }, 3000);
        }
    });
    
    socket.on('testFirst', (textFromUser) => {
        socket.to('room 1').emit('testFirst', textFromUser);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });

});

const fetchSockets = async () => {
    const sockets = await io.in('room 1').fetchSockets();
    return sockets;
}

const connectToRedis = async () => {
    const client = createClient();
    client.on('error', (err) => console.log('Redis Client Error ', err));
    await client.connect();
    await client.mSet('keyTEst', 'testValue');
}
