const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session')
const User = require('../models/user');
const Product =require('../models/product');
const { isLoggedIn } = require('../middleware/index');

const client = require('twilio')(process.env.VERIFY_ACCOUNTSID, process.env.VERIFY_AUTHTOKEN);

// GET Routes

// GET signup form
router.get('/register', (req, res) => {
    res.render('auth/register');
})

// GET login form
router.get('/login', (req, res) => {
    res.render('auth/login');
})

// Register route
router.post('/register', async(req, res, next) => {
    const { username, email, dateOfBirth, password } = req.body;
    const user = new User({ username, email, dateOfBirth });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
            if (err) return next(err)
            res.redirect('/products');
        })

})

// GET form to verify mobile number
router.get('/mobileverifyS1',isLoggedIn, async ( req, res ) => {
    const curUser = await User.findById(req.user._id);
    if(curUser.isSeller) res.redirect('/user/myProducts');
    else res.render('auth/mobileenter');
})

// GET form to enter code
router.get('/mobileverifyS2', isLoggedIn, (req, res) => {
    res.render('auth/codeenter');
})

// GET personal account details
router.get('/personaldetails',isLoggedIn, async (req, res) => {
    const curUser = await User.findById(req.user);
    res.render('auth/accountdetails', { curUser }); 
})

// GET purchase history
router.get('/purchasehistory', isLoggedIn, async (req, res) => {
    const curUser = req.user;
    const buyer = await User.findById(curUser._id).populate("boughtProducts");
    res.render('products/purchasedProducts', { buyer });
})

// GET list of products added by user(IFF SELLER)
router.get('/myProducts', isLoggedIn, async (req, res) => {
    const curUser = req.user;
    const seller = await User.findById(curUser._id).populate("createdProducts");
    if(!seller.isSeller) res.redirect('/user/mobileverifyS1');
    else res.render('products/createdProducts', { seller });
})

// logout route
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/user/login')
})

// POST Routes

// Login
router.post('/login', passport.authenticate('local', {
    faliureRedirect: '/user/login'
}), (req, res) => {
    // req.flash('success', 'Welcome!!!')
    const redirectUrl = req.session.returnTo || '/products'
    delete req.session.returnTo;
    res.redirect(redirectUrl);

})

// Mobile verification step 1
router.post('/mobileverifyS1', isLoggedIn, async (req, res) => {
    const phone = req.body.ccode + req.body.phone;

    const data = await client
        .verify
        .services(process.env.VERIFY_SERVICEID)
        .verifications
        .create({
            to: phone,
            channel: 'sms'
        })
     
    res.render('auth/codeenter', { phone });
})

// Mobile verification STEP 2
router.post('/mobileverifyS2',isLoggedIn, async (req, res) => {
    try {
        const phone = req.body.ccode + req.body.phone;
        const code = req.body.otp;
        const data = await client
            .verify
            .services(process.env.VERIFY_SERVICEID)
            .verificationChecks
            .create({
                to: phone,
                code: code
            })
        const curUser = req.user;
        const seller = await User.findById(curUser._id);
        seller.isSeller=true;
        seller.phone = phone;
        await seller.save();
        res.redirect('/user/myProducts');
    }
    catch(err) {
        console.log(err);
    }
})

module.exports = router
