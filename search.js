const config = require('./config.json')
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
        var arabic = /[\u0600-\u06FF]/;
        var is_arabic = arabic.test(search_keyword)
        if(is_arabic){
                MongoClient.connect(url, function(err, db) {

                        db.collection('medicines').find({"name.arabic.name": {$regex: search_keyword}}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){
                                        var arabic_result = new Array()
                                        result.forEach(function(item){
                                                var temp_json = {};
                                                temp_json['id'] = item._id
                                                temp_json['name'] = item.name.arabic.name
                                                temp_json['description'] = item.description.arabic.desc
                                                temp_json['category'] = item.category.arabic.name
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
                        db.collection('medicines').find({"name.english.name": {$regex: search_keyword}}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){
                                        var english_result = new Array()
                                        result.forEach(function(item){
                                                var temp_json = {};
                                                temp_json['id'] = item._id
                                                temp_json['name'] = item.name.english.name
                                                temp_json['description'] = item.description.english.desc
                                                temp_json['category'] = item.category.english.name
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

                        db.collection('medicines').find({"category.arabic.name": {$regex: search_keyword}}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){
                                        var arabic_result = new Array()
                                        result.forEach(function(item){
                                                var temp_json = {};
                                                temp_json['id'] = item._id
                                                temp_json['name'] = item.name.arabic.name
                                                temp_json['description'] = item.description.arabic.desc
                                                temp_json['category'] = item.category.arabic.name
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
                        db.collection('medicines').find({"category.english.name": {$regex: search_keyword}}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){
                                        var english_result = new Array()
                                        result.forEach(function(item){
                                                var temp_json = {};
                                                temp_json['id'] = item._id
                                                temp_json['name'] = item.name.english.name
                                                temp_json['description'] = item.description.english.desc
                                                temp_json['category'] = item.category.english.name
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
app.get('/search/barcode/:keyword', staticUserAuth, function(req, res) {

        var search_keyword = req.params.keyword

                MongoClient.connect(url, function(err, db) {

                        db.collection('medicines').find({barcode: ''+search_keyword+''}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){
                                        var english_result = new Array()
                                        result.forEach(function(item){
                                                var temp_json = {};
                                                temp_json['id'] = item._id
                                                temp_json['name'] = item.name.english.name
                                                temp_json['description'] = item.description.english.desc
                                                temp_json['category'] = item.category.english.name
                                                temp_json['barcode'] = item.barcode
                                                temp_json['milligrams'] = item.milligrams
                                                temp_json['price'] = item.price
                                                english_result.push(temp_json)
                                        })
                                        res.status(200).send(english_result)
                                }
                                else{
                                        res.send("sorry , no results match this barcode")
                                }
                        })
                });

   
})
/*******************************************End Of search category Endpoint ***************************/
app.listen(3003, function() {
    console.log("Listening To search API!")
})
