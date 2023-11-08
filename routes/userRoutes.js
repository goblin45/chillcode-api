const express = require('express');
const router = express.Router();
const userController =require ( '../controllers/userController')

router.route('/')
    .post(userController.createNewUser)
    .patch(userController.editProfile)
router.route('/login')
    .post(userController.getUser)
    .get(userController.autoLogin)

router.route('/googleauth')
    .post(userController.googleSignIn)

router.route('/solved')
    .post(userController.getSolvedProblems)

router.route('/tried')
    .post(userController.getTriedProblems)

module.exports = router