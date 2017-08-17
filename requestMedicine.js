
const cors = require('cors')
const express = require('express');
const bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mypharmacy";
const basicAuth = require('./basicAuth.js')
const mongo = require('mongodb')
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

/******************************* Get all medicine requests Endpoint ****************************************************/
app.get('/medicneRequests', staticUserAuth, function(req, res) {

        
                MongoClient.connect(url, function(err, db) {

                        db.collection('medicines').find({confirmed:0}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){

                                        res.status(200).send(result)
                                }
                                else{
                                        res.send("Sorry , No medicines found")
                                }
                        })
                });
        

   
})
/*******************************************End Of all medicine requests ***************************/



/*----------------------- Start of accept Medicine --------------------------*/
app.put('/confirmMedicine', staticUserAuth,function(req, res){

    var medicne_ID = req.body.id

    MongoClient.connect(url, function(err, db) {
        db.collection('medicines').update(
                {_id: new mongo.ObjectID (medicne_ID)},
                {$set:
                        {

                            confirmed: 1

                        },       
                },
                function(err, result){

                        if(err) {throw err}
                        else{

                            res.status(200).send("Medicine request accepted")
                        }        
                }
        )
                        
   }); 

});

/*---------------------------------- End Of accept Medicine----------------*/


/*--------------------------- Start Of request medicine ------------------------------------*/
app.post('/requestMedicine', staticUserAuth, function(req, res) {
        var medicine_name = req.body.name
        var medicine_category = req.body.category
        var medicine_description = req.body.description
        var medicine_barcode = req.body.barcode
        var medicine_price = req.body.price
        var medicine_milligrams = req.body.milligrams
        var searchable = req.body.searchable
        var pharmacyEmail= req.body.email

        MongoClient.connect(url, function(err, db) {    
                db.collection('medicines').find({barcode: medicine_barcode}).toArray(function(err, result){

                        if(err){
                                res.send("Error")
                        }
                        if(result.length >0){
                                res.send("Medicine already exists")
                        }
                        else{

                                var medicine={
                                            barcode:req.body.barcode,
                                            name_english:req.body.name_english,
                                            name_ar:req.body.name_ar,
                                            english_description: req.body.english_description,
                                            arabic_description: req.body.arabic_description,
                                            price: req.body.price,
                                            milligrams: req.body.milligrams,
                                            category: req.body.category,
                                            confirmed:0,
                                            pharmacy: pharmacyEmail
                                };
                        
                        db.collection('medicines').insertOne(medicine , function(err, output){

                                if(err){
                                        console.log("error Is : "+err)
                                }else{
                                        res.send('Medicine request sent')
                                }
                        })
                }
        })
        });
})
/*--------------------------- end of request medicine ------------------------------------*/

/*--------------------------- Start Of request medicine ------------------------------------*/
app.post('/requestMedicine', staticUserAuth, function(req, res) {
        var medicine_name = req.body.name
        var medicine_category = req.body.category
        var medicine_description = req.body.description
        var medicine_barcode = req.body.barcode
        var medicine_price = req.body.price
        var medicine_milligrams = req.body.milligrams
        var searchable = req.body.searchable
        var pharmacyEmail= req.body.email

        MongoClient.connect(url, function(err, db) {    
                db.collection('medicines').find({barcode: medicine_barcode}).toArray(function(err, result){

                        if(err){
                                res.send("Error")
                        }
                        if(result.length >0){
                                res.send("Medicine already exists")
                        }
                        else{

                                var medicine={
                                            barcode:req.body.barcode,
                                            name_english:req.body.name_english,
                                            name_ar:req.body.name_ar,
                                            english_description: req.body.english_description,
                                            arabic_description: req.body.arabic_description,
                                            price: req.body.price,
                                            milligrams: req.body.milligrams,
                                            category: req.body.category,
                                            confirmed:0,
                                            pharmacy: pharmacyEmail
                                };
                        
                        db.collection('medicines').insertOne(medicine , function(err, output){

                                if(err){
                                        console.log("error Is : "+err)
                                }else{
                                        res.send('Medicine request sent')
                                }
                        })
                }
        })
        });
})
/*--------------------------- end of request medicine ------------------------------------*/


/******************************* Get all medicine requests Endpoint ****************************************************/
app.get('/pharmacyMedicneRequests/:pharmacy', staticUserAuth, function(req, res) {

                var pharmacyEmail = req.params.pharmacy
        
                MongoClient.connect(url, function(err, db) {

                        db.collection('medicines').find({pharmacy:pharmacyEmail}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){

                                        res.status(200).send(result)
                                }
                                else{
                                        res.send("Sorry , No medicine requests found")
                                }
                        })
                });
        

   
})
/*******************************************End Of all medicine requests ***************************/

app.listen(3080, function() {
    console.log("Listening To Medicine Requests API !")
})
