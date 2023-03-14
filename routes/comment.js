const router = require('express').Router()
const commentController = require('../controllers/comment')
const authMiddleware =require('../middleware/authMiddleware')

router.post('/',commentController.addComment)
router.delete('/:id',authMiddleware,commentController.deleteComment)
router.patch('/:id',authMiddleware,commentController.updateComment)
router.patch('/:id/likedislike',commentController.likeDislikeComment)
router.get('/:postId',commentController.getCommentsByPostId)

module.exports =router