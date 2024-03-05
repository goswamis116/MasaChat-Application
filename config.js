// config.js
import mongoose from 'mongoose';

export const connect = async () => {
    try {
        const connectionString = process.env.MONGODB_URI;
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Database Connected");
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
};
