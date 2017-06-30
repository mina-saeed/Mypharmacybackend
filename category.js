
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

/*--------------------------- Start Of create new category ------------------------------------*/
app.post('/new', staticUserAuth, function(req, res) {
        // console.log(req)
        var category_name = req.body.name
        var category_description = req.body.description


        MongoClient.connect(url, function(err, db) {    
                db.collection('category').find({name: category_name}).toArray(function(err, result){

                        if(err){
                                res.send("Error")
                        }
                        if(result.length >0){
                                console.log(result)
                                res.send("category already exists")
                        }
                        else{

                                var category={
                                        name: category_name,
                                        description: category_description,
                                };
                        
                        db.collection('category').insertOne(category , function(err, output){

                                if(err){
                                        console.log("error Is : "+err)
                                }else{
                                        res.send('one category has been added')
                                }
                        })
                }
        })
        });
})
/*--------------------------- end of create new category ------------------------------------*/




/******************************* Get all categorys Endpoint ****************************************************/
app.get('/all', staticUserAuth, function(req, res) {

        
                MongoClient.connect(url, function(err, db) {

                        db.collection('category').find({}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){

                                        res.status(200).send(result)
                                }
                                else{
                                        res.send("Sorry , No categories found")
                                }
                        })
                });
        

   
})
/*******************************************End Of All categorys ***************************/

app.listen(3006, function() {
    console.log("Listening To categories API !")
})
