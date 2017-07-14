
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
                db.collection('productCategory').find({name: category_name}).toArray(function(err, result){

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
                        
                        db.collection('productCategory').insertOne(category , function(err, output){

                                if(err){
                                        console.log("error Is : "+err)
                                }else{
                                        res.send('one product Category has been added')
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

                        db.collection('productCategory').find({}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){

                                        res.status(200).send(result)
                                }
                                else{
                                        res.send("Sorry , No product Category found")
                                }
                        })
                });
        

   
})
/*******************************************End Of All categorys ***************************/



/*--------------------------- Start Of create new sub-category ------------------------------------*/
app.post('/addSubCategory', staticUserAuth, function(req, res) {
        // console.log(req)
        var subCategory_name = req.body.name
        var subCategory_catID = req.body.catID
        var subCategory_description = req.body.description


        MongoClient.connect(url, function(err, db) {    
                db.collection('productSubCategory').find({name: subCategory_name}).toArray(function(err, result){

                        if(err){
                                res.send("Error")
                        }
                        if(result.length >0){
                                console.log(result)
                                res.status(409).send("Product sub-category already exists")
                        }
                        else{

                                var subCategory={
                                        catID: subCategory_catID,
                                        name: subCategory_name,
                                        description: subCategory_description,
                                };
                        
                        db.collection('productSubCategory').insertOne(subCategory , function(err, output){

                                if(err){
                                        console.log("error Is : "+err)
                                }else{
                                        res.send('one Product sub-category has been added')
                                }
                        })
                }
        })
        });
})
/*--------------------------- end of create new sub-category ------------------------------------*/

/*--------------------------- Start Of Get Product sub-categories ------------------------------------*/
app.get('/allSubCategories/:catID', staticUserAuth, function(req, res) {
        // console.log(req)
        var category_id = parseInt(req.params.catID)

            console.log(category_id)
        MongoClient.connect(url, function(err, db) {    
                db.collection('productSubCategory').find({catID: category_id}).toArray(function(err, result){

                        if(err){
                                res.send("Error")
                        }
                        if(result.length >0){
                                console.log(result)
                                res.send(result)
                        }
                        else{
                            res.status(404).send(result)
                }
        })
        });
})
/*--------------------------- end of get Product sub-category ------------------------------------*/






app.listen(3007, function() {
    console.log("Listening To product Category API !")
})
