
const cors = require('cors')
const express = require('express');
const bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mypharmacy";
const basicAuth = require('./basicAuth.js')


var app = express()

app.use(bodyParser.urlencoded({
        extended: true
}));

app.use(bodyParser.json());

app.use(cors())

var staticUserAuth = basicAuth({
        users: {
                'admin': '123456'
        },
        challenge: true
})

/*--------------------------- Start Of create new product ------------------------------------*/
app.post('/new', staticUserAuth, function(req, res) {
   // console.log(req)
    var beauty_name = req.body.name
    var beauty_category = req.body.category
    var beauty_subCategory = req.body.sub
    var beauty_barcode = req.body.barcode
    var beauty_description = req.body.description
    var beauty_price = req.body.price
    var beauty_pharmaID = req.body.pharmacyID
    var beauty_creator = req.body.creator
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
                pharmacyID: beauty_pharmaID,
                creator: beauty_creator

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




/******************************* Get all Products Endpoint ****************************************************/
app.get('/all', staticUserAuth, function(req, res) {

        
                MongoClient.connect(url, function(err, db) {

                        db.collection('beauty').find({}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){

                                        res.status(200).send(result)
                                }
                                else{
                                        res.send("Sorry , No Products found")
                                }
                        })
                });
        

   
})
/*******************************************End Of All Products Endpoint ***************************/

app.listen(3005, function() {
    console.log("Listening To Beauty Products API !")
})
