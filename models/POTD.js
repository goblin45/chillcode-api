const mongoose = require('mongoose')

const problemSchema = new mongoose.Schema({
    id : {
        type : String,
        required : true
    },
    title : {
        type : String,
        required : true
    },
    inputRadio :{
        type : String,
        default : "false"
    },
    category : {
        type : String,
        required : true
    },
    company : {
        type : String,
        required : true
    },
    difficulty: {
        type : String,
        required : true
    },
    desc : {
        type : String,
        required : true
    },
    examples : [{
        "input" : {
            type : String,
            required : true
        } ,
        "output" : {
            type : String,
            required : true
        },
        "explanation" :{
            type : String,
            required : true
        } 
    }],
    testcase :[
        {
            "input": {
                type: "String",
                required: true       
            },
             "output":{
               type: "String",
               required : true
             }
        }

    ],
    submissions : {
        type : Number,
        default : 0
    },
    correct_submissions : {
        type : Number,
        default : 0
    },
    accuracy : {
        type : Number,
        default : 0
    },
    status:{
        type : String,
        default : 'Selected'
    }

})

module.exports = mongoose.model('ProblemOfTheDay',problemSchema)