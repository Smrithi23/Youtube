const express = require('express')
const path = require('path')
const User = require('../models/user')
const Favourite = require('../models/favourite')
const Watched = require('../models/watched')
const Wanttowatch = require('../models/wantTowatch')
const auth = require('../middleware/auth')
const hbs = require('hbs')
const Cookies = require('cookies')
// For the router to decode the body of the post request - urlencoded()

const router = new express.Router()
router.use(express.urlencoded())

router.get('', async (req, res) => {
    res.status(200).render('index')
})

// Register
router.post('/register', async (req, res) => {

    try {
        console.log(req.body)
        const user = new User(req.body)
        console.log(user)
        await user.save()
        console.log('hi')
        const token = await user.generateAuthToken()
        var cookies = new Cookies(req, res)
        cookies.set('token', token)
        res.status(200).redirect('/users')
    } catch (e) {
        var register = " "
        var email = " "
        var password = " "
        if(e.code === 11000)
        {
            register = "Already Registered"
        }
        else{
        if(e.errors.password)
        {
            password = "Password must contain atleast 7 characters"
        }
        if(e.errors.email)
        {
            email = "Email is invalid"
        }
        }
        res.status(400).render('index', { register, email, password })
    }
})
//Login
router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        var cookies = new Cookies(req, res)
        cookies.set('token', token)
        res.status(200).redirect('/users')
    } catch (e) {
        const loginerror = "Incorrect email or password"
        res.status(400).render('index', { loginerror })
    }
})
//Logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.render('index')
    } catch (e) {
        res.status(500).send(e)
    }
})
//Logout All
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.render('index')

    } catch (e) {
        res.status(500).send(e)
    }
})

//Back to Dashboard
router.get('/users', auth, async (req, res) => {
    try {
        const user = req.user
        res.render('home', { user })
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/me', auth, async (req, res) => {
    try {
        const user = req.user
        res.render('changeProfile', { user })
    } catch (e) {
        res.status(500).send(e)
    }
})

//Updating User Profile
router.post('/users/me', auth, async (req, res) => {

    try {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['name', 'password']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid Operation' })
        }
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        const user = req.user
        res.render('changeProfile', { user })
    } catch (e) {
        const user = req.user
        const error = "Password must contain atleast 7 characters"
        res.status(400).render('changeProfile', { error, user })

    }
})

router.post('/view', auth, async(req, res) => {
    const user =req.user
    const title = req.body.videoTitle
    const des = req.body.videoDes
    const videoId = req.body.videoId
    res.status(200).render('view', {user, title, des, videoId})
})

router.post('/favourite', auth, async(req, res) => {
    const favourite = new Favourite(req.user.favourite ? req.user.favourite : {})
    favourite.add(req.body, req.body.videoId)
    req.user.favourite = favourite
    await req.user.save()
    res.status(200).redirect('/users')
})

router.get('/favourite', auth, async (req, res) => {
    if(!req.user.favourite) {
        return res.render('favourite', {favourite: null})
    }
    var favourite = new Favourite(req.user.favourite)
    res.status(200).render('favourite', {favourite: favourite.generateArray(), totalQty: favourite.totalQty})
})

router.post('/watched', auth, async(req, res) => {
    const watched = new Watched(req.user.watched ? req.user.watched : {})
    watched.add(req.body, req.body.videoId)
    req.user.watched = watched
    await req.user.save()
    res.status(200).redirect('/users')
})

router.get('/watched', auth, async (req, res) => {
    if(!req.user.watched) {
        return res.render('watched', {watched: null})
    }
    var watched = new Watched(req.user.watched)
    res.status(200).render('watched', {watched: watched.generateArray(), totalQty: watched.totalQty})
})

router.post('/wantTowatch', auth, async(req, res) => {
    const wantTowatch = new Wanttowatch(req.user.wantTowatch ? req.user.wantTowatch : {})
    wantTowatch.add(req.body, req.body.videoId)
    req.user.wantTowatch = wantTowatch
    await req.user.save()
    res.status(200).redirect('/users')
})

router.get('/wantTowatch', auth, async (req, res) => {
    if(!req.user.wantTowatch) {
        return res.render('wantTowatch', {wantTowatch: null})
    }
    var wantTowatch = new Wanttowatch(req.user.wantTowatch)
    res.status(200).render('wantTowatch', {wantTowatch: wantTowatch.generateArray(), totalQty: wantTowatch.totalQty})
})

module.exports = router