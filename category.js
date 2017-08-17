
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

/*--------------------------- Start Of create new category ------------------------------------*/
app.post('/new', staticUserAuth, function(req, res) {
        // console.log(req)
        var category_name = req.body.name
        var category_description = req.body.description
        var category_searchable = req.body.searchable


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
                                        searchable: category_searchable
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


/*--------------------------- Start Of create new sub-category ------------------------------------*/
app.post('/addSubCategory', staticUserAuth, function(req, res) {
        // console.log(req)
        var subCategory_name = req.body.name
        var subCategory_catID = req.body.catID
        var subCategory_description = req.body.description


        MongoClient.connect(url, function(err, db) {    
                db.collection('medicineSubCategory').find({name: subCategory_name}).toArray(function(err, result){

                        if(err){
                                res.send("Error")
                        }
                        if(result.length >0){
                                console.log(result)
                                res.status(409).send("Medicine sub-category already exists")
                        }
                        else{

                                var subCategory={
                                        catID: subCategory_catID,
                                        name: subCategory_name,
                                        description: subCategory_description,
                                };
                        
                        db.collection('medicineSubCategory').insertOne(subCategory , function(err, output){

                                if(err){
                                        console.log("error Is : "+err)
                                }else{
                                        res.send('one medicine sub-category has been added')
                                }
                        })
                }
        })
        });
})
/*--------------------------- end of create new sub-category ------------------------------------*/

/*--------------------------- Start Of Get medicine sub-categories ------------------------------------*/
app.get('/allSubCategories/:catID', staticUserAuth, function(req, res) {
        // console.log(req)
        var category_id = parseInt(req.params.catID)

            console.log(category_id)
        MongoClient.connect(url, function(err, db) {    
                db.collection('medicineSubCategory').find({catID: category_id}).toArray(function(err, result){

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
/*--------------------------- end of get medicine sub-category ------------------------------------*/


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



/*----------------------- Start of Update Medicine Category --------------------------*/
app.put('/updateCategory', staticUserAuth,function(req, res){

    var cat_ID = req.body.id
    var category_name = req.body.name
    var category_description = req.body.description
    var category_searchable = req.body.searchable

    MongoClient.connect(url, function(err, db) {
        db.collection('category').update(
                {_id: new mongo.ObjectID (cat_ID)},
                {$set:
                        {
                            name: category_name,
                            description: category_description,
                            searchable: category_searchable
                        },       
                },
                function(err, result){

                        if(err) {throw err}
                        else{

                            res.status(200).send("Medicine Category updated")
                        }        
                }
        )
                        
   }); 

});

/*---------------------------------- End Of Update Medicine Category ----------------*/

/*----------------------- Start of Delete Medicine Category --------------------------*/
app.delete('/deleteCategory/:id', staticUserAuth,function(req, res){

    var cat_ID = req.body.id
    
    MongoClient.connect(url, function(err, db) {
        db.collection('category').remove({_id: new mongo.ObjectID (cat_ID) } , function(err, obj){

            if(err)
                throw err
            if(obj){
                res.status(200).send()
            }
        })


    })
});

/*---------------------------------- End Of delete Medicine Category ----------------*/




/*----------------------- Start of Update Medicine Sub-Category --------------------------*/
app.put('/updateSubCategory', staticUserAuth,function(req, res){

    var sub_ID = req.body.id
    var subCategory_name = req.body.name
    var subCategory_description = req.body.description


    MongoClient.connect(url, function(err, db) {
        db.collection('medicineSubCategory').update(
                {_id: new mongo.ObjectID (sub_ID)},
                {$set:
                        {
                            name: subCategory_name,
                            description: subCategory_description,
                        },       
                },
                function(err, result){

                        if(err) {throw err}
                        else{

                            res.status(200).send("Medicine Sub-Category updated")
                        }        
                }
        )
                        
   }); 

});

/*---------------------------------- End Of Update Medicine Sub-Category  ----------------*/

/*----------------------- Start of Delete Medicine Sub-Category  --------------------------*/
app.delete('/deleteSubCategory/:id', staticUserAuth,function(req, res){

    var sub_ID = req.body.id
    
    MongoClient.connect(url, function(err, db) {
        db.collection('medicineSubCategory').remove({_id: new mongo.ObjectID (sub_ID) } , function(err, obj){

            if(err)
                throw err
            if(obj){
                res.status(200).send()
            }
        })


    })
});

/*---------------------------------- End Of delete Medicine Sub-Category  ----------------*/
app.listen(3006, function() {
    console.log("Listening To categories API !")
})
