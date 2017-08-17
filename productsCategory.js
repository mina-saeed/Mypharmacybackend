
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


/*--------------------------- Start Of create new category ------------------------------------*/
app.post('/new', staticUserAuth, function(req, res) {


    var category_name_ar = req.body.name_ar
    var category_name = req.body.name_en
    var category_description_ar = req.body.description_ar
    var category_description_en = req.body.description_en
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
                                        name_ar: category_name_ar,
                                        name_en: category_name,
                                        description_ar: category_description_ar,
                                        description_en: category_description_en,
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





    var subCategory_name_ar = req.body.name_ar
    var subCategory_name = req.body.name_en
    var subCategory_catID = req.body.catID
    var subCategory_description_ar = req.body.description_ar
    var subCategory_description = req.body.description_en
    var image_name = req.files.image.name
    var uploadUrl = '/var/www/html/uploads/productSubCategory/'+image_name
    var image_url = 'http://146.185.148.66/uploads/productSubCategory/'+image_name

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
                                        name_ar: subCategory_name_ar,
                                        name_en: subCategory_name,

                                        description_ar: subCategory_description_ar,
                                        description_en: subCategory_description,
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
        var category_id =req.params.catID

            //console.log(category_id)
        MongoClient.connect(url, function(err, db) {    
                db.collection('productSubCategory').find({catID: category_id}).toArray(function(err, result){

                        if(err){
                                res.send("Error")
                        }
                        if(result.length >0){
                                console.log(result)
                                // res.send(result)
                                 res.status(200).send(result)
                        }
                        else{
                           res.status(404).send("No data found")
                }
        })
        });
})
/*--------------------------- end of get Product sub-category ------------------------------------*/








/*----------------------- Start of Update Product Category --------------------------*/
app.put('/updateCategory', staticUserAuth,function(req, res){



    var category_name_ar = req.body.name_ar
    var category_name = req.body.name_en
    var category_description_ar = req.body.description_ar
    var category_description_en = req.body.description_en
    var image_name = req.files.image.name
    var uploadUrl = '/var/www/html/uploads/productCategory/'+image_name
    var image_url = 'http://146.185.148.66/uploads/productCategory/'+image_name
    var cat_ID = req.body.id
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
        db.collection('productCategory').update(
                {_id: new mongo.ObjectID (cat_ID)},
                {$set:
                        {
                            name_en: category_name_en,
                            name_ar: category_name_ar,

                            description_ar: category_description_ar,
                            description_en: category_description_en
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

    var cat_ID = req.params.id
    	console.log(cat_ID)
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
    var subCategory_name_ar = req.body.name_ar
    var subCategory_name_en = req.body.name_en
    var subCategory_catID = req.body.catID
    var subCategory_description_ar = req.body.description_ar
    var subCategory_description_en = req.body.description_en
    var image_name = req.files.image.name
    var uploadUrl = '/var/www/html/uploads/productSubCategory/'+image_name
    var image_url = 'http://146.185.148.66/uploads/productSubCategory/'+image_name

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
        db.collection('productSubCategory').update(
                {_id: new mongo.ObjectID (sub_ID)},
                {$set:
                        {
                            catID: subCategory_catID,
                            name_ar: subCategory_name_ar,
                            name_en: subCategory_name,

                            description_ar: subCategory_description_ar,
                            description_en: subCategory_description,
                            subImage: image_url
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

    var sub_ID = req.params.id
  
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
