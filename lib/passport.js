const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/Users')
const bcrypt = require('bcryptjs')

passport.serializeUser((user, done) => {
   console.log(user)
   return done(null, user)
})

passport.deserializeUser((id,done) => {
   User.findById(id, (err, user) => {
      return done(err, user)
   })
})

passport.use('local-login', new LocalStrategy({
   usernameField:'email',
   passwordField:'password',
   passReqToCallback: true
}, (req, email, password, done) => {
   User.findOne({email:req.body.email}, (err, user) => {
      console.log(user)
      if(err) {
         return done(err, null)
      }
      if(!user){
         return done(null, false, req.flash('errorMessage', 'User Not Found'))
      } 
      bcrypt.compare(password, user.password).then(result => {
         if(!result){
            return done(null, false, req.flash('errorMessage', 'Check email or password'))
         }else {
            return done(null, user)
         }
      }).catch((err) => {
         throw err
      })
   })
}))

exports.isAuthenticated = (req, res, next) => {
   if(req.isAuthenticated){
      return next()
   }
   return res.redirect('/')
}