const router = require('express').Router();

const authController = require('../controllers/auth')
const userController = require('../controllers/user')

router.post('/register',authController.register)
router.post('/login',authController.login)
router.patch('/clearNotifications',userController.clearNotifications)
router.patch('/:id',userController.updateUser)
router.delete('/:id',userController.deleteUser)
router.get('/',userController.getUser)
router.patch('/:id/follow',userController.followUser)
router.patch('/:id/unfollow',userController.unfollowUser)

module.exports=router;