
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


    var category_name = req.body.name
    var category_description = req.body.description
    var image_name = req.files.image.name
    var uploadUrl = '/var/www/html/uploads/productCategory/'+image_name
    var image_url = 'http://146.185.148.66/uploads/productCategory/'+image_name

    var file;

    if(!req.files)
    {
        resp.send("File was not found");
        return;
    }

    file = req.files.image;  // here is the field name of the form

    file.mv(uploadUrl, function(err)  //Obvious Move function
        {
              //console.log(err)
        });

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
                                        CategoryImage: image_url
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





    var subCategory_name = req.body.name
    var subCategory_catID = req.body.catID
    var subCategory_description = req.body.description
    var image_name = req.files.image.name
    var uploadUrl = '/var/www/html/uploads/productCategory/'+image_name
    var image_url = 'http://146.185.148.66/uploads/productCategory/'+image_name

    var file;

    if(!req.files)
    {
        resp.send("File was not found");
        return;
    }

    file = req.files.image;  // here is the field name of the form

    file.mv(uploadUrl, function(err)  //Obvious Move function
        {
              //console.log(err)
        });

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
                                        subImage: image_url
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








/*----------------------- Start of Update Product Category --------------------------*/
app.put('/updateCategory', staticUserAuth,function(req, res){

    var cat_ID = req.body.id
    var category_name = req.body.name
    var category_description = req.body.description


    MongoClient.connect(url, function(err, db) {
        db.collection('productCategory').update(
                {_id: new mongo.ObjectID (cat_ID)},
                {$set:
                        {
                            name: category_name,
                            description: category_description,
                        },       
                },
                function(err, result){

                        if(err) {throw err}
                        else{

                            res.status(200).send("Product Category updated")
                        }        
                }
        )
                        
   }); 

});

/*---------------------------------- End Of Update product Category ----------------*/

/*----------------------- Start of Delete product Category --------------------------*/
app.delete('/deleteCategory/:id', staticUserAuth,function(req, res){

    var cat_ID = req.body.id
    
    MongoClient.connect(url, function(err, db) {
        db.collection('productCategory').remove({_id: new mongo.ObjectID (cat_ID) } , function(err, obj){

            if(err)
                throw err
            if(obj){
                res.status(200).send()
            }
        })


    })
});

/*---------------------------------- End Of delete product Category ----------------*/




/*----------------------- Start of Update product Sub-Category --------------------------*/
app.put('/updateSubCategory', staticUserAuth,function(req, res){

    var sub_ID = req.body.id
    var subCategory_name = req.body.name
    var subCategory_description = req.body.description


    MongoClient.connect(url, function(err, db) {
        db.collection('productSubCategory').update(
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

                            res.status(200).send("Product Sub-Category updated")
                        }        
                }
        )
                        
   }); 

});

/*---------------------------------- End Of Update product Sub-Category  ----------------*/

/*----------------------- Start of Delete product Sub-Category  --------------------------*/
app.delete('/deleteSubCategory/:id', staticUserAuth,function(req, res){

    var sub_ID = req.body.id
    
    MongoClient.connect(url, function(err, db) {
        db.collection('productSubCategory').remove({_id: new mongo.ObjectID (sub_ID) } , function(err, obj){

            if(err)
                throw err
            if(obj){
                res.status(200).send()
            }
        })


    })
});

/*---------------------------------- End Of delete product Sub-Category  ----------------*/



app.listen(3007, function() {
    console.log("Listening To product Category API !")
})
