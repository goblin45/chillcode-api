const Problem = require('../models/Problem')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')
var compiler = require('compilex');
const axios = require('axios')
const ProblemOfTheDay = require('../models/POTD')
var options = {stats : true}; 
compiler.init(options);

// @desc Get all problems
// @route GET /problem
// @access Private
const getAllProblems = asyncHandler(async(req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const perPage = 5;

    const skip = (page -1)*perPage;

    try {
        const problems = await Problem.find().skip(skip).limit(perPage).lean()
		if ( !problems?.length ) {
			return res.status(400).json ({message : 'No Problem Found'})
		}
    // console.log(problems)
		return res.status(200).json({problems})
    } catch(error) {
        return res.status(500).json({message : "Server Error"});
    }  
   
})

// @desc run problem
// @route POST /problem/run
// @access Private

const runProblem = asyncHandler(async(req,res)=>{
    const {_id, code, language} = req.body
    if(!_id )
    {
      res.status(401).json({message: 'All fields are required'})
    }
    const problem  = await Problem.findOne({_id:_id}).exec()
    if(!problem)
    {
      console.log("No problem found")
    }
    const inputRadio = problem.inputRadio
    if (!language)
    {
        language  = 'cpp'
    }
    for (const testCase of problem.testcase)
    {
        const input =(testCase.input)
        const expectedOutput = (testCase.output)
       
        // const input = testValues.split(',').filter(value => value.trim() !== '')
    
    if(!input?.length || !expectedOutput?.length)
    {
        res.status(400).json ({message : "No data found"})
    }
    // res.status(200).json({message : "Success"})
    console.log("Input" ,input)
    console.log("Expected Output",expectedOutput)
    console.log("Language" , language)
    console.log("code: ",code)
    console.log("input",inputRadio)

   
      if(language === 'c' || language === 'cpp')
      {
          var envData = { OS : "windows" , cmd : "g++", options : {timeout : 10000} };
          compiler.compileCPPWithInput(envData, code, input, function(data){
              if(data.error) {
                  return res.status(400).json({error: data.error});
                }
                else {
                    if ((data.output) === expectedOutput){
                    return res.status(200).json({output: data.output, message: 'Test Case Passed'})
                   }
                   else {
                    return res.status(202).json({output: data.output, message: 'Test Case Failed'})
                   }
                   
                }
          });
      }
      else if(language === 'java')
      {
        var envData = { OS : "windows",options : {timeout : 10000}}; 
        compiler.compileJavaWithInput( envData , code , input ,  function(data){
          if(data.error) {
            return res.status(400).json({error: data.error});
          }
          else {
              if ((data.output) === expectedOutput){ 
              return res.status(200).json({output: data.output, message: 'Test Case Passed'})
             }
             else {
              return res.status(202).json({output: data.output, message: 'Test Case Failed'})
             }
             
          }
      });
      }
      else 
      {
        var envData = { OS : "windows",options : {timeout : 10000}};
        compiler.compilePythonWithInput( envData , code , input ,  function(data){
          if(data.error) {
            return res.status(400).json({error: data.error});
          }
          else {
              if ((data.output) === expectedOutput){ 
              return res.status(200).json({output: data.output, message: 'Test Case Passed'})
             }
             else {
              return res.status(202).json({output: data.output, message: 'Test Case Failed'})
             }
             
          }
      });
      }
      
    }  

try {
  const fullStatData = await new Promise((resolve) => {
      compiler.fullStat(resolve);
  });
  console.log(fullStatData);
} catch (error) {
  console.error(error);
}
})
compiler.flush(function(){
console.log('All temporary files flushed !'); 
});

// @desc show problem
// @route POST /problem/show
// @access Private
const showProblem = asyncHandler(async(req,res)=>{
    const {_id} = req.body
   

    if(!_id) {
        return res.status(400).json({message : "Id is required"})
    }
    const problem = await Problem.findOne({_id : _id}).lean().exec()
   
    if (problem) {
        return res.status(200).json(problem)
    }
})

