const config = require('./config.json')
var express = require('express');

var bodyParser = require("body-parser");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mypharmacy";
const basicAuth = require('./basicAuth.js')

var app = express()

app.use(bodyParser.urlencoded({
    extended: true
}))
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
app.post('/register/pharmacy', staticUserAuth, function(req, res) {
   /*console.log(req.body)*/
    var pharma_name = req.body.name
    var pharma_password = (require('crypto').createHash('md5').update(req.body.password).digest('hex')).toString();
    var pharma_address = req.body.address
    var pharma_locations = req.body.locations
    var pharma_time = req.body.time
    var pharma_rating = req.body.rating
    var pharma_category = req.body.category
    var pharma_tel = req.body.telephone
    var pharma_mobile = req.body.mobile
    var pharma_active = 0
MongoClient.connect(url, function(err, db) {    
    db.collection('pharmacy').find({name: pharma_name , mobile: pharma_mobile}).toArray(function(err, result){

        if(err){
            res.send("Error")
        }
        if(result.length >0){
            console.log(result)
            res.send("user already exists")
        }
        else{
            var pharmacy={
                name:       pharma_name,
                password:   pharma_password,
                address:    pharma_address,
                locations:  pharma_locations,
                time:       pharma_time,
                rating:     pharma_rating,
                category:   pharma_category,
                telephone:  pharma_tel,
                mobile:     pharma_mobile,
                active:     pharma_active

            };
            db.collection('pharmacy').insertOne(pharmacy , function(err, output){
                
                if(err){

                    console.log("error Is : ")
                    console.log(err)
                }else{

                    console.log("one Pharmacy has been added")
                    res.redirect('/pharmacyHome')
                }
            })
        }
    })
                        
   });   
})
/*******************************************End Of Login Endpoint ***************************/

/******************************* Start Of Login Endpoint ****************************************************/
app.post('/login/pharmacy', staticUserAuth, function(req, res) {

    var pharma_name = req.body.name
    var pharma_password = (require('crypto').createHash('md5').update(req.body.password).digest('hex')).toString();
MongoClient.connect(url, function(err, db) {    
    db.collection('pharmacy').find({name: pharma_name , password: pharma_password , active: 1}).toArray(function(err, result){

        if(err){
            res.send("Error !!")
        }
        if(result.length >0){
            console.log("Successfully Login")
            res.redirect('/pharmacyHome')
        }
        else{
            res.send(" invalid username or password")
        }
    })
                        
   });  
                        
    
})
/*******************************************End Of Login Endpoint ***************************/

/*--------------------------- Start Of create new product ------------------------------------*/
app.post('/pharmacy/new', staticUserAuth, function(req, res) {
   // console.log(req)
    var beauty_name = req.body.name
    var beauty_category = req.body.category
    var beauty_subCategory = req.body.sub
    var beauty_barcode = req.body.barcode
    var beauty_description = req.body.description
    var beauty_price = req.body.price
    var beauty_pharmaID = req.body.pharmacyID

MongoClient.connect(url, function(err, db) {    
    db.collection('beauty').find({barcode: beauty_barcode}).toArray(function(err, result){

        if(err){
            res.send("Error")
        }
        if(result.length >0){
            console.log(result)
            res.send("Beauty Product already exists")
        }
        else{
            var beauty={
                name: beauty_name,
                category: beauty_category,
                subCategory: beauty_subCategory,
                barcode : beauty_barcode,
                description: beauty_description,
                price : beauty_price,
                pharmacyID: beauty_pharmaID

            };
            db.collection('beauty').insertOne(beauty , function(err, output){
                
                if(err){

                    console.log("error Is : ")
                }else{

                   
                    res.send('one beauty product has been added')
                }
            })
        }
    })
                        
   });   
})
/*--------------------------- end of create new product ------------------------------------*/



app.listen(3002, function() {
    console.log("Listening To pharmcy API!")
})
