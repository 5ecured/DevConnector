const router = require('express').Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcryptjs')
const User = require('../../models/User')

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password') //req.user.id is from the AUTH middleware because we did this: req.user = decoded.user
        res.send(user)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')
    }
})


//This is to authenticate user and get token
router.post('/', [
    check('email', 'Please Include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
        //See if user exists
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).send({
                errors: [
                    {
                        msg: 'Invalid credentials'
                    }
                ]
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).send({
                errors: [
                    {
                        msg: 'Invalid credentials'
                    }
                ]
            })
        }

        

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.send({
                token
            })
        })

    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')
    }
})

module.exports = router