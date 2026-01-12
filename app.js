const express = require('express')
const cors = require('cors')
const userRouter = require('./routes/userRouter')
const connectDB = require('./config/db')

const app = express()
const PORT = 8000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

connectDB();

app.get('/',(req,res) => {
    res.status(200).json({message:'Server runnig on port 8000'})
})

app.use('/user',userRouter)

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
})