const config = require('./config.json')
var express = require('express');

var bodyParser = require("body-parser");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/pharmacy";
const basicAuth = require('./basicAuth.js')

var app = express()

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
     res.header('Access-Control-Allow-Origin', '*')
       next();
});
var staticUserAuth = basicAuth({
    users: {
        'admin': '123456'
    },
    challenge: true
})

/******************************* Start Of Login Endpoint ****************************************************/
app.post('/register/admin', staticUserAuth, function(req, res) {
   // console.log(req)
    var admin_name = req.body.name
    var admin_email = req.body.email
    var admin_password = (require('crypto').createHash('md5').update(req.body.password).digest('hex')).toString();
MongoClient.connect(url, function(err, db) {    
    db.collection('admin').find({email: admin_email}).toArray(function(err, result){

        if(err){
            res.send("Error")
        }
        if(result.length >0){
            console.log(result)
            res.send("user already exists")
        }
        else{
            var admin={
                name: admin_name,
                email: admin_email,
                password: admin_password

            };
            db.collection('admin').insertOne(admin , function(err, output){
                
                if(err){

                    console.log("error Is : ")
                    console.log(err)
                }else{

                    console.log("one admin has been added")
                    res.redirect('/adminHome')
                }
            })
        }
    })
                        
   });   
})
/*******************************************End Of Login Endpoint ***************************/

/******************************* Start Of Login Endpoint ****************************************************/
app.get('/login/admin', staticUserAuth, function(req, res) {

    var admin_email = req.body.email
    var admin_password = (require('crypto').createHash('md5').update(req.body.password).digest('hex')).toString();
MongoClient.connect(url, function(err, db) {    
    db.collection('admin').find({email: admin_email , password: admin_password}).toArray(function(err, result){

        if(err){
            res.send("user name or password nt correct")
        }
        if(result.length >0){
            console.log(result)
            res.send("user already exists")
        }
        else{
            res.send(" invalid username or password")
        }
    })
                        
   });  
                        
    
})
/*******************************************End Of Login Endpoint ***************************/

/*--------------------------- Start Of create new product ------------------------------------*/
app.post('/admin/new', staticUserAuth, function(req, res) {
   // console.log(req)
    var medicine_name = req.body.name
    var medicine_category = req.body.category
    var medicine_description = req.body.description
    var medicine_barcode = req.body.barcode
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
                milligrams : medicine_milligrams

            };
            db.collection('medicines').insertOne(medicine , function(err, output){
                
                if(err){

                    console.log("error Is : ")
                    console.log(err)
                }else{

                    console.log("one medicine has been added")
                    res.redirect('/adminHome')
                }
            })
        }
    })
                        
   });   
})
/*--------------------------- end of create new product ------------------------------------*/



app.listen(3001, function() {
    console.log("Listening!")
})
