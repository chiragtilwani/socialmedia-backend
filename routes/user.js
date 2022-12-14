const router = require('express').Router();

const authController = require('../controllers/auth')
const userController = require('../controllers/user')

router.post('/register',authController.register)
router.post('/login',authController.login)
router.patch('/:id',userController.updateUser)
router.delete('/:id',userController.deleteUser)
router.get('/:id',userController.getUserById)
router.patch('/:id/follow',userController.followUser)
router.patch('/:id/unfollow',userController.unfollowUser)

module.exports=router;