const config = require('./config.json')
var cors = require('cors')
const express = require('express');

const datetime = require('node-datetime');
const bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mypharmacy";
const basicAuth = require('./basicAuth.js')
var cookieParser = require('cookie-parser');
var session = require('express-session');



var app = express()

app.use(bodyParser.urlencoded({
        extended: true
}));

app.use(bodyParser.json());
app.use(session({secret: 'pharma'}));

app.use(cors())

var staticUserAuth = basicAuth({
        users: {
                'admin': '123456'
        },
        challenge: true
})

/******************************* Start Of Login Endpoint ****************************************************/
app.post('/register', staticUserAuth, function(req, res) {


        var dt = datetime.create();
        var date_now = dt.format('H:M')+dt.format('H:M');
        var server_token = (require('crypto').createHash('md5').update(date_now).digest('hex')).toString();
        console.log(server_token)
        var request_token = req.body.token
        var decode_request_token = new Buffer(request_token, 'base64').toString();
        console.log(decode_request_token)
        var request_token = (require('crypto').createHash('md5').update(decode_request_token).digest('hex')).toString();

        if(server_token === request_token){

                var pharma_name = req.body.name
                var pharma_email = req.body.email
                var pharma_password = (require('crypto').createHash('md5').update(req.body.password).digest('hex')).toString();
                var pharma_locations = req.body.location
                var pharma_time = req.body.time
                var pharma_rating = req.body.rating
                var pharma_category = req.body.category
                var pharma_tel = req.body.telephone
                var pharma_mobile = req.body.mobile
                var pharma_active = 0

                MongoClient.connect(url, function(err, db) {

                        db.collection('pharmacy').find({email: pharma_email , mobile: pharma_mobile}).toArray(function(err, result){

                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){
                                        res.send("user already exists")
                                }
                                else{
                                        var pharmacy={
                                                name: pharma_name,
                                                email: pharma_email,
                                                password: pharma_password,
                                                location: pharma_locations,
                                                time: pharma_time,
                                                rating:     pharma_rating,
                                                category:   pharma_category,
                                                telephone:  pharma_tel,
                                                mobile:     pharma_mobile,
                                                active:     pharma_active
                                        };
                                        db.collection('pharmacy').insertOne(pharmacy , function(err, output){
                                                if(err){
                                                        throw err
                                                }else{
                                                        console.log("one Pharmacy has been added")
                                                        res.status(200).send('Registered Successfully')
                                                }
                                        })
                                }
                        })
                });
        }else{
                res.status(400).send("False")
        }
})
/*******************************************End Of Login Endpoint ***************************/

/******************************* Start Of Login Endpoint ****************************************************/
app.post('/login', staticUserAuth, function(req, res) {

    var pharma_name = req.body.email
    var pharma_password = (require('crypto').createHash('md5').update(req.body.password).digest('hex')).toString();
MongoClient.connect(url, function(err, db) {    
    db.collection('pharmacy').find({email: pharma_name , password: pharma_password , active: 1}).toArray(function(err, result){

        if(err){
            res.send("Error !!")
        }
        if(result.length >0){
            console.log("Successfully Login")
            res.status(200).send(result)
        }
        else{
            res.send(" invalid username or password")
        }
    })
                        
   });  
                        
    
})
/*******************************************End Of Login Endpoint ***************************/

var session_set;
/******************************* Start Of Login Endpoint ****************************************************/
app.post('/login', staticUserAuth, function(req, res) {

        session_set = req.session;
        var dt = datetime.create();
        var date_now = dt.format('H:M')+dt.format('H:M');
        console.log(date_now)
        var server_token = (require('crypto').createHash('md5').update(date_now).digest('hex')).toString();
        console.log(server_token)

        var request_token = req.body.token
        var decode_request_token = new Buffer(request_token, 'base64').toString();
        console.log(decode_request_token)
        var request_token = (require('crypto').createHash('md5').update(decode_request_token).digest('hex')).toString();
        console.log(request_token)
        
        if(session_set.email){
                console.log("Still exist")
                res.status(409).send("User already Exists")
        }
        else{
                if(server_token === request_token){

                        var pharma_name = req.body.email
                        var pharma_password = (require('crypto').createHash('md5').update(req.body.password).digest('hex')).toString();

                        MongoClient.connect(url, function(err, db) {

                                db.collection('pharmacy').find({email: pharma_name , password: pharma_password , active: 1}).toArray(function(err, result){

                                        if(err){
                                                res.send("Error !!")
                                        }
                                        if(result.length >0){
                                                console.log("Successfully Login")
                                                res.status(200).send(result)
                                        }
                                        else{
                                                res.status(401).send(" invalid username or password")
                                        }
                                })
                        });
                }else{
                        res.status(400).send("False")
                }
        }
})

/********************************************End login endpoint *******************************************/


/********************************************Start logout endpoint *************************/

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

/********************************************End logout endpoint **************************/

app.listen(3002, function() {
    console.log("Listening To pharmcy API!")
})




