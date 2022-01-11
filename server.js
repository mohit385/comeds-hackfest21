const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express        = require('express');
const mongoose       = require('mongoose');
const path           = require('path');
const bodyParser     = require('body-parser');
const methodOverride = require('method-override');
const passport       = require('passport');
const flash          = require('connect-flash');
const LocalStrategy  = require('passport-local');
const twilio         = require('twilio');
const multer         = require('multer');
const compression    = require('compression');
const helmet         = require('helmet');
const mongoSanitize  = require('express-mongo-sanitize');
const User           = require('./models/user');
const Product        = require('./models/product'); 
const app            = express();

const productRoutes = require('./routes/products')
const authRoutes    = require('./routes/auth');

// Database Config
mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`MongoDB Connected`)
    })
    .catch(err => {
        console.log(`Database Error!!!`);
        console.log(err);
    })

const accountSid = process.env.TWILIO_ACCOUNTSID;
const authToken = process.env.TWILIO_AUTHTOKEN;
const client = require('twilio')(accountSid, authToken);

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//parse application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(helmet({contentSecurityPolicy: false}));
app.use(mongoSanitize());
app.use(methodOverride('_method'));
app.use(flash());

app.use(require('express-session')({
    name: "session",
    secret: "thiscouldabettersecret",
    resave: true,
    saveUninitialized: false,
    cookie: {
        //secure: true,
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', async (req, res) => {
    const foundProducts = await Product.find({ qtyAvl: { $gt: 0 } });
    res.render('products/index', { foundProducts })
})

app.use('/user', authRoutes);
app.use('/products', productRoutes);

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});