const express = require('express');
const router = express.Router();
const potdController = require('../controllers/potdController')

router.route('/')
    .get(potdController.getPotd)
router.route('/allproblemOfTheDay')
    .get(potdController.getAllPotd)
  
router.route('/showPotd')
    .post(potdController.showPotd)


module.exports = router