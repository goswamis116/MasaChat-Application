import mongoose from "mongoose";

export const connect=async()=>{
    await mongoose.connect("mongodb://localhost:27017/MasaChatApp",{
        useNewUrlParser:true,
        useUnifiedTopology:true
    });
    console.log("Database Connected");
}