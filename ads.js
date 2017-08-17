
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





/******************************* Get Confirmed Ads Endpoint ****************************************************/
app.get('/confirmedAds', staticUserAuth, function(req, res) {

        
                MongoClient.connect(url, function(err, db) {

                        db.collection('ads').find({confirmed:1}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){

                                        res.status(200).send(result)
                                }
                                else{
                                        res.status(404).send("Sorry , No Ads found")
                                }
                        })
                });
        

   
})
/*******************************************End Of confirmed Ads Endpoint ***************************/




/******************************* Get  Ads requests Endpoint ****************************************************/
app.get('/adsRequests', staticUserAuth, function(req, res) {

        
                MongoClient.connect(url, function(err, db) {

                        db.collection('ads').find({confirmed:0}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){

                                        res.status(200).send(result)
                                }
                                else{
                                        res.status(404).send("Sorry , No Ads found")
                                }
                        })
                });
        

   
})
/*******************************************End Of  Ads requests Endpoint ***************************/



/******************************* Get pharmacy Ads Requests Endpoint ****************************************************/
app.get('/pharmacyAdsRequests/:pahrmacyEmail', staticUserAuth, function(req, res) {

                var pahrmacy = req.params.pharmacyEmail
                MongoClient.connect(url, function(err, db) {

                        db.collection('ads').find({pahrmacy:pharmacyEmail}).toArray(function(err, result){
                                if(err){
                                        res.send("Error")
                                }
                                if(result.length >0){

                                        res.status(200).send(result)
                                }
                                else{
                                        res.status(404).send("Sorry , No Ads found")
                                }
                        })
                });
        

   
})
/*******************************************End Of pharmacy Ads Requests Endpoint ***************************/



/*--------------------------- Start Of create new Ads ------------------------------------*/
app.post('/newAds', staticUserAuth, function(req, res) {

    /*  console.log(req)*/
    var adsName = req.body.name
    var adsDescription = req.body.description
    var adsStart = req.body.start
    var adsEnd = req.body.end
    var adsLink = req.body.link
    var adsActive= req.body.active


    var image_name = req.files.image.name
    var uploadUrl = '/var/www/html/uploads/ads/'+image_name
    var image_url = 'http://146.185.148.66/uploads/ads/'+image_name

    var file;

    if(!req.files)
    {
        resp.send("Image was not found");
        return;
    }

    file = req.files.image;  // here is the field name of the form

    file.mv(uploadUrl, function(err)  //Obvious Move function
        {
              //console.log(err)
        });

MongoClient.connect(url, function(err, db) {    
    db.collection('ads').find({name: adsName}).toArray(function(err, result){

        if(err){
            res.send("Error")
        }
        if(result.length >0){
            console.log(result)
            res.send("Beauty Product already exists")
        }
        else{
            var adsObj={
                name: adsName,
                description: adsDescription,
                start : adsStart,
                end: adsEnd,
                link: adsLink,
                active: adsActive,
                adsImage: image_url,
                confirmed:1,
                pahrmacy:''
            };
            db.collection('ads').insertOne(adsObj , function(err, output){
                
                if(err){

                    console.log("error Is : ")
                }else{

                   
                    res.send('New Advertisment added')
                }
            })
        }
    })
                        
   });
   
})
/*--------------------------- end of create new Ads ------------------------------------*/




/*--------------------------- Start Of request Ads ------------------------------------*/
app.post('/requestAds', staticUserAuth, function(req, res) {

    /*  console.log(req)*/
    var adsName = req.body.name
    var adsDescription = req.body.description
    var adsStart = req.body.start
    var adsEnd = req.body.end
    var adsLink = req.body.link
    var adsActive= req.body.active
    var pharmacyEmail= req.body.pharmacy

    var image_name = req.files.image.name
    var uploadUrl = '/var/www/html/uploads/ads/'+image_name
    var image_url = 'http://146.185.148.66/uploads/ads/'+image_name

    var file;

    if(!req.files)
    {
        resp.send("Image was not found");
        return;
    }

    file = req.files.image;  // here is the field name of the form

    file.mv(uploadUrl, function(err)  //Obvious Move function
        {
              //console.log(err)
        });

MongoClient.connect(url, function(err, db) {    
    db.collection('ads').find({name: adsName}).toArray(function(err, result){

        if(err){
            res.send("Error")
        }
        if(result.length >0){
            console.log(result)
            res.send("Beauty Product already exists")
        }
        else{
            var adsObj={
                name: adsName,
                description: adsDescription,
                start : adsStart,
                end: adsEnd,
                link: adsLink,
                active: adsActive,
                adsImage: image_url,
                confirmed:0,
                pahrmacy:pharmacyEmail
            };
            db.collection('ads').insertOne(adsObj , function(err, output){
                
                if(err){

                    console.log("error Is : ")
                }else{

                   
                    res.send('New Advertisment request sent')
                }
            })
        }
    })
                        
   });
   
})
/*--------------------------- end of request Ads ------------------------------------*/


/*----------------------- Start of Update Ads--------------------------*/
app.put('/updateAds', staticUserAuth,function(req, res){

    /*  console.log(req)*/
    var adsName = req.body.name
    var adsDescription = req.body.description
    var adsStart = req.body.start
    var adsEnd = req.body.end
    var adsLink = req.body.link
    var adsActive= req.body.active


    var image_name = req.files.image.name
    var uploadUrl = '/var/www/html/uploads/ads/'+image_name
    var image_url = 'http://146.185.148.66/uploads/ads/'+image_name

    var file;

    if(!req.files)
    {
        resp.send("Image was not found");
        return;
    }

    file = req.files.image;  // here is the field name of the form

    file.mv(uploadUrl, function(err)  //Obvious Move function
        {
              //console.log(err)
        });

    

    MongoClient.connect(url, function(err, db) {
        db.collection('Ads').update(
                {_id: new mongo.ObjectID (productID)},
                {$set:
                        {
                            name: adsName,
                            description: adsDescription,
                            start : adsStart,
                            end: adsEnd,
                            link: adsLink,
                            active: adsActive,
                            adsImage: image_url,
                        },       
                },
                function(err, result){

                        if(err) {throw err}
                        else{

                            res.status(200).send("Ads updated")
                        }        
                }
        )
                        
   }); 

});

/*---------------------------------- End Of Update Ads----------------*/

/*----------------------- Start of Delete product--------------------------*/
app.delete('/deleteAds', staticUserAuth,function(req, res){

    var adsID = req.query.id
    
    MongoClient.connect(url, function(err, db) {
        db.collection('ads').deleteOne({_id: new mongo.ObjectID (adsID) } , function(err, obj){

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

app.listen(3050, function() {
    console.log("Listening To Ads API !")
})
