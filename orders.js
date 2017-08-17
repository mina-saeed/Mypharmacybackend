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


let http = require('http').Server(app);
let httpFirst = require('http').Server(app);
let httpSecond = require('http').Server(app);
let httpThird = require('http').Server(app);
let httpFourth = require('http').Server(app);
let httpFifth = require('http').Server(app);
let httpOrderConfirm = require('http').Server(app);
let io = require('socket.io')(http);
let ioFirst = require('socket.io')(httpFirst);
let ioSecond = require('socket.io')(httpSecond);
let ioThird = require('socket.io')(httpThird);
let ioFourth = require('socket.io')(httpFourth);
let ioFifth = require('socket.io')(httpFifth);
let ioOrderConfirm = require('socket.io')(httpOrderConfirm, { origins: '*:*'});


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


io.on('connection', (socket) => {
console.log("User Connected")
});


ioOrderConfirm.on('connection', (socket) => {
console.log("ioOrderConfirm Connected")
});
app.get('/allOrders/:userCookie', staticUserAuth, function(req, res) {

		var currentUser = req.params.userCookie
		var currentPharmacy_name=''

		var unconfirmedOrders = []
	   MongoClient.connect(url, function(err, db) {	
        db.collection('pharmacy').find({email: currentUser}).toArray(function(err, pharmacies){  

        		if(err){
        			console.log(err)
        			//throw err
        		}else{
        			if(pharmacies.length>0){
        		currentPharmacy_name = pharmacies[0].email
        		var pharmacy_deliverTo = pharmacies[0].deliverTo

        		db.collection("orders").find({confirmed :0}).toArray(function(err, allExistOrders){
        			if (err)
        				throw err
        			else{
        					if(allExistOrders.length>0){
        				        	for (let i = 0 ; i<allExistOrders.length;i++){

                                                                if(pharmacy_deliverTo.includes(allExistOrders[i].location)){
                                                           
                                                                	var deliverArray = pharmacy_deliverTo.split(',')

                                                                	for (var s = 0 ; s < deliverArray.length;s++){
                                                                            deliverArray[s] = deliverArray[s].replace(/[{()}]/g, '');
                                                                			var element = deliverArray[s].split(':')

                                                                			var key = element[0]
                                                                			var val = element[1]
                                                                			//console.log(val)

                                                                			if(key.trim() === allExistOrders[i].location.trim()){
                                                                				//console.log("matched")
                                                                				if(val==1){

                                                                					
                                                                                  //  console.log(pharmacies[i].email)
                                                                					unconfirmedOrders.push(allExistOrders[i])
                                                                				}


                                                                	}

                                                                }
                                                        }
                                                    }
                    //ioFirst.emit('first',{pharma: currentPharmacy_name, allOrders:unconfirmedOrders});                                
            	   	res.send({pharma: currentPharmacy_name, allOrders:unconfirmedOrders})                                    
                                                }else{
                                                		res.send("No Orders ")
                                                }
                                                
}

        		})
    		
}else{
	res.send("Error Username")
}
}
                                				


                                        })
                                        


      });

      });


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
                               // console.log(allPharmacies)
                            res.send({allPharmacies:allPharmacies, allOrders:allExistOrders})

                            })


                        }else{
                        }
                    }
                })
            });
        });



