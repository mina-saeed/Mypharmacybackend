
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

/******************************* Get all medicines Endpoint ****************************************************/
app.get('/all', staticUserAuth, function(req, res) {

        
                MongoClient.connect(url, function(err, db) {

                        db.collection('medicines').find({}).toArray(function(err, result){
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
/*******************************************End Of All medicines ***************************/

/*--------------------------- Start Of create new medicine ------------------------------------*/
app.post('/new', staticUserAuth, function(req, res) {
        // console.log(req)
        var medicine_name = req.body.name
        var medicine_category = req.body.category
        var medicine_description = req.body.description
        var medicine_barcode = req.body.barcode
        var medicine_price = req.body.price
        var medicine_milligrams = req.body.milligrams
        var searchable = req.body.searchable

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
                                        console.log("error Is : "+err)
                                }else{
                                        res.send('one medicine has been added')
                                }
                        })
                }
        })
        });
})
/*--------------------------- end of create new medicine ------------------------------------*/


/*----------------------- Start of Update Medicine--------------------------*/
app.put('/updateMedicine', staticUserAuth,function(req, res){

    var medicne_ID = req.body.id
    var medicine_name = req.body.name
    var medicine_category = req.body.category
    var medicine_barcode = req.body.barcode
    var medicine_description = req.body.description
    var medicine_price = req.body.price
    var medicine_milligrams = req.body.milligrams    
    var medicine_pharmaID = req.body.pharmacyID
    var medicine_creator = req.body.creator
    var searchable = req.body.searchable


    MongoClient.connect(url, function(err, db) {
        db.collection('medicines').update(
                {_id: new mongo.ObjectID (medicne_ID)},
                {$set:
                        {

                            name: medicine_name,
                            category: medicine_category,
                            description: medicine_description,
                            barcode : medicine_barcode,
                            price: medicine_price,
                            milligrams : medicine_milligrams,
                            pharmacyID: medicine_pharmaID,
                            creator: medicine_creator

                        },       
                },
                function(err, result){

                        if(err) {throw err}
                        else{

                            res.status(200).send("Medicine updated")
                        }        
                }
        )
                        
   }); 

});

/*---------------------------------- End Of Update Medicine----------------*/

/*----------------------- Start of Delete Medicine--------------------------*/
app.delete('/deleteMedicine', staticUserAuth,function(req, res){
    var medicineID = req.query.id
        
    MongoClient.connect(url, function(err, db) {
        db.collection('medicines').deleteOne({_id: new mongo.ObjectID (medicineID) } , function(err, obj){

            if(err)
                throw err
            if(obj.result.n ==1){
            
                res.status(200).send()
            }else{
            	res.status(204).send()
            }
        })


    })
});

/*---------------------------------- End Of delete Medicine ----------------*/
app.listen(3004, function() {
    console.log("Listening To Medicines API !")
})
