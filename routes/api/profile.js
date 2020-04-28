const router = require('express').Router()
const request = require('request')
const config = require('config')
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const Post = require('../../models/Post')

//GET OWN PROFILE
router.get('/me', auth, async (req, res) => {
    try {
        //below: remember that USER is from the schema, it will be an id. and the REQ.USER.ID is from the AUTH middleware
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])

        if (!profile) {
            res.status(400).send({ message: 'There is no profile for this user' })
        }

        res.send(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')
    }
})

//CREATING AND UPDATING PROFILE
//We have 2 middlewares. The AUTH and the VALIDATOR. so put them in an array
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() })
    }

    const { company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin } = req.body

    //Build profile object
    const profileFields = {}

    profileFields.user = req.user.id
    if (company) profileFields.company = company
    if (website) profileFields.website = website
    if (location) profileFields.location = location
    if (bio) profileFields.bio = bio
    if (status) profileFields.status = status
    if (githubusername) profileFields.githubusername = githubusername
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }

    //Build social object
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube
    if (twitter) profileFields.social.twitter = twitter
    if (facebook) profileFields.social.facebook = facebook
    if (instagram) profileFields.social.instagram = instagram
    if (linkedin) profileFields.social.linkedin = linkedin

    try {
        let profile = await Profile.findOne({ user: req.user.id })
        if (profile) {
            //update profile
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
            return res.send(profile)
        }


        //if profile is not found, then we create it
        profile = new Profile(profileFields)
        await profile.save()
        res.send(profile)

    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')
    }
})

//GET ALL PROFILES
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find({}).populate('user', ['name', 'avatar'])
        res.send(profiles)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error')
    }
})

//GET PROFILE BY USER ID
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])

        if (!profile) return res.status(400).send({ message: 'Profile not found' })

        res.send(profile)
    } catch (error) {
        console.log(error.message)
        if (error.kind === 'ObjectId') {
            return res.status(400).send({ message: 'Profile not found' })
        }
        res.status(500).send('Server error')
    }
})

//DELETE A PROFILE, USER AND POSTS
router.delete('/', auth, async (req, res) => {
    try {
        await Post.deleteMany({ user: req.user.id })
        await Profile.findOneAndRemove({ user: req.user.id })
        await User.findOneAndRemove({ _id: req.user.id })
        res.send({ message: 'User deleted' })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error')
    }
})

//ADD PROFILE EXPERIENCE
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array })
    }

    const { title, company, location, from, to, current, description } = req.body

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id })
        profile.experience.unshift(newExp)
        await profile.save()
        res.send(profile)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error')
    }
})

//DELETE PROFILE EXPERIENCE
router.delete('/exp/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        //get remove index for deleting which experience
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

        profile.experience.splice(removeIndex, 1)
        await profile.save()
        res.send(profile)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error')
    }
})



//ADD PROFILE EDUCATION
router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array })
    }

    const { school, degree, fieldofstudy, from, to, current, description } = req.body

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id })
        profile.education.unshift(newEdu)
        await profile.save()
        res.send(profile)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error')
    }
})

//DELETE PROFILE EDUCATION
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        //get remove index for deleting which education
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)

        profile.education.splice(removeIndex, 1)
        await profile.save()
        res.send(profile)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error')
    }
})


//GET USER REPOS FROM GITHUB
router.get('/github/:username', async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        }

        request(options, (err, response, body) => {
            if (err) console.log(err)
            if (response.statusCode !== 200) {
                return res.status(404).send({ message: 'No github profile found' })
            }
            res.json(JSON.parse(body))
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error')
    }
})


module.exports = router