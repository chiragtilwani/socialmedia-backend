const Post = require('../models/Post')
const User = require('../models/User')
const HttpError = require('../models/HttpError')
const cloudinary = require('../middleware/cloudinary')

const createPost = async (req, res, next) => {
    const { creatorId, desc, post } = req.body
    let result;
    if (!post && !desc) {
        return next(new HttpError("Cannot upload empty post!", 500))
    }
    if (post !== null) {
        try {
            result = await cloudinary.uploader.upload(post, { folder: "socialMedia" })
        } catch (err) {
            console.log(err)
            return next(new HttpError("Could not upload your post", 500))
        }
        const newPost = new Post({
            creatorId,
            desc,
            post: {
                public_id: result.public_id,
                url: result.secure_url
            }
        })
        try {
            const savedPost = await newPost.save()
            res.status(201).json(savedPost)
        } catch (err) {
            return next(new HttpError("Something went wrong!", 500))
        }
    } else {
        const newPost = new Post({
            creatorId,
            desc,
        })
        try {
            const savedPost = await newPost.save()
            res.status(201).json(savedPost)
        } catch (err) {
            return next(new HttpError("Something went wrong!", 500))
        }
    }
}

const updatePost = async (req, res, next) => {
    let post
    try {
        post = await Post.findById(req.params.id)
    } catch (err) {
        return next(new HttpError("Something went wrong!", 500))
    }

    if (!post) {
        return next(new HttpError("Could not find post", 404))
    }
    if (post.creatorId === req.body.userId) {
        await post.updateOne({ $set: req.body })
        res.status(200).json("Post successfully updated")
    } else {
        return next(new HttpError("You are not authorized to update this post", 400))
    }
}

const deletePost = async (req, res, next) => {
    let foundPost
    try {
        foundPost = await Post.findById(req.params.id)
    } catch (err) {
        return next(new HttpError("Something went wrong!", 500))
    }
    if (!foundPost) {
        return next(new HttpError("Could not find post", 404))
    }
    if (foundPost.creatorId === req.body.userId) {
        const imgId = foundPost.post.public_id
        await cloudinary.uploader.destroy(imgId)
        await Post.findByIdAndDelete(foundPost._id)
        res.status(200).json("Post has been deleted successfully")
    } else {
        return next(new HttpError("You are not authorized to delete this post", 400))
    }
}

const likeDislikePost = async (req, res, next) => {
    let foundPost,creator,whoLiked;
    try {
        foundPost = await Post.findById(req.params.id)
        creator=await User.findById(foundPost.creatorId)
        whoLiked=await User.findById(req.body.userId)
    } catch (err) {
        return next(new HttpError("Something went wrong!", 500))
    }
    if (!foundPost) {
        return next(new HttpError("Could not find post", 404))
    }

    if (!foundPost.likes.includes(req.body.userId)) {
        try {
            await foundPost.updateOne({ $push: { likes: req.body.userId } })
            await creator.updateOne({$push:{notifications:`${whoLiked.username} liked your your post.`}})
            res.status(200).json("Post has been liked successfully")
        } catch (err) {
            return next(new HttpError("Something went wrong", 500))
        }
    } else {
        try {
            await foundPost.updateOne({ $pull: { likes: req.body.userId } })
            res.status(200).json("Post has been unliked successfully")
        } catch (err) {
            return next(new HttpError("Something went wrong", 500))
        }
    }
}

const getPostById = async (req, res, next) => {
    let foundPost;
    try {
        foundPost = await Post.findById(req.params.id)
    } catch (err) {
        return next(new HttpError("Something went wrong!", 500))
    }
    if (!foundPost) {
        return next(new HttpError("Could not find post", 404))
    }
    res.status(200).json(foundPost)
}

const getTimlinePost = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.params.userId)
        const currentUserPost = await Post.find({ creatorId: currentUser._id })
        const friendsPost = await Promise.all(
            currentUser.followings.map(id => Post.find({ creatorId: id }))
        )
        res.status(200).json(currentUserPost.concat(...friendsPost))
    } catch (err) {
        return next(new HttpError("Something went wrong", 500))
    }
}

const getUserPost = async (req, res, next) => {
    try {
        // const currentUser=await User.findById(req.params.userId)
        const currentUserPost = await Post.find({ creatorId: req.params.userId })
        res.status(200).json(currentUserPost)
    } catch (err) {
        return next(new HttpError("Something went wrong", 500))
    }
}

exports.createPost = createPost
exports.updatePost = updatePost
exports.deletePost = deletePost
exports.likeDislikePost = likeDislikePost
exports.getPostById = getPostById
exports.getTimlinePost = getTimlinePost
exports.getUserPost = getUserPost