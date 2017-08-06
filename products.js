
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





/******************************* Get all Products Endpoint ****************************************************/
app.get('/all', staticUserAuth, function(req, res) {

        
                MongoClient.connect(url, function(err, db) {

                        db.collection('beauty').find({}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){

                                        res.status(200).send(result)
                                }
                                else{
                                        res.send("Sorry , No Products found")
                                }
                        })
                });
        

   
})
/*******************************************End Of All Products Endpoint ***************************/







/*--------------------------- Start Of create new product ------------------------------------*/
app.post('/new', staticUserAuth, function(req, res) {

		console.log(req)
    var beauty_name = req.body.name
    var beauty_category = req.body.category
    var beauty_subCategory = req.body.sub
    var beauty_barcode = req.body.barcode
    var beauty_description = req.body.description
    var beauty_price = req.body.price
    var beauty_pharmaID = req.body.pharmacyID
    var beauty_creator = req.body.creator


    var image_name = req.files.image.name
    var uploadUrl = '/var/www/html/uploads/products/'+image_name
    var image_url = 'http://146.185.148.66/uploads/products/'+image_name

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
    db.collection('beauty').find({barcode: beauty_barcode}).toArray(function(err, result){

        if(err){
            res.send("Error")
        }
        if(result.length >0){
            console.log(result)
            res.send("Beauty Product already exists")
        }
        else{
            var beauty={
                name: beauty_name,
                category: beauty_category,
                subCategory: beauty_subCategory,
                barcode : beauty_barcode,
                description: beauty_description,
                price : beauty_price,
                ProductImage: image_url,
                pharmacyID: beauty_pharmaID,

            };
            db.collection('beauty').insertOne(beauty , function(err, output){
                
                if(err){

                    console.log("error Is : ")
                }else{

                   
                    res.send('one beauty product has been added')
                }
            })
        }
    })
                        
   });
   
})
/*--------------------------- end of create new product ------------------------------------*/

/*----------------------- Start of Update product--------------------------*/
app.put('/updateProduct', staticUserAuth,function(req, res){

    var productID = req.body.id
    var beauty_name = req.body.name
    var beauty_category = req.body.category
    var beauty_subCategory = req.body.sub
    var beauty_barcode = req.body.barcode
    var beauty_description = req.body.description
    var beauty_price = req.body.price
    var beauty_pharmaID = req.body.pharmacyID
    var beauty_creator = req.body.creator
    

    MongoClient.connect(url, function(err, db) {
        db.collection('beauty').update(
                {_id: new mongo.ObjectID (productID)},
                {$set:
                        {
                            name: beauty_name,
                            category: beauty_category,
                            subCategory: beauty_subCategory,
                            barcode : beauty_barcode,
                            description: beauty_description,
                            price : beauty_price,
                            pharmacyID: beauty_pharmaID,
                            creator: beauty_creator
                        },       
                },
                function(err, result){

                        if(err) {throw err}
                        else{

                            res.status(200).send("Product updated")
                        }        
                }
        )
                        
   }); 

});

/*---------------------------------- End Of Update product----------------*/

/*----------------------- Start of Delete product--------------------------*/
app.delete('/deleteProduct', staticUserAuth,function(req, res){

    var productID = req.query.id
    
    MongoClient.connect(url, function(err, db) {
        db.collection('beauty').deleteOne({_id: new mongo.ObjectID (productID) } , function(err, obj){

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

/*---------------------------------- End Of delete product ----------------*/

app.listen(3005, function() {
    console.log("Listening To Beauty Products API !")
})