// @desc create problem
// @route POST /problem
// @access Private
const createNewProblem = asyncHandler(async(req,res) => {
    const { _id, id, title, category, difficulty, company, desc, inputRadio, examples, testcase } = req.body
    console.log(inputRadio)

    if(!id) {
        return res.status(400).json({message : "Id is required"})
    }
    const duplicate = await Problem.findOne({id}).lean().exec()

    if(duplicate) {
        return res.status(409).json({message : "Duplicate Id"})
    }

    const problemObject = { _id, id, title, category, difficulty, company,inputRadio, desc, examples, testcase }
    const problem = await Problem.create(problemObject)

    if(problem) {
        return res.status(201).json({message : `New Problem with id ${id} created`})
	} else {
        return res.status(400).json({message : 'Invalid data received'})
    }
    
})

// @desc submit problem
// @route POST /problem/submit
// @access Private

const submitProblem = asyncHandler(async (req, res) => {
  const { user_id, problem_id, code, language} = req.body;

  if (!user_id || !problem_id || !code || !language ) {
    return res.status(400).json({ message: "All fields are required" });
  }

try {
  const problem = await Problem.findOne({ _id: problem_id }).exec();
  const user = await User.findOne({ _id: user_id }).exec();
  const potd = await axios.get('http://localhost:3500/problemOfTheDay')
  const potd_id = potd.data._id
  console.log("potd",potd.data)
  
  let status, resStatus, resMessage, resOutput;
  
  try{
  const response = await axios.post('http://localhost:3500/problem/run', {
    code: code,
    language: language,
    inputRadio: problem.inputRadio,
    _id: problem_id,
  });

  resStatus = response.status;
  resMessage = response.message
  resOutput = response.data
  console.log("message", resMessage); 
} catch(run_err){
  resMessage = run_err.response.data.error
  return res.status(400).json({message : resMessage})
}
   // console.log("response from /run",response)`
  const problemExists = user.solvedProblems.problems.some((prob) =>
    prob.problemId.toString() === problem._id.toString()
  );
 
  if (problemExists) {
    console.log("Found")
    user.solvedProblems.problems.forEach((prob) => {
      if (prob.problemId.toString() === problem._id.toString()) {
        for(const solution of prob.solution)
        {
          console.log("solution")
          if(language === 'cpp')
          {
            solution.cpp = code
          }
          else if(language === 'java')
          {
            solution.java = code
          }
          else {
            solution.python = code
          }
        }
      }
    })
  } 
else {
if(language === 'cpp')
{ 
const newProblem = {
  problemId: problem._id,
  solution : [
   {
     "c++" : code
   }
  ]
}
user.solvedProblems.problems.push(newProblem);
}
else if(language === 'python')
{
  const newProblem = {
    problemId: problem._id,
    solution : [
     {
       "python" : code
     }
    ]
  }
  user.solvedProblems.problems.push(newProblem);
}
else {
  const newProblem = {
    problemId: problem._id,
    solution : [
     {
       "java" : code
     }
    ]
  }
  user.solvedProblems.problems.push(newProblem);
  
}
if(problem.difficulty === "Easy")
  {
    user.solvedProblems.easy++
  }
  else if(problem.difficulty === "Medium")
  {
    user.solvedProblems.medium++
  }
  else {
    user.solvedProblems.hard++
  }
} 
  console.log("Before submissions:", problem.submissions);
  problem.submissions += 1;
  if (status === "Solved") {
    problem.correct_submissions += 1;
    console.log("Correct", problem.correct_submissions);
  }
  const accuracy =(( problem.correct_submissions/problem.submissions) * 100).toFixed(2);
  console.log("After submissions:", problem.submissions);
  console.log("Accuracy",accuracy,"%")
  problem.accuracy = accuracy
  if (resStatus === 200) {
    status = "Solved";
    if(!problemExists)
    {is_potd = potd_id.toString() === problem._id.toString();

    if (is_potd) {
      user.streak += 1;
      console.log("Streak", user.streak);}
    }
    console.log("Status:", status);
  }
 
  await Promise.all([user.save(), problem.save()]);

  if (resStatus === 200)
    return res.status(201).json({output: resOutput})
  else if (resStatus === 202) 
    return res.status(202).json({output: resOutput, message: resMessage})
 
} catch (error) {
  return res.status(500).json({ message: "Internal Server Error", error: error.message });
}
});

module.exports = {
    getAllProblems,
    createNewProblem,
    submitProblem,
    showProblem,
    runProblem,
  
}


