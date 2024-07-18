
import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    followers:{
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    following: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    image:{
        type: String,
        default: 'https://static-00.iconduck.com/assets.00/profile-default-icon-1024x1023-4u5mrj2v.png'
    },
    bio:{
        type: String,
    },
    link:{
        type: String,
    },

}, {timestamps: true})

export const User = mongoose.model('User', userSchema);