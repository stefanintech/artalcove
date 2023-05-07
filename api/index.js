/* eslint-env node */
import * as dotenv from 'dotenv'
dotenv.config({path: '../api/.env'})
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from './models/User.js'
import cookieParser from 'cookie-parser'

const app = express()

const bcryptSalt = bcrypt.genSaltSync(10)
const jwtSecret = 'fa324j24j32rjj24j24j24j'

app.use(express.json())
app.use(cookieParser())

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
            jwt.sign({
                email:userDoc.email, 
                id:userDoc._id
            },  
                jwtSecret, {}, (err,token) => {
                if (err) throw err;
                res.cookie('token', token).json(userDoc);    
            });
        } else {
            res.status(422).json('pass not ok')
        }
    } else {
        res.json('not found')
    }
})

app.get('/profile', (req,res) => {
    const {token} = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const {name, email, _id} = await User.findById(userData.id)

            res.json({name, email, _id});
        })
    } else {
        res.json(null);
    }
    
})

app.post('/logout', (req,res) => {
    res.cookie('token', '').json(true);
})

app.listen(4000)