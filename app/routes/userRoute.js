const express= require('express');
const userController= require('../controllers/userController');
const userAuth= require('../middlewares/authenticateToken');
const signInLimiter= require('../middlewares/rateLimiter')
const router= express.Router();

router.post('/signup', userController.signup);
router.post('/signin', signInLimiter, userController.signin);
router.post('/signout', userController.signout)
router.get('/confirm/:token',userAuth, userController.confirmEmail);
router.post('/password',userAuth, userController.forgotPassword);
router.get('/reset-password/:token',userAuth, userController.resetPassword)

module.exports=router;
