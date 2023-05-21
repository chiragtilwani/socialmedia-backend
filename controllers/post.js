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
    let foundPost
    // const { desc, url } = req.body
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
        if (imgId) {
            await cloudinary.uploader.destroy(imgId)
        }
        if (req.body.url && req.body.desc) {
            const imgResult = await cloudinary.uploader.upload(req.body.url, { folder: "socialMedia" })
            await foundPost.updateOne({
                $set: {
                    desc: req.body.desc, post: {
                        public_id: imgResult.public_id,
                        url: imgResult.secure_url
                    }
                }
            })
        }
        if (req.body.url) {
            const imgResult = await cloudinary.uploader.upload(req.body.url, { folder: "socialMedia" })
            await foundPost.updateOne({
                $set: {
                    post: {
                        public_id: imgResult.public_id,
                        url: imgResult.secure_url
                    }
                }
            })
        }
        if (req.body.desc) {
            await foundPost.updateOne({
                $set: {
                    desc: req.body.desc
                }
            })
        }
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
        if (imgId) {
            await cloudinary.uploader.destroy(imgId)
        }
        await Post.findByIdAndDelete(foundPost._id)
        res.status(200).json("Post has been deleted successfully")
    } else {
        return next(new HttpError("You are not authorized to delete this post", 400))
    }
}

const likeDislikePost = async (req, res, next) => {
    let foundPost, creator, whoLiked;
    try {
        foundPost = await Post.findById(req.params.id)
        creator = await User.findById(foundPost.creatorId)
        whoLiked = await User.findById(req.body.userId)
    } catch (err) {
        return next(new HttpError("Something went wrong!", 500))
    }
    if (!foundPost) {
        return next(new HttpError("Could not find post", 404))
    }

    if (!foundPost.likes.includes(req.body.userId)) {
        try {
            await foundPost.updateOne({ $push: { likes: req.body.userId } })
            if (req.body.userId !== foundPost.creatorId) {
                await creator.updateOne({ $push: { notifications: `${whoLiked.username} liked your your post.` } })
            }
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
        let totalTimeLinePosts = currentUserPost.concat(...friendsPost).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )

        const page = req.query.page || 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;//to learn if page=1 (1-1)*pageSize=0 i.e for page 1 we will skip 0 documents which is true
        const total = totalTimeLinePosts.length;
        const pages = Math.ceil(total / pageSize);
        console.log(pages)
        let timeLinePostsToRender = [];
        for (let i = skip; i <= (skip + pageSize) && totalTimeLinePosts[i]; i++) {
            timeLinePostsToRender = [...timeLinePostsToRender, totalTimeLinePosts[i]]
        }
        res.status(200).json({
            posts: timeLinePostsToRender, pages: pages
        })
    } catch (err) {
        return next(new HttpError("Something went wrong", 500))
    }
}

const getUserPost = async (req, res, next) => {
    try {
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