const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController')

router.route('/')
    .get(problemController.getAllProblems)
    .post(problemController.createNewProblem)
router.route('/submit')
    .post(problemController.submitProblem)
router.route('/show')
    .post(problemController.showProblem)
router.route('/run')
    .post(problemController.runProblem)



module.exports = router

