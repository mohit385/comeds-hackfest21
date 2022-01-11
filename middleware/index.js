const User = require("../models/user");
const Product = require("../models/product");

const middlewareObj= {};

middlewareObj.isuserAlsoSeller = function(req, res, next) {
    if(req.isAuthenticated()) {
        User.findById(req.user._id, function(err, foundUser) {
            if(err) {
                console.log(err);
                res.redirect("back");
            }
            else {
                if(foundUser.isSeller) next();
                else {
                    console.log("You are not permitted to add a product");
                    res.redirect("back");
                }
            }
        })
    }
    else {
        console.log(`You're not logged in!!!`);
        res.redirect("back");
    }
}

middlewareObj.checkproductOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        User.findById(req.user._id, function(err, curUser) {
            if(err) {
                console.log(err);
                res.redirect("back");
            } 
            else {
                if(curUser.isSeller) {
                    Product.findById(req.params.id, function(err, foundProd) {
                        if(err) {
                            console.log(err);
                            res.redirect("back");
                        }
                        else {
                            if(foundProd.owner.id.equals(req.user._id)) {
                                next();
                            }
                            else {
                                console.log(`You are not permitted to modify product!!!`);
                                res.redirect("back");
                            }
                        }
                    })
                }else {
                    console.log(`You don't have permission to do that!`);
                    res.redirect("back");
                }
            }
        })
    } else {
        console.log(`You're not logged in!`);
        res.redirect("back");
    }
}

middlewareObj.isbuyerNotSeller = function(req, res, next) {
    if(req.isAuthenticated()) {
        Product.findById(req.params.id, function(err, foundProd) {
            if(err) {
                console.log(err);
                res.redirect("back");
            } else {
                if(foundProd.owner.id.equals(req.user._id)) {
                    console.log(`You can't buy your own product!`);
                    res.redirect("back");
                } else {
                    next();
                }
            }
        })
    }
    else {
        console.log(`You're not logged in!`);
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next) {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/user/login')
    }
    next();
}

module.exports = middlewareObj