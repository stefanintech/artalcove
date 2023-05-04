/* eslint-env node */
import * as dotenv from 'dotenv'
dotenv.config({path: '../api/.env'})
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User.js'

const app = express()

const bcryptSalt = bcrypt.genSaltSync(10)

app.use(express.json())

app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}))

console.log(process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI)


app.get('/test', (req,res) => {
    res.json('test ok')
});

app.post('/register', async (req,res) => {
    const {name,email,password} = req.body;

    try {
        const userDoc = await User.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
    } catch (error) {
        res.status(422).json(error);
    }
    
})

app.post('/login', async (req,res) => {
    const {email,password} = req.body;
    const userDoc = await User.findOne({email:email});
    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password)
        if (passOk){
            res.json('pass ok')
        } else {
            res.status(422).json('pass not ok')
        }
    } else {
        res.json('not found')
    }
})

app.listen(4000)