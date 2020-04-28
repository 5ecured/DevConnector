const mongoose = require('mongoose')

//Below is all we want in a user. Everything else will be in the profile
const UserSchema = mongoose.Schema({
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
        required: true,        
    },
    avatar: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const User = mongoose.model('User', UserSchema)

module.exports = User