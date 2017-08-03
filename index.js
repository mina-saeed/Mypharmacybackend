const config = require('./config.json')
var express = require('express');
var passport = require('passport');
var request = require('request');
var cors = require('cors')
const fs = require('fs');
const http = require('http')
var Strategy = require('passport-facebook').Strategy;
var bodyParser = require("body-parser");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mypharmacy";
const basicAuth = require('./basicAuth.js')
var cookieParser = require('cookie-parser');
var session = require('express-session');
const datetime = require('node-datetime');
var multer = require('multer');
const fileUpload = require('express-fileupload');

var app = express()

app.use(bodyParser.json());
app.use(session({secret: 'test'})); 
app.use(fileUpload());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors())
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



/******************************* Start Of Register Endpoint ****************************************************/

app.post('/register', staticUserAuth, function(req, res) {

        var dt = datetime.create();
        var date_now = dt.format('H:M')+dt.format('H:M');
        var server_token = (require('crypto').createHash('md5').update(date_now).digest('hex')).toString();
        console.log(server_token)

        var request_token = req.body.token
        var decode_request_token = new Buffer(request_token, 'base64').toString();
        console.log(decode_request_token)
        var request_token = (require('crypto').createHash('md5').update(decode_request_token).digest('hex')).toString();

        if(server_token){
                var username = req.body.name
                var useremail = req.body.email
                var userpassword = (require('crypto').createHash('md5').update(req.body.password).digest('hex')).toString();

                MongoClient.connect(url, function(err, db) {
                        db.collection('users').find({email: useremail}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){
                                        res.status(409).send("user already exists")
                                }
                                else{
                                        var userData={
                                                name: username,
                                                email: useremail,
                                                password: userpassword,
                                                type: "user",
                                                active:1
                                        };
                                        db.collection('users').insertOne(userData , function(err, output){
                                                if(err){
                                                        throw err
                                                }else{
                                                        console.log("one user has been added")
                                                        res.status(200).send()
                                                }
                                        })
                                }
                        })
                }); 
        }else{
                res.status(400).send("False")
        }
})
/*******************************************End Of Register Endpoint ***************************/
var session_set;
/******************************* Start Of Login Endpoint ****************************************************/
app.post('/login', staticUserAuth, function(req, res) {

        session_set = req.session;
        var dt = datetime.create();
        var date_now = dt.format('H:M')+dt.format('H:M');
        console.log(date_now)
        var server_token = (require('crypto').createHash('md5').update(date_now).digest('hex')).toString();
        console.log(server_token)

       // var request_token = req.body.token
     //   var decode_request_token = new Buffer(request_token, 'base64').toString();
       // console.log(decode_request_token)
       // var request_token = (require('crypto').createHash('md5').update(decode_request_token).digest('hex')).toString();
       // console.log(request_token)
        if(session_set.email){
                console.log("Still exist")
               
                if(session_set.type=='user'){
                        res.status(200).send("Still exist")
                }

        }
        else{
                if(server_token){

                        var user_email = req.body.email
                        console.log(user_email)
                        console.log(req.body.password)
                        var user_password = (require('crypto').createHash('md5').update(req.body.password).digest('hex')).toString();

                        MongoClient.connect(url, function(err, db) {    
                                db.collection('users').find({email: user_email , password: user_password , type:"user" , active:1}).toArray(function(err, result){

                                        if(err){
                                                res.status(403).send("Error")
                                        }
                                        if(result.length >0){
                                                        session_set.email = user_email
                                                        session_set.type =result[0].type
                                           				
                                           				var output = {
                                                            email:result[0].email,
                                                            type: result[0].type,
                                                            username: result[0].name
                                                        }

                                                        console.log(session_set)
                                                        res.status(200).send(output)
                                        }
                                        else{
                                                res.status(401).send("incoorect username or password")
                                        }
                                })
                        });
                }else{
                        res.status(400).send("False")
                }
        }
})

/*******************************************End Of Login Endpoint ***************************/

/*------------------------------------------- start logout endpoint------------------------*/

