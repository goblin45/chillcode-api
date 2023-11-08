require ('dotenv').config()
const express = require('express');
const app = express();
const cors  = require('cors')
const path = require ("path")
const corsOptions = require('./config/corsOptions')
const mongoose = require('mongoose')
const connectDB = require('./config/dbConn')
const PORT = process.env.PORT || 3500

connectDB()

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors(corsOptions))
app.use('/problem', require('./routes/problemRoutes'))
app.use('/user', require('./routes/userRoutes'))
app.use('/problemOfTheDay',require('./routes/problemOfTheDayRoutes'))

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB')
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
  console.log(err)
})