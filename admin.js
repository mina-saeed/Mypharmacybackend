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
app.use(session({secret: 'test'}));

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
                var admin_name = req.body.name
                var admin_email = req.body.email
                var admin_password = (require('crypto').createHash('md5').update(req.body.password).digest('hex')).toString();

                MongoClient.connect(url, function(err, db) {
                        db.collection('users').find({email: admin_email}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){
                                        res.send("user already exists")
                                }
                                else{
                                        var admin={
                                                name: admin_name,
                                                email: admin_email,
                                                password: admin_password,
                                                type: "none"
                                        };
                                        db.collection('users').insertOne(admin , function(err, output){
                                                if(err){
                                                        throw err
                                                }else{
                                                        console.log("one admin has been added")
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
               
                if(session_set.type=='admin'){
                        res.status(200).send(result)
                }
                if(session_set.type=="super"){
                        res.redirect('/super')
                }
        }
        else{
                if(server_token === request_token){

                        var admin_email = req.body.email
                        var admin_password = (require('crypto').createHash('md5').update(req.body.password).digest('hex')).toString();

                        MongoClient.connect(url, function(err, db) {    
                                db.collection('users').find({email: admin_email , password: admin_password}).toArray(function(err, result){

                                        if(err){
                                                res.status(403).send("Error")
                                        }
                                        if(result.length >0){
                                                var user_type = result[0].type
                                                
                                                if(user_type=="admin"){
                                                        session_set.email = admin_email
                                                        session_set.type =user_type
                                                        console.log(session_set)
                                                        res.status(200).send(result)
                                                }
                                                //  res.redirect('/adminHome')
                                        }
                                        else{
                                                res.status(403)
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


/*--------------------------- Start Of create new product ------------------------------------*/
app.post('/admin/new', staticUserAuth, function(req, res) {
   // console.log(req)
    var medicine_name = req.body.name
    var medicine_category = req.body.category
    var medicine_description = req.body.description
    var medicine_barcode = req.body.barcode
    var medicine_price = req.body.price
    var medicine_milligrams = req.body.milligrams

MongoClient.connect(url, function(err, db) {    
    db.collection('medicines').find({barcode: medicine_barcode}).toArray(function(err, result){

        if(err){
            res.send("Error")
        }
        if(result.length >0){
            console.log(result)
            res.send("Medicine already exists")
        }
        else{
            var medicine={
                name: medicine_name,
                category: medicine_category,
                description: medicine_description,
                barcode : medicine_barcode,
                price: medicine_price,
                milligrams : medicine_milligrams

            };
            db.collection('medicines').insertOne(medicine , function(err, output){
                
                if(err){

                    console.log("error Is : ")
                    console.log(err)
                }else{

                    res.send('one medicine has been added')
                }
            })
        }
    })
                        
   });   
})
/*--------------------------- end of create new product ------------------------------------*/

/*--------------------------- Start Of Confirm pharmacy ------------------------------------*/
app.post('/admin/confirmPharmacy', staticUserAuth, function(req, res) {

    var pharmacy_name = req.body.email
    var pharmacy_active = req.body.active

    MongoClient.connect(url, function(err, db) {
        db.collection('pharmacy').update(
                {email: pharmacy_name},
                {$set:
                        {active: pharmacy_active}
                },
                function(err, result){
                        if(err) throw err
                        if(result){
                                res.send("Pharmacy Activated")
                        }        
                }
        )
                        
   });   
})
/*--------------------------- end of confirm pharmacy ------------------------------------*/

/*--------------------------- Start Of Confirm pharmacy ------------------------------------*/
app.post('/admin/confirmAdmin', staticUserAuth, function(req, res) {

    var user_email = req.body.email
    var user_type = req.body.type

    MongoClient.connect(url, function(err, db) {
        db.collection('users').update(
                {email: user_email},
                {$set:
                        {type: user_type}
                },
                function(err, result){
                        if(err) throw err
                        if(result){
                                res.send("User activated as admin")
                        }        
                }
        )
                        
   });   
})
/*--------------------------- end of confirm pharmacy ------------------------------------*/
app.listen(3001, function() {
    console.log("Listening To Admin API !")
})
