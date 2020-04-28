const router = require('express').Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')
const User = require('../../models/User')


//For registering a new user
//The second param is from express-validator
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please Include a valid email').isEmail(),
    check('password', 'Please enter a password of 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {name, email, password} = req.body

    try {
        //See if user exists
        let user = await User.findOne({email})
        if(user) {
            return res.status(400).send({
                errors: [ 
                    { 
                        msg: 'User already exists' 
                    } 
                ]
            })
        }

        //Get user's gravatar
        const avatar = gravatar.url(email, {
            s: '200', //size
            r: 'pg', //rating
            d: 'mm' //default
        })

        //Create an instance of User
        user = new User({
            name,
            email,
            avatar,
            password
        })

        //Encrypt password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)


        await user.save()

        //Return JWT. Why? Because in frontend when a user registers, I want them to be logged in straight away, hence why we need JWT

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 360000}, (err, token) => {
            if(err) throw err;
            res.send({
                token
            })
        })

    } catch(err) {
        console.log(err.message)
        res.status(500).send('Server error')
    }
})

module.exports = router