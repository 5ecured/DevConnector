const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const Post = require('../../models/Post')

//CREATE A POST
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }


    try {        
        const user = await User.findById(req.user.id).select('-password')

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

        const post = await newPost.save()

        res.json(post)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error')
    }
})

//GET ALL POST
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find({}).sort({ date: -1 })
        res.json(posts)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error')
    }
})

//GET A POST BY ID
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json('Post not found')
        }
        res.json(post)
    } catch (error) {
        console.log(error.message)
        if (error.kind === 'ObjectId') {
            return res.status(404).json('Post not found')
        }
        res.status(500).send('Server error')
    }
})

//DELETE A POST
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json('Post not found')
        }

        //Make sure the user who can delete the post is the owner of that post
        if (String(post.user) !== req.user.id) {
            return res.status(401).json('User not authorized')
        }

        await post.remove()

        res.json('Post removed')
    } catch (error) {
        console.log(error.message)
        if (error.kind === 'ObjectId') {
            return res.status(404).json('Post not found')
        }
        res.status(500).send('Server error')
    }
})

//LIKE A POST
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
    
        //Check if the post has been liked (if length is greater than 0)
        const idMatch = post.likes.filter(item => String(item.user) === req.user.id).length > 0

        if (idMatch) {
            return res.status(400).json('Post already liked')
        }

        post.likes.unshift({ user: req.user.id })

        await post.save()

        res.json(post.likes)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error')
    }
})

//UNLIKE A POST
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        //Check if the post has been liked (if length is greater than 0)
        const idMatch = post.likes.filter(item => String(item.user) === req.user.id).length === 0

        if (idMatch) {
            return res.status(400).json('Post has not been liked')
        }

        //Get remove index
        const removeIndex = post.likes.map(el => String(el.user)).indexOf(req.user.id)

        post.likes.splice(removeIndex, 1)

        await post.save()

        res.json(post.likes)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error')
    }
})

//CREATE A COMMENT
router.post('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }


    try {
        const user = await User.findById(req.user.id).select('-password')
        const post = await Post.findById(req.params.id)

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }

        post.comments.unshift(newComment)

        await post.save()

        res.json(post.comments)
    } catch (error) {
        console.log(error.message)
        res.status(500).json('Server error')
    }
})

//DELETE A COMMENT
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        //Get the comment from the post
        const comment = post.comments.find(comment => comment.id === req.params.comment_id)

        if (!comment) {
            return res.status(400).json('Comment does not exist')
        }

        //Make sure the user deleting the comment is the one who created it
        if (req.user.id !== String(comment.user)) {
            return res.status(400).json('User not authorized')
        }

        //Get remove index
        const removeIndex = post.comments.map(el => String(el.user)).indexOf(req.user.id)

        post.comments.splice(removeIndex, 1)

        await post.save()

        res.json(post.comments)
        
    } catch (error) {
        console.log(error.message)
        res.status(500).json('Server error')
    }
})

module.exports = router