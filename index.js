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
    const roomKey = 'room 1'; // Figure out Room key stuff later 
    socket.join(roomKey);
    Promise.all([fetchSockets(roomKey)]).then((value) => {
        // ATTENTION: This relies on one room existing.
        console.log(value[0].length);
        if(value[0].length >= 1) { //change to 4 when not testing.
            beginGame(roomKey, value[0]);
        }
    });

    socket.on('addName', (updatedPlayersInfo) => {
        console.log('badabinmg');
        addNameToPlayer(roomKey, updatedPlayersInfo);
    });
    
    socket.on('testFirst', (textFromUser) => {
        socket.to('room 1').emit('testFirst', textFromUser);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });

});

const addNameToPlayer = async (roomKey, updatedPlayersInfo) => {
    const client = createClient();
    await client.connect();
    const playersList = updatedPlayersInfo.allPlayers;
    playersList[0].name = updatedPlayersInfo.playerName;
    await client.set(roomKey, JSON.stringify(playersList));
    const playersString = await client.get(roomKey);
    io.to(roomKey).emit('playerName-updated', JSON.parse(playersString));
} 

const fetchSockets = async roomKey => {
    const sockets = await io.in(roomKey).fetchSockets();
    return sockets;
}

const savePlayersByRoomId = async (roomKey, playersToSave) => {
    const client = createClient();
    await client.connect();
    await client.set(roomKey, JSON.stringify(playersToSave));
    const playersString = await client.get(roomKey);
    return JSON.parse(playersString);
}

const beginGame = async (roomKey, connectedPlayers) => {
    //io.to(roomKey).emit('game-start', {userIds: [], something: 1});
    const playersToSave = connectedPlayers.map(player => (
        {
            id: player.id,
            goldAmount: 5,
            memberBank: [],
            reputation: 0,
        }
    ));
    const players = await savePlayersByRoomId(roomKey, playersToSave);
    io.to(roomKey).emit('game-start', players);
}


// public string name; // Name of the Member
// 	public float skill; // Skill level of the Member 1.0 - 20.0
// 	public float alignment; // Alignment of good or evil -5.0 to 5.0  
// 	public float experience; // Experience of raiding / quests 1.0 - 20.0// 	public float age; // Age of Member 16.0 - 45.0 Stats decline at 45.0 Member may choose to retire.
// 	public float price;



    // [] Create context for 4 players and their objects. (types for players)
    // []When game starts add 5 coins to players banks, and send out update to UI.
    // Then send them 5 player cards to decide if they want them.
    // Await their responses 
    //      It will come as user
 