// const { type } = require('@testing-library/user-event/dist/type')
const mongoose=require('mongoose')
const {Schema}=mongoose

const UserSchema=new Schema({
    username:{
        type: String,
        required:true,
        unique:true
    },
    name:{
        type: String,
        required:true
    },
    email:{
        type: String,
        required:true,
        unique:true
    },
    password:{
        type: String,
        required:true
    },
    date:{
        type: Date,
        default:Date.now
    }
})
const User=mongoose.model('user',UserSchema);
User.createIndexes()

module.exports=User;