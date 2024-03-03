import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { connect } from "./config.js";
import { chatModel } from "./chat.schema.js";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log("Socket connection established");
    
    socket.on('join', (data) => {
        socket.username = data;

        // Send old messages to the clients
        chatModel.find().sort({ timestamp: 1 }).limit(50).then(messages => {
            socket.emit('load_message', messages);
        }).catch(err => {
            console.log(err);
        });
    });

    socket.on('new_message', (message) => {
        let userMessage = {
            username: socket.username,
            message: message
        };

        // Save the message to the database
        const newChat = new chatModel({
            username: socket.username,
            message: message,
            timestamp: new Date()
        });
        newChat.save().then(() => {
            // Broadcast message to all clients
            io.emit('broadcast_message', userMessage);
        }).catch(err => {
            console.error("Error saving message:", err);
        });
    });

    socket.on('disconnect', () => {
        console.log("Connection is disconnected");
    });

    // Handle delete request to clear chat
    socket.on('delete_chat', async () => {
        try {
            await chatModel.deleteMany({});
            console.log("Chat cleared from the database");
            // Emit event to all clients to notify chat has been cleared
            io.emit('chat_cleared');
        } catch (err) {
            console.error("Error clearing chat:", err);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
    connect();
});
