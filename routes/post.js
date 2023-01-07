const router=require('express').Router()

const postController = require('../controllers/post')

router.post('/',postController.createPost)
router.patch('/:id',postController.updatePost)
router.delete('/:id',postController.deletePost)
router.patch('/:id/likedislike',postController.likeDislikePost)
router.get('/timeline/:userId',postController.getTimlinePost)//NOTE:THIS ROUTE SHOULD BE ABOVE getPostById ELSE IT WILL CONFLICT WITH getPostById AND CONSIDER /timeline AS /:id BCZ BOTH ARE GET REQUESTS
router.get('/:id/',postController.getPostById)


module.exports=router