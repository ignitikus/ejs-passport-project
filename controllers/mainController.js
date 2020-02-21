const express = require('express');
const router = express.Router()
const User = require('../models/Users')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const axios = require('axios')
const { validationResult } = require('express-validator')

module.exports = {
   home: (req, res, next)=>{
      if(req.isAuthenticated()){
            return res.render('main/options')
      }
      return res.render('main/index', { errors: 'Please input email and password',title: 'Sign in/ Sign Up' });
   },

   authOptions: (req,res) => {
      if(req.isAuthenticated()){
         return res.render('main/options')
      }
      return res.render('main/403')
   },

   userRegister: (req,res) => {
      const errors = validationResult(req)
      if(!errors.isEmpty()){
         console.log(errors)
         return res.render('main/index', {errors: 'All inputs must be filled', title: 'Register' })
      }
      User.findOne({email:req.body.email})
      .then(user => {
         if(user){
            return res.render('main/index', {errors: 'This email already registered', title: 'Register'})
         }else{
            const user = new User();
            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(req.body.password, salt)
            
            user.name = req.body.name
            user.email = req.body.email
            user.password = hash

            user.save().then(user =>{
               return req.login(user, (err) => {
                  if(err) {
                     return res.status(500).json({message: 'Server Error'})
                  }else {
                     return res.redirect('/auth/options/')
                  }
               })
            }).catch(err => console.log(err))
         }
      })
   },

   randomRender: async(req,res) => {
      const url = 'https://randomuser.me/api/?results=30'
         if(req.isAuthenticated()){
            try{
               const response = await axios.get(url)
               const data = response.data.results.sort((a,b)=>(a.name.first > b.name.first) ? 1 : ((b.name.first > a.name.first) ? -1 : 0))
               return res.render('main/random', {data})
            }catch(error){
               console.error(error);
            }
         }
      return res.render('main/403')
   },

   moviesRender: async(req,res) => {
      const url = 'https://api.themoviedb.org/3/movie/now_playing?api_key='
      const key = process.env.API_KEY
      const nowPlaying = '&language=en-US&page=1'
         if(req.isAuthenticated()){
            try{
               const response = await axios.get(url+key+nowPlaying)
               const data = response.data.results
               return res.render('main/movies', {data})
            }catch(error){
               console.error(error);
            }
         }
      return res.render('main/403')
   },

   logout: (req,res) => {
      if(req.user === undefined){
         req.flash('successMessage', 'No one to log out')
         return res.redirect('/')
      }
      req.logout()
      req.flash('successMessage', 'You are now logged out.')
      return res.redirect('/')
   }
}