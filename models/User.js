const mongoose =  require('mongoose');
const Problem = require('./Problem');

const userSchema = new mongoose.Schema({
    password : {
        type : String,
        required : true
    },
    username : {
        type : String,
        required: true
    },
    e_mail :{
        type :String,
        required : true
    },
    rating: {
        type: Number,
        default: 7.8
    },
    solvedProblems: {
        hard: {
            type: Number,
            default : 0
        },
        medium: {
            type: Number,
            default : 0
        },
        easy: {
            type: Number,
            default : 0
        },
        problems: [
        {
           problemId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : Problem,
            required : true
           },
           solution: [{
             cpp: {
                type : String,
                default:"code in cpp"
             },
             java: {
                type : String,
                default:"code in java"
             },
             python: {
                type : String,
                default:"code in python"
             }
           }]
        }
    ]},
    streak: {
        type: Number,
        default : 0
    },
    last_potd : {
        type : Date
    }
})

module.exports = mongoose.model ('User',userSchema)