const express = require('express');
const router = express.Router();
const passport = require('passport')
const { check } = require('express-validator')

const{
  home,
  profile,
  updateProfile,
  authOptions,
  userRegister,
  randomRender,
  moviesRender,
  logout
} = require('../controllers/mainController')


router.get('/', home);
router.get('/auth/profile', profile)
router.get('/auth/options', authOptions)
router.get('/auth/random', randomRender)
router.get('/auth/movies', moviesRender)
router.get('/logout', logout)

router.post('/api/users/login', passport.authenticate('local-login', {
  successRedirect: '/auth/options',
  failureRedirect: '/',
  failureFlash: true
}))

router.post('/api/users/register',
  [
  check('name', 'Name is required').not().isEmpty(), 
  check('email', 'Please include valid email').isEmail(),
  check('password', 'Please include valid password').isLength({min:3})
  ], userRegister
)

router.post('/auth/profile/update', updateProfile)

module.exports = router;
