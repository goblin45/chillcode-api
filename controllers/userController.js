const User = require('../models/User')
const Problem = require('../models/Problem')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');

const SECRET_KEY = `fJI^,Luxabd*1^2wtYS5{{J0qFlH2^iQvm{EV:H-+heE0Cny"YfVj_~kK1H7sGY,S{BA@FQ,n]^zzy~?;:}WY2V&wqM63FSaVWsCBJS89jKoYxZ66rKN1qMEaV3pelFOnIwWCj3zYQ6E9GAaKq08`

// @desc get user
// @route POST /user/login
// @access Private
const getUser = asyncHandler(async(req,res)=>{
    const  { e_mail, password } = req.body

    if (!e_mail || !password) {
        return res.status(400).json({'message' : "All fields required."})
    }

    const user = await User.findOne({e_mail : e_mail})
    if (!user) {
        return res.status(400).json({'message' : "Incorrect e-mail or password."})
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
        return res.status(400).json({'message' : "Incorrect e-mail or password."})
    }

    const token = jwt.sign({userId: user._id}, SECRET_KEY, {expiresIn: '1m'})  
    res.cookie('jwt', token, { httpOnly: true, secure: false })
    return res.status(200).json({user, token})
})

const googleSignIn = asyncHandler(async(req, res) => {
    const { email, email_verified } = req.body

    if (!email_verified) {
        return res.status(400).json({message: 'Email verification failed.'})
    }
    if (!email) {
        return res.status(400).json({message: 'Email id not found.'})
    }

    const user = await User.findOne({ e_mail: email })
    if (user) {
        const token = jwt.sign({userId: user._id}, SECRET_KEY, {expiresIn: '1m'})  
        res.cookie('jwt', token, { httpOnly: true, secure: false })
        return res.status(200).json({user, token})
    } else {
        return res.status(400).json({message: 'Sign up is required for a new account.'})
    }
})

const autoLogin = asyncHandler(async(req, res) => {
    const token = req.cookies.jwt

    try {
        const decoded = jwt.verify(token, SECRET_KEY)
        const userId = decoded.userId

        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({ message: 'User not found.' })
        } else {
            return res.status(200).json({user})
        }
    } catch (error) {
        return res.status(400).json({ message: 'User not authorized.' })
    }
})

// @desc create user
// @route POST /user
// @access Private
const createNewUser = asyncHandler(async(req,res)=>{
    const { e_mail, password } = req.body

    if(!e_mail) {
        return res.status(400).json({ message : "E-mail cannot be blank."});
    }
    if (!password) {
        return res.status(400).json({ message : "Password cannot be blank."})
    }

    console.log(e_mail, password)

    const dup_user = await User.findOne({e_mail}).lean().exec()
    if(dup_user)
    {
        return res.status(400).json({ message : "This email already exists"});
    }
       
    const hashPwd = await bcrypt.hash(password, 10);
    const newUser = {
        e_mail, 
        username: e_mail, 
        password: hashPwd, 
        rating: 0, 
        streak: 0, 
        solvedProblems: {
            hard: 0,
            medium: 0,
            easy: 0,
            problems: []
        }
    }
    const user = await User.create(newUser)

    if(user) {  
        const token = jwt.sign({userId: user._id}, SECRET_KEY, {expiresIn: '1m'})  
        res.cookie('jwt', token, { httpOnly: true, secure: false })
        return res.status(200).json({message : "New User Created", user, token});
    } else {
        return res.status(400).json ({message : "Cannot create new user"});
    }
})
// @desc update user
// @route PATCH /user
// @access Private
const editProfile = asyncHandler(async(req,res)=>{
    const { _id, e_mail, username } = req.body
    // console.log("id",_id)
    // console.log("e-_mail",e_mail)
    // console.log("username",username)

    if(!_id || !e_mail || !username)
    {
        res.status(400).json({message : 'All fields are required'})
    }
    const user = await User.findOne({_id : _id}).exec()
    
    if(!user)
    {
        res.status(400).json({message : 'No user exists with this Id'})
    }

    user.username = username 
    user.e_mail = e_mail
    const updateUser = await user.save()

    if(updateUser)
    {
        res.status(200).json(updateUser)
    }
    else {
        res.status(400).json({message : "Some Error Occured to update the user"})
    }

})
//-----------------------------------Custom Functions---------------------------------
// @desc get solved problems
//@route POST /user/solved
//@access Private
const getSolvedProblems = asyncHandler(async(req,res)=>{
    const {_id} = req.body;
    if (!_id)
    {
        return res.status(400).json({message: "Id is required"})
    }

    const user = await User.findOne({_id:_id}).exec();

    const solvedProblems = []
    for (const problem of user.solvedProblems.problems) {
       
            const p_id = problem.problemId;
            const s_problem = await Problem.findOne({_id : p_id})
            solvedProblems.push(s_problem)
        
    }
    return res.status(200).json({solvedProblem :solvedProblems, user: user})
})
// @desc get tried problems
//@route POST /user/tried
//@access Private
const getTriedProblems = asyncHandler(async(req,res)=>{
    const { _id } = req.body;
    if ( !_id )
    {
        res.status(400).json({message:"Id is required"})
    }

    const user = await User.findOne({_id:_id}).exec();
    const triedProblems = []
    for ( const problem of user.problems )
  {
     if(problem.status === "Tried" )
     {
        const p_id = problem.problemId;
        const t_problem = await Problem.findOne({_id : p_id})
        triedProblems.push(t_problem)
     }
  }
    if (!triedProblems?.length)
    {
        res.status(201).json({message: "You haven't tried any problem"})
    }
    res.status(200).json(triedProblems)
})
//-----------------------------------------------------------------------------------------

module.exports = {
    createNewUser,
    getUser,
    autoLogin,
    googleSignIn,
    getSolvedProblems,
    getTriedProblems,
    editProfile
}