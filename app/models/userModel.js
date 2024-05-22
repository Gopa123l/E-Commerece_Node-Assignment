const mongoose = require('mongoose')

const UserSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String, lowercase: true, required: true, match: [/\S+@\S+\.\S+/, 'is invalid'], index: true,
            default: 0,
            trim:true,
            unique:1
        },
        password:{
            type:String,          
            minlength:8,
            required:true
        },
        confirmationToken: {
            type: String,
            default: null
        },
        isConfirmed: {
            type: Boolean,
            default: false
        },
        resetPasswordToken: {
            type: String,
            default: null
        },
        resetPasswordExpires: {
            type: Date,
            default: null
        },
        lastLoggedIn: {
            type: String,
            default: null
        }       
    },
    {
        timestamps: true
    }
)

const User = mongoose.model('User', UserSchema);

module.exports = User;























































































































































