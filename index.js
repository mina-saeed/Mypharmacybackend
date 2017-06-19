const config = require('./config.json')
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var bodyParser = require("body-parser");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mypharmacy";
const basicAuth = require('./basicAuth.js')

var app = express()

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(passport.initialize());

var staticUserAuth = basicAuth({
    users: {
        'admin': '123456'
    },
    challenge: true
})
    
passport.use(new Strategy({
        clientID: config.AppId,
        clientSecret: config.AppSecret,
        callbackURL: config.callback,
        enableProof: true,
        profileFields: ['id', 'displayName', 'link','gender',  'photos', 'emails']
        },
        function(accessToken, refreshToken, profile, cb) {
                var email = "";
                var user ="";
                        if(profile.emails){
                                email = profile.emails[0].value
                        }

                MongoClient.connect(url, function(err, db) {

                        if (err) throw err;
                                var user = { 
                                        fb_id: profile.id,
                                        email: email,
                                        username: profile.displayName,
                                        gender: profile.gender,
                                        link: profile.link,
                                        access_token: accessToken

                                 };
                                 db.collection('users').find({fb_id: profile.id}).toArray(function(err, result){
                                                if (err)
                                                        return cb(err);
                                                if(result){
                                                        return cb(null, user); // user found, return that user
                                                }
                                                else{
                                                db.collection("users").insertOne(user, function(err, res) {
                                                        if (err){
                                                        }else{
                                                              //  console.log(res)
                                                                console.log("1 record inserted");
                                                                
                                                        }
                                
                                                        db.close();
                                                        return cb(null, user);
                                                });
                                        }


                                })

                });
        }));

app.get('/login/facebook', passport.authenticate('facebook' , {scope:'email'}));
app.get('/login', passport.authenticate('facebook' , {scope:'email'}));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect : '/userHome',failureRedirect: '/login' }),function(req, res) {console.log("res") });

app.get('/userHome', function(req,res){
res.redirect('/userHome')
})



/******************************* Start Of Guest Login Endpoint ****************************************************/
app.post('/guest/login', staticUserAuth, function(req, res) {
   // console.log(req)
    var guest_name=req.body.name
    var guest_mobile=req.body.mobile
    var guest_address=req.body.address
    var guest_device_id=req.body.deviceID
MongoClient.connect(url, function(err, db) {    
    db.collection('guest').find({mobile: guest_mobile}).toArray(function(err, result){

        if(err){
            res.send("Error")
        }
        if(result){
            //console.log(result)
            res.redirect('/userHome')
        }
        if(result==null){
            var guest={
                name: guest_name,
                mobile: guest_mobile,
                address: guest_address,
                deviceID: guest_device_id

            }
            db.collection('guest').insertOne(guest , function(err, output){

                if(err){
                    console.log("error")
                }else{

                    console.log("Guest has been added")
                    res.redirect('/userHome')
                }
            })
        }
    })
                        
   });   
})
/*******************************************End Of Guest Login Endpoint ***************************/



app.listen(3000, function() {
    console.log("Listening!")
})

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
})