app.get('/logout', staticUserAuth ,function(req,res){

        req.session.destroy(function(err){

                if(err){
                        throw err
                }else{
                        console.log("Logged out")
                        res.status(200).send('logged out')
                }
        })
})


/*---------------------------------------------End Logout endpoint ------------------------*/


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

app.post('/order/submit',staticUserAuth, function(req,res){

	var order_userID = req.body.userInfo.userID
	var order_userLocation = req.body.userInfo.location
	var user_order = req.body.order

        MongoClient.connect(url, function(err, db) {

        	if (err) throw err;
        	var order = {
        		      userID: order_userID,
                        location: order_userLocation,
                        order: user_order,
                };
                db.collection("orders").insertOne(order, function(err, res) {

                	if (err){
                		throw err
                	}else{
                		request('http://www.google.com', function (error, response, body) {
                			if (!error && response.statusCode == 200) {
                				console.log(body) // Print the google web page
                			}
                		})
                	}
                	db.close();
                })
        });
})

app.get('/order',staticUserAuth,function(req,res){
    //res.redirect("/order")
})


app.post('/uploadPrescription',staticUserAuth, function(req,resp){

    var image_name = req.files.image.name
    var uploadUrl = '/var/www/html/uploads/prescription/'+image_name
    var order_userID=req.body.userID
    var order_userLocation=req.body.location
    var image_url = 'http://146.185.148.66/uploads/prescription/'+image_name

    var file;

    if(!req.files)
    {
        resp.send("File was not found");
        return;
    }

    file = req.files.image;  // here is the field name of the form

    file.mv(uploadUrl, function(err)  //Obvious Move function
        {
              //console.log(err)
        });

                MongoClient.connect(url, function(err, db) {
                        if (err) throw err;
                        var order = {
                                userID: order_userID,
                                location: order_userLocation,
                                order: image_url,
                        };
                        db.collection("orders").insertOne(order, function(err, res) {
                                if (err){
                                        throw err
                                }else{
                                     res.status(200).send("image Uploaded")
                                    console.log(res)
                              //      res.send("File Uploaded")

                    }
                  
                })
                        db.close();
        });


resp.status(200).send("image Uploaded")
})



app.post('/reportPharmacy',staticUserAuth, function(req,res){

			var report_userID = req.body.userID
			var report_pharmacyID = req.body.pharmacyID
			var report_text = req.body.report
                MongoClient.connect(url, function(err, db) {
                        if (err) throw err;
                        var report = {
                               userID: report_userID,
                               pharmacyID: report_pharmacyID,
                               report: report_text,
                        };
                        db.collection("report").insertOne(report, function(err, res) {
                                if (err){
                                        throw err
                                }else{
                                	
                                }
                    db.close();
                })
        });
        



})

app.post('/addRating',staticUserAuth, function(req,res){

			var rate_userID = req.body.userID
			var rate_pharmacyID = req.body.pharmacyID
			var pharmacy_rate = req.body.rate
                MongoClient.connect(url, function(err, db) {
                        if (err) throw err;
                        var rating = {
                               userID: rate_userID,
                               pharmacyID: rate_pharmacyID,
                               rate: pharmacy_rate,
                        };
                        db.collection("rating").insertOne(rating, function(err, res) {
                                if (err){
                                        throw err
                                }else{
                                	res.status(200).send("Success !")
                                }
                    db.close();
                })
        });
        



})

app.post('/pharmacyRating',staticUserAuth, function(req,res){

			var rating_userID = req.body.userID
			var rating_pharmacyID = req.body.pharmacyID
			       	
			       	MongoClient.connect(url, function(err, db) {
                        if (err) throw err;
                        db.collection('rating').find({userID:rating_userID , pharmacyID: rating_pharmacyID}).toArray(function(err, result){
                        	if(err)
                        		throw err
                        	else{
                        		var rate = {
                        			rating: result.rate
                        		}
                        		res.status(200).send(rate)
                        	}
                        	 db.close();
                        	})
                        })

        
        



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