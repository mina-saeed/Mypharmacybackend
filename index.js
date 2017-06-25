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
                                                if(result.length>0){
                                                        return cb(null, user); // user found, return that user
                                                }
                                                else{
                                                db.collection("users").insertOne(user, function(err, res) {
                                                        if (err){
                                                        }else{
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
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect : '/userHome',failureRedirect: '/login' }),function(req, res) { });

app.get('/userHome/:deviceID', function(req,res){

    var user_device_id = req.params.deviceID
    console.log(user_device_id)
        MongoClient.connect(url, function(err, db) {

            db.collection('users').find({deviceID: user_device_id , mobile:{$ne:null}, location:{$ne:null} }).toArray(function(err, result){
                    
                    if(err){
                            res.send("Error")
                    }
                    if(result.length >0){
                            
                        //res.redirect('/order')
                        res.status(200).send(result)
                    }
            })
    });

})

app.post('/user/submit',staticUserAuth, function(req,res){
    console.log(req.body)
    var user_mobile=req.body.mobile
    var user_telephone=req.body.telephone
    var user_device_id=req.body.deviceID
    var user_location = req.body.location

        MongoClient.connect(url, function(err, db) {
        db.collection('users').update(
                {deviceID: user_device_id},
                {$set:
                        {
                            mobile: user_mobile,
                            telephone: user_telephone,
                            deviceID: user_device_id,
                            location:  user_location 
                        },

                        
                },
                {
                    upsert:true
                },
                function(err, result){

                        if(err) {throw err}
                        else{

                            db.collection('users').find({deviceID: user_device_id }).toArray(function(err, result){
                    
                                if(err){
                                    res.send("Error")
                                }
                                if(result.length >0){
                            
                                    res.status(200).send(result)
                                }
                            })
                        }        
                }
        )
                        
   });   

})
app.post('/user/editLocation',staticUserAuth, function(req,res){

    var user_device_id=req.body.deviceID
    var user_location = req.body.location

    MongoClient.connect(url, function(err, db) {
        db.collection('users').update(
                {deviceID: user_device_id},
                {$set:
                        {
                            location:  user_location 
                        },       
                },
                function(err, result){

                        if(err) {throw err}
                        else{

                            res.status(200)
                        }        
                }
        )
                        
   });   

})
/*app.post('/user/uploadImage',staticUserAuth, function(req,res){

    var user_device_id=req.body.deviceID
    var user_location = req.body.location

    MongoClient.connect(url, function(err, db) {
        db.collection('users').update(
                {deviceID: user_device_id},
                {$set:
                        {
                            location:  user_location 
                        },       
                }
                function(err, result){

                        if(err) {throw err}
                        else{

                            db.collection('users').find({deviceID: user_device_id }).toArray(function(err, result){
                    
                                if(err){
                                    res.send("Error")
                                  }
                                if(result.length >0){
                            
                                    res.status(200)
                                }
                            })
                        }        
                }
        )
                        
   });   

})*/
app.post('/order/submit',staticUserAuth, function(req,res){

    var order_products=req.body.products
    var order_user=req.body.user
    var order_pharmacy=req.body.pharmacy
    var order_time = req.body.time
    var order_status = req.body.status
    var order_price = req.body.price
    var order_image = (req.body.image).toLowerCase()
    var location = req.body.location

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
                                                if(result.length>0){
                                                        return cb(null, user); // user found, return that user
                                                }
                                                else{
                                                db.collection("users").insertOne(user, function(err, res) {
                                                        if (err){
                                                        }else{
                                                                console.log("1 record inserted");
                                                                
                                                        }
                                
                                                        db.close();
                                                        return cb(null, user);
                                                });
                                        }


                                })

                }); 

})

app.get('/order',staticUserAuth,function(req,res){
    //res.redirect("/order")
})

app.listen(3000, function() {
    console.log("Listening!")
})

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
})