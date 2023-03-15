const Comment = require('../models/Comment')
const User = require('../models/User')
const Post = require('../models/Post')
const HttpError = require('../models/HttpError')


//***POST NEW COMMENT ON POST***
const addComment = async (req, res, next) => {
    const { text, userId, postId } = req.body
    let foundPost, postCreator, whoCommented
    if (text) {
        foundPost = await Post.findById(postId)
        postCreator = await User.findById(foundPost.creatorId)
        whoCommented = await User.findById(userId)
        const newComment = new Comment({ text: text, creatorId: userId, postId: postId })
        if (foundPost.creatorId !== userId) {
            await postCreator.updateOne({ $push: { notifications: `${whoCommented.username} commented " ${text} " on your post.` } })
        }
        try {
            newComment.save()
        } catch (err) {
            return next(new HttpError("Something went wrong!", 500))
        }
        res.status(201).json(newComment)
    } else {
        return next(new HttpError("Cannot post empty comment!", 400))
    }
}

//***DELETE COMMENT BY COMMENT ID***
const deleteComment = async (req, res, next) => {
    let foundComment;
    try {
        foundComment = await Comment.findById(req.params.id);
    } catch (err) {
        return next(new HttpError("Something went wrong!", 500))
    }
    if (!foundComment) {
        return next(new HttpError("Could not find comment", 404))
    }

    if (foundComment.creatorId === req.body.userId) {
        try {
            await Comment.findByIdAndDelete(foundComment._id)
        } catch (err) {
            return next(new HttpError("Something went wrong!", 500))
        }
        res.status(200).json("Comment has been deleted successfully!")
    } else {
        return next(new HttpError("You are not authorized to delete this comment!", 400))
    }
}

//***UPDATE COMMENT BY COMMENT ID ***
const updateComment = async (req, res, next) => {
    const { id } = req.params
    let foundComment
    try {
        foundComment = await Comment.findById(id)
    } catch (err) {
        return next(new HttpError("Something went wrong!", 500))
    }
    if (!foundComment) {
        return next(new HttpError("Could not find comment!", 404))
    }

    if (foundComment.creatorId === req.body.userId) {
        try {
            await foundComment.updateOne({ $set: req.body })
            res.status(200).json("Comment updated successfully!")
        } catch (err) {
            return next(new HttpError("Something went wrong!", 500))
        }
    } else {
        return next(new HttpError("You are not authorized to update this comment!", 400))
    }
}

//***LIKE/DISLIKE COMMENT BY COMMENT ID***
const likeDislikeComment = async (req, res, next) => {
    let foundComment, creator, userWhoLikedComment;
    try {
        foundComment = await Comment.findById(req.params.id)
        creator = await User.findById(foundComment.creatorId)
        userWhoLikedComment = await User.findById(req.body.userId)
    } catch (err) {
        return next(new HttpError("Something went wrong!", 500))
    }
    if (!foundComment) {
        return next(new HttpError("Could not find comment!", 404))
    }
    if (!foundComment.likes.includes(req.body.userId)) {
        await foundComment.updateOne({ $push: { likes: req.body.userId } })
        if (foundComment.creatorId !== req.body.userId) {
            await creator.updateOne({ $push: { notifications: `${userWhoLikedComment.username} has liked your comment.` } })
        }
        res.status(200).json("Comment liked successfully")
    } else {
        await foundComment.updateOne({ $pull: { likes: req.body.userId } })
        res.status(200).json("Comment disliked successfully")
    }
}
//***GET COMMENTS BY POSTID***
const getCommentsByPostId = async (req, res, next) => {
    let foundComments
    try {
        foundComments = await Comment.find({ postId: req.params.postId })
    } catch (err) {
        return next(new HttpError("Something went wrong!", 500))
    }
    if (!foundComments || foundComments.length === 0) {
        return next(new HttpError("No comments found on this page!", 404))
    }
    res.status(200).json(foundComments)
}

exports.addComment = addComment
exports.deleteComment = deleteComment
exports.updateComment = updateComment
exports.getCommentsByPostId = getCommentsByPostId
exports.likeDislikeComment = likeDislikeComment
