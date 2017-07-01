const config = require('./config.json')
var express = require('express');
var passport = require('passport');
const fs = require('fs');
const http = require('http')
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
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),function(req, res) { res.status(200).send("success") });

app.post('/userHome', function(req,res){

    var user_device_id = req.body.deviceID

        MongoClient.connect(url, function(err, db) {
                
            db.collection('users').find({$and: [{deviceID: user_device_id , mobile:{$ne:null}, location:{$ne:null} }]}).toArray(function(err, result){
                        console.log(result)
                    if(err){

                            res.send("Error")
                    }
                    if(result.length >0){
                       // res.redirect('/order')
                        res.status(200).send(result)
                    }else{
                    	res.status(404).send("no data")
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
    var user_mobile = req.body.mobile

    MongoClient.connect(url, function(err, db) {
        db.collection('users').update(
                {deviceID: user_device_id},
                {$set:
                        {
                            location: user_location ,
                            mobile: user_mobile
                        },       
                },
                function(err, result){

                        if(err) {throw err}
                        else{

                            res.status(200).send("User data updated")
                        }        
                }
        )
                        
   });   

})
/*app.post('/order/uploadImage',staticUserAuth, function(req,res){

        var user_device_id=req.body.deviceID
        var user_image = (req.body.image).toLowerCase()

        var image_dir = __dirname + 'orderImages/'
        var image_url = __dirname + 'orderImages/'+user_image

        fs.rename(image_url, user_image, function(err) {
            if (err) {
                console.log(err);
                res.send(403);
            } else {
                MongoClient.connect(url, function(err, db) {
                        if (err) throw err;
                                var order = { 
                                        userID: user_device_id,
                                        image_url: image_url

                                 };


                                                db.collection("orders").insertOne(order, function(err, res) {
                                                        if (err){
                                                        }else{
                                                                console.log("1 order inserted");
                                                                
                                                        }
                                
                                                        db.close();
                                                });
                                        



                });
            }
        });



})*/
app.post('/order/submit',staticUserAuth, function(req,res){
var fullUrl = "http://207.154.240.16/orderImages/";
    var order_user=req.body.userID
    var order_pharmacy=req.body.pharmacy
    var order_products=req.body.products
    var order_price = req.body.price
    var order_location = req.body.location
    var order_time = req.body.time
    var order_status = req.body.status
    var order_image = "test.jpg"
    var image_url = fullUrl+order_image

        MongoClient.connect(url, function(err, db) {
        if (err) throw err;
                var order = { 
                        userID: order_user,
                        pharmacy: order_pharmacy,
                        products: order_products,
                        price: order_price,
                        location: order_location,
                        time: order_time,
                        status: order_status,
                        imageUrl: image_url


                 };


                                db.collection("orders").insertOne(order, function(err, res) {
                                        if (err){
                                        }else{
                                                if(order_image!==null || order_image!==""){

                                                    var req = http.request(function(res) {
                                                      var file = fs.createWriteStream(order_image);
                                                      res.pipe(file);
                                                    });
                                                    req.on('error', function(e) {
                                                      console.log('error: ' + e.message);
                                                    });
                                                    req.end();
                                                }
                                                
                                        }
                
                                        db.close();
                                });
                        



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