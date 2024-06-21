
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
    },
    
    bio:{
        type: String,
    },
    
    link:{
        type: String,
    }


    // isAdmin: {
    //     type: Boolean,
    //     required: true,
    //     default: false
    // },
    // isVerified: {
    //     type: Boolean,
    //     required: true,
    //     default: false
    // }
})

export const User = mongoose.model('User', userSchema);