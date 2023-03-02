const router = require('express').Router();

const authController = require('../controllers/auth')
const userController = require('../controllers/user')

const authMiddleware = require('../middleware/authMiddleware')

router.post('/register',authController.register)
router.post('/login',authController.login)
router.patch('/clearNotifications',userController.clearNotifications)
router.patch('/:id',authMiddleware,userController.updateUser)
router.delete('/:id',authMiddleware,userController.deleteUser)
router.get('/',userController.getUser)
router.get('/allUsers',userController.getAllUsers)
router.patch('/:id/follow',userController.followUser)
router.patch('/:id/unfollow',userController.unfollowUser)

module.exports=router;