var secondPh=[]
//var secondOrder=[]
                app.post('/order/submit',staticUserAuth, function(req,res){


                       // var order_userLocation = 'Alharam'
                       console.log(req.body)
                       var user_orderCity = req.body.userInfo.city
                       var user_orderLocarion = req.body.userInfo.location
                       var user_orderAddress = req.body.userInfo.street
                       var user_orderType = req.body.type
                       var user_order = ""
                        var uploadUrl = ''
                        var image_url = ''
                        if(!req.files){
                            user_order = req.body.order
                        }else{
                            
                            var image_name = req.files.image.name
                            uploadUrl = '/var/www/html/uploads/prescription/'+image_name
                            user_order = 'http://146.185.148.66/uploads/prescription/'+image_name
                        }
                        MongoClient.connect(url, function(err, db) {

                                if (err) throw err;

                                var order = {

                                        userID: req.body.userInfo.userID,
                                        city: user_orderCity,
                                        location: user_orderLocarion,
                                        address: user_orderAddress,
                                        type: user_orderType,
                                        order: user_order,
                                        confirmed:0
                                };

                                db.collection("orders").insertOne(order, function(err, res) {

                                        if (err){
                                                throw err
                                        }else{
                                            console.log(order)
                                                var existPharmacies = []
                                          db.collection('pharmacy').find({city:user_orderCity}).toArray(function(err, pharmacies){
                                             				
                                                        for (let i = 0 ; i<pharmacies.length;i++){
                                                        	var deliver = pharmacies[i].deliverTo

                                                                if(deliver.includes(user_orderLocarion)){
                                                           
                                                                	var deliverArray = deliver.split(',')

                                                                	for (var s = 0 ; s < deliverArray.length;s++){
                                                                            deliverArray[s] = deliverArray[s].replace(/[{()}]/g, '');
                                                                			var element = deliverArray[s].split(':')

                                                                			var key = element[0]
                                                                			var val = element[1]
                                                                			//console.log(val)

                                                                			if(key.trim() === user_orderLocarion.trim()){
                                                                				//console.log("matched")
                                                                				if(val==1){

                                                                					console.log("1 sent ")
                                                                                  //  console.log(pharmacies[i].email)
                                                                					existPharmacies.push(pharmacies[i].email)
                                                                				}
                                                                                if(val==2){
                                                                                    //console.log(user_order)
                                                                                    secondPh.push(pharmacies[i].email)
                                                                                    //secondOrder.push(order)
                                                                                                                                                                    }
                                                                			}

                                                                	}

                                                                }
                                                        }
                                                        ioFirst.on('connection', (socket) => {
															console.log("first connected")
															});
                                                        ioFirst.emit('first',{data:existPharmacies , orders:order});


                                        })
                                        db.close();
                                }
                        })

                })
                  res.send("Order Saved")          
                })

                app.post('/confirmOrder',staticUserAuth, function(req,res){

                        var orderPharmacy = req.body.pharmacyEmail
                        var orderID = req.body.requestOrder
    					MongoClient.connect(url, function(err, db) {



    						if(err){
    							throw err
    						}else{


                            db.collection('orders').find({_id: new mongo.ObjectID (orderID) , confirmed:1}).toArray(function(err , result){

                                if(err){
                                    throw err
                                }else{
                                    if(result.length>0){
                                        res.status(409).send("Sorry , Order already confirmed")
                                    }else{


                                            db.collection("orders").update(
                                        {_id: new mongo.ObjectID (orderID)},
                                        {
                                            $set:
                                            {
                                                pahrmacy: orderPharmacy,
                                                confirmed:1
                                            },
                                        },
                                        function(err, result){

                                            if(err) {throw err}
                                                else{
                                                		var userOrder = ''
                                                        db.collection('pharmacy').find({email: orderPharmacy}).toArray(function(err , ph){

                                                            if(err){
                                                                throw err
                                                            }else{
                                                                var confirmedPharmacy = {
                                                                    name: ph[0].name,
                                                                    email:ph[0].email,
                                                                    deliveryTime: ph[0].time,
                                                                    location:{
                                                                        city:ph[0].city,
                                                                        location: ph[0].location,
                                                                        street:ph[0].street
                                                                    }
                                                                }

													                db.collection("orders").find({_id: new mongo.ObjectID (orderID)}).toArray(function(err, userOrder){

													                    if (err)
													                        throw err
													                    else{

													                        if(userOrder.length>0){

													                        		userOrder = userOrder
													                        }else{
													                        }
													                    }
													                })




                                                            }
                                                          ioOrderConfirm.emit('pharmacyConfirmed',{pharmacyInfo: confirmedPharmacy, order:orderID});
                                                          res.status(200).send({allOrders:orderID})
                                                          db.close()
                                                        })
                                            
                                                        
                                            
                                        }
                                    })
                                    }
                                    

                                }
                            })



                            
        				}
                       // db.close()
        				}); 
                })

http.listen(3008, () => {
  console.log('started on port 3008');
});
httpFirst.listen(3010, () => {
  console.log('started on port 3010');
});

httpOrderConfirm.listen(3015, () => {
  console.log('started on port 5000');
});
app.listen(3009, function() {
    console.log("Listening!")
})
