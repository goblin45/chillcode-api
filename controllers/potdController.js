const ProblemOfTheDay = require('../models/POTD')
const asyncHandler = require('express-async-handler')
var compiler = require('compilex')
const schedule = require('node-schedule');
const axios = require('axios');
const User = require('../models/User');
const Problem = require ('../models/Problem');
const POTD = require('../models/POTD');


// @desc Get all problems
// @route GET /problemOfTheDay/allproblemOfTheDay
// @access Private
const getAllPotd = asyncHandler(async(req,res)=>{
    const potd = await ProblemOfTheDay.find().exec()
     if(!potd?.length)
     {
        return res.status(400).json({message: "No problems found"})

     }
     res.status(200).json(potd)
})

// @desc Get problems
// @route GET /problemOfTheDay
// @access Private
const getPotd =asyncHandler(async(req,res)=>{
    const problemList = []
    const problems = await Problem.find({hasBeenPotd : false}).exec()
    const potd = await ProblemOfTheDay.find({status : 'Selected'}).exec()
    if(potd.length === 0){    
      for(const problem of problems)
      {
              problemList.push(problem._id)   
      }
      console.log(problemList)
      if(problemList.length === 0)
      {
          return res.status(202).json({message : "No problem left to select"})
      }
      else {
          const randomIndex = Math.floor(Math.random() * problemList.length);
          const p_id = problemList[randomIndex];
          const problemOfTheDay = await Problem.find({_id : p_id }).exec()
          const { _id, id, title, category, difficulty, company, desc, inputRadio, examples, testcase } = problemOfTheDay[0]
          const problemObject = { _id, id, title, category, difficulty, company,inputRadio, desc, examples, testcase ,status : 'Selected'}
          
          const problemOfTheDayAdded = await ProblemOfTheDay.create(problemObject)
        
          if( problemOfTheDayAdded)
          {
              problemOfTheDay[0].hasBeenPotd = true
              const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000;
              setTimeout(async () => {
                  await ProblemOfTheDay.deleteOne({ _id: p_id });
              }, twentyFourHoursInMilliseconds);
              await problemOfTheDay[0].save()
              return res.status(200).json(problemOfTheDay)
              
          }
          else {
            return res.status(400).json({message : 'Can not get POTD'})
          }
        }
        
    }
    else {
      return res.status(200).json(potd[0])
    }
})
// @desc show problem
// @route POST /problemOfTheDay/showPotd
// @access Private
const showPotd =  asyncHandler(async(req,res)=>{
  const {_id} = req.body
  console.log(_id)

  if(! _id)
  {
      return res.status(400).json({message : "Id is required"})
  }
  const problem = await ProblemOfTheDay.findOne({_id : _id}).lean().exec()
 
  if(problem)
  {
      return res.status(200).json(problem)
  }
 
})

module.exports = {
    getAllPotd,
    getPotd,
    showPotd
}