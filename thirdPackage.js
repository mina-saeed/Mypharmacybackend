const config = require('./config.json')
const express = require('express');
const app = express()
const passport = require('passport');
const request = require('request');
const cors = require('cors')
const fs = require('fs');
const bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mypharmacy";
const basicAuth = require('./basicAuth.js')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const datetime = require('node-datetime');
const multer = require('multer');
const fileUpload = require('express-fileupload');
const mongo = require('mongodb')


app.use(bodyParser.json());
app.use(session({secret: 'test'})); 


app.use(fileUpload());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors())
app.use(passport.initialize());

var staticUserAuth = basicAuth({
    users: {
        'admin': '123456'
    },
    challenge: true
})



        app.get('/allOrders', staticUserAuth, function(req, res) {

            var unconfirmedOrders = []
            var FirstPharmacies =[]
            MongoClient.connect(url, function(err, db) {

                db.collection("orders").find({confirmed :0}).toArray(function(err, allExistOrders){

                    if (err)
                        throw err
                    else{

                        if(allExistOrders.length>0){

                            db.collection('pharmacy').find({}).toArray(function(err, allPharmacies){
                                if(err){
                                    throw err
                                }else{
                                   // FirstPharmacies.push(allPharmacies)
                                }


                            })

                            res.send({allPharmacies:allPharmacies, allOrders:allExistOrders})
                        }else{
                            res.send("No Orders ")
                        }
                    }
                })
                /*db.close();*/
            });
        });

app.listen(3030, function() {
    console.log("Listening!")
})

