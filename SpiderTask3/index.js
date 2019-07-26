const express = require('express')
const userRouter = require('./Routers/user.js')
const session = require('express-session')

const path = require('path')  // core npm module
const hbs = require('hbs')

//Define paths for Express config
const viewsPath = path.join(__dirname, './templates/views')
const partialsPath = path.join(__dirname, './templates/partials')
const publicDirectoryPath = path.join(__dirname, './public')

const app = express()
const port = 3000

//Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
app.use(express.static(publicDirectoryPath))
app.use('/pics',express.static('pics'))
app.use(session({secret: 'mysupersecret', resave: false, saveUnitialised: false}))
hbs.registerPartials(partialsPath)

require('./db/mongoose.js')


app.get('', (req, res) => {
    res.render('index')
})

app.use(express.json())
app.use(userRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)

})