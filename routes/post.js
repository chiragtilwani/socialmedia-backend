const router = require('express').Router()

const postController = require('../controllers/post')

const authMiddleware = require('../middleware/authMiddleware')

router.post('/', postController.createPost)
router.patch('/:id', authMiddleware, postController.updatePost)
router.delete('/:id', authMiddleware, postController.deletePost)
router.patch('/:id/likedislike', postController.likeDislikePost)
router.get('/timeline/:userId', postController.getTimlinePost)//NOTE:THIS ROUTE SHOULD BE ABOVE getPostById ELSE IT WILL CONFLICT WITH getPostById AND CONSIDER /timeline AS /:id BCZ BOTH ARE GET REQUESTS
router.get('/user/:userId', postController.getUserPost)//by userId
router.get('/:id', postController.getPostById)//by postId

module.exports = router