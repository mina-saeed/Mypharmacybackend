const config = require('./config.json')
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

/******************************* Start Of Search name Endpoint ****************************************************/
app.get('/search/:keyword', staticUserAuth, function(req, res) {

        var search_keyword = req.params.keyword
        console.log(search_keyword)
        var arabic = /[\u0600-\u06FF]/;
        var is_arabic = arabic.test(search_keyword)
        if(is_arabic){
                MongoClient.connect(url, function(err, db) {

                        db.collection('medicines').find({name_ar: {$regex: search_keyword} , confirmed:1}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){
                                        var arabic_result = new Array()
                                        result.forEach(function(item){
                                                var temp_json = {};
                                                temp_json['id'] = item._id
                                                temp_json['name'] = item.name_ar
                                                temp_json['description'] = item.arabic_description
                                                temp_json['category'] = item.category
                                                temp_json['barcode'] = item.barcode
                                                temp_json['milligrams'] = item.milligrams
                                                temp_json['price'] = item.price
                                                arabic_result.push(temp_json)
                                        })
                                        res.status(200).send(arabic_result)
                                }
                                else{
                                        res.send("عفوا و ﻻتوجد نتائج للبحث")
                                }
                        })
                });
        }else{
                MongoClient.connect(url, function(err, db) {

                        db.collection('medicines').find({name_english: {$regex: search_keyword} , confirmed:1}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){
                                        var english_result = new Array()
                                        result.forEach(function(item){
                                                var temp_json = {};
                                                temp_json['id'] = item._id
                                                temp_json['name'] = item.name_english
                                                temp_json['description'] = item.english_description
                                                temp_json['category'] = item.category
                                                temp_json['barcode'] = item.barcode
                                                temp_json['milligrams'] = item.milligrams
                                                temp_json['price'] = item.price
                                                english_result.push(temp_json)
                                        })
                                        res.status(200).send(english_result)
                                }
                                else{
                                        res.send("No results found")
                                }
                        })
                });
        }

   
})
/*******************************************End Of search name Endpoint ***************************/


/******************************* Start Of Search catgeory Endpoint ****************************************************/
app.get('/search/category/:keyword', staticUserAuth, function(req, res) {
        var search_keyword = req.params.keyword
        var arabic = /[\u0600-\u06FF]/;
        var is_arabic = arabic.test(search_keyword)
        if(is_arabic){
                MongoClient.connect(url, function(err, db) {

                        db.collection('medicines').find({"category": {$regex: search_keyword} , confirmed:1}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){
                                        var arabic_result = new Array()
                                        result.forEach(function(item){
                                                var temp_json = {};
                                                temp_json['id'] = item._id
                                                temp_json['name'] = item.name_ar
                                                temp_json['description'] = item.arabic_description
                                                temp_json['category'] = item.category
                                                temp_json['barcode'] = item.barcode
                                                temp_json['milligrams'] = item.milligrams
                                                temp_json['price'] = item.price
                                                arabic_result.push(temp_json)
                                        })
                                        res.status(200).send(arabic_result)
                                }
                                else{
                                        res.send("عفوا و ﻻتوجد نتائج للبحث")
                                }
                        })
                });
        }else{
                MongoClient.connect(url, function(err, db) {
                        db.collection('medicines').find({"category": {$regex: search_keyword} , confirmed:1}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){
                                        var english_result = new Array()
                                        result.forEach(function(item){
                                                var temp_json = {};
                                                temp_json['id'] = item._id
                                                temp_json['name'] = item.name_english
                                                temp_json['description'] = item.english_description
                                                temp_json['category'] = item.category
                                                temp_json['barcode'] = item.barcode
                                                temp_json['milligrams'] = item.milligrams
                                                temp_json['price'] = item.price
                                                english_result.push(temp_json)
                                        })
                                        res.status(200).send(english_result)
                                }
                                else{
                                        res.send("No results found")
                                }
                        })
                });
        }

   
})
/*******************************************End Of search category Endpoint ***************************/


/******************************* Start Of Search catgeory Endpoint ****************************************************/
app.get('/searchBarcode/:keyword', staticUserAuth, function(req, res) {

        var search_keyword = req.params.keyword

                MongoClient.connect(url, function(err, db) {

                        db.collection('medicines').find({barcode: ''+search_keyword+'' , confirmed:1}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){
                                        var medicine_result = new Array()
                                        result.forEach(function(item){
                                                var temp_json = {};
                                                temp_json['id'] = item._id
                                                temp_json['name_ar'] = item.name_ar
                                                temp_json['description_ar'] = item.arabic_description
                                                temp_json['category'] = item.category
                                                temp_json['barcode'] = item.barcode
                                                temp_json['milligrams'] = item.milligrams
                                                temp_json['price'] = item.price
                                                temp_json['name_en'] = item.name_english
                                                temp_json['description_en'] = item.english_description
                                                medicine_result.push(temp_json)
                                        })
                                        res.status(200).send(medicine_result)
                                }
                                else{
                                        res.send("No medicines match this barcode")
                                }
                        })
                });

   
})
/*******************************************End Of search category Endpoint ***************************/



/******************************* Start Of Search By ID Endpoint ****************************************************/
app.get('/searchID/:id', staticUserAuth, function(req, res) {
        var medicineID = req.params.id

                MongoClient.connect(url, function(err, db) {

                        db.collection('medicines').find({_id: new mongo.ObjectID (medicineID) , confirmed:1}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){
                                        var medicine_result = new Array()
                                        result.forEach(function(item){
                                                var temp_json = {};
                                                temp_json['id'] = item._id
                                                temp_json['name_ar'] = item.name_ar
                                                temp_json['description_ar'] = item.arabic_description
                                                temp_json['category'] = item.category
                                                temp_json['barcode'] = item.barcode
                                                temp_json['milligrams'] = item.milligrams
                                                temp_json['price'] = item.price

                                                temp_json['name_en'] = item.name_english
                                                temp_json['description_en'] = item.english_description
                                                medicine_result.push(temp_json)
                                        })
                                        res.status(200).send(medicine_result)
                                }
                                else{
                                        res.send("No medicines Found")
                                }
                        })
                });
        
   
})
/*******************************************End Of search category Endpoint ***************************/
app.listen(3003, function() {
    console.log("Listening To search API!")
})
