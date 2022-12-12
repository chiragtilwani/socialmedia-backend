const router = require('express').Router()
const commentController = require('../controllers/comment')

router.post('/',commentController.addComment)
router.delete('/:id',commentController.deleteComment)
router.patch('/:id',commentController.updateComment)
router.get('/:postId',commentController.getCommentsByPostId)

module.exports =router