import express from 'express';
import { UserModel } from '../DAO/mongo/models/users.models';
//import {UserService}from '../services/user.service.js';

export const authRouter = express.Router();

authRouter.get('/login', (req,res) =>{
    return res.render('login', {})
})
authRouter.post('/login', async (req,res) =>{
    const {email, pass} = req.body
    const userFind = await UserModel.findOne({email: email})
    if (userFind && userFind.pass == pass){
        req.session.email = userFind.email;
        req.session.isAdmin = userFind.isAdmin;
        return res.send('logueado!')
    } else{
        return res.status(401).render('error', {error : 'email o pass incorrecto'})
    }
})
authRouter.get('/register', (req,res) =>{
    return res.render('register', {})
})

