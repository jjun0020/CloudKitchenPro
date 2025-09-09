//This is for connecting to the mongoDb mpass
const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/assignment_2';

async function connectToMongoDB() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB via Mongoose');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

//Reference: week6 lab
// If connect, the message will display on the terminal
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

// If error, the message will display on the terminal
mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

// If disconnected, the message will display on the terminal
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed due to app termination');
    process.exit(0);
});

module.exports = { connectToMongoDB };