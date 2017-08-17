
const cors = require('cors')
const express = require('express');
const bodyParser = require("body-parser");
const mongo = require('mongodb')
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mypharmacy";
const basicAuth = require('./basicAuth.js')
const fileUpload = require('express-fileupload');

var app = express()

app.use(bodyParser.urlencoded({
        extended: true
}));

app.use(bodyParser.json());

app.use(cors())
app.use(fileUpload());
var staticUserAuth = basicAuth({
        users: {
                'admin': '123456'
        },
        challenge: true
})





/******************************* Check  Endpoint ****************************************************/
app.post('/checkUser', staticUserAuth, function(req, res) {

                var userType = req.body.type
                var userEmail = req.body.email
                var requestToken = req.body.token

                var serverToken = (require('crypto').createHash('md5').update(userEmail).digest('hex')).toString();

                if(serverToken == requestToken){
                if(userType == "user"){

                        MongoClient.connect(url, function(err, db) {

                            db.collection('users').find({email:userEmail}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){

                                        res.status(200).send("User Exists")
                                }
                                else{
                                        res.(404).send("Sorry , incorrect e-mail address")
                                }
                        })
                });
                }
                if(userType == "pharmacy"){

                        MongoClient.connect(url, function(err, db) {

                            db.collection('pharmacy').find({email:userEmail}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){

                                        res.status(200).send("pharmacy Exists")
                                }
                                else{
                                        res.(404).send("Sorry , incorrect e-mail address")
                                }
                        })
                });
                }

        }else{
            res.status(401).send()
        }

   
})
/*******************************************End Of check user Endpoint ***************************/


/*----------------------- Start of changePassword--------------------------*/
app.put('/changePassword', staticUserAuth,function(req, res){



                var userType = req.body.type
                var userEmail = req.body.email
                var userPassword = (require('crypto').createHash('md5').update(req.body.password).digest('hex')).toString();
                var requestToken = req.body.token

                var serverToken = (require('crypto').createHash('md5').update(userEmail).digest('hex')).toString();

                if(serverToken == requestToken){
                if(userType == "user"){

                                MongoClient.connect(url, function(err, db) {
                                    db.collection('users').update(
                                            {email: userEmail},
                                            {
                                                $set:
                                                {
                                                    password: userPassword,
                                                },
                                            }
                                            function(err, result){

                                                    if(err) {throw err}
                                                    else{

                                                        res.status(200).send("Password updated successfully")
                                                    }        
                                            
                                    })
                                                    
                               });
                }
                if(userType == "pharmacy"){
                                MongoClient.connect(url, function(err, db) {
                                    db.collection('pharmacy').update(
                                            {email: userEmail},
                                            {
                                                $set:
                                                {
                                                    password: userPassword,
                                                },
                                            }
                                            function(err, result){

                                                    if(err) {throw err}
                                                    else{

                                                        res.status(200).send("Password updated successfully")
                                                    }        
                                            
                                    })
                                                    
                               });
                            }

        }else{
            res.status(401).send()
        }

});

/*---------------------------------- End Of changePassword ----------------*/


app.listen(3060, function() {
    console.log("Listening To Forget Password API !")
})
