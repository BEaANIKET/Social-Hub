

import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        const response = await mongoose.connect(process.env.MONGO_URL)

        console.log("DB connection established");
    
    } catch (error) {
        console.log("Error Db connecting");
    }

}