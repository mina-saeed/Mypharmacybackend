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
let ioOrderConfirm = require('socket.io')(httpOrderConfirm);


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
ioFirst.on('connection', (socket) => {
console.log("first connected")
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
                                    FirstPharmacies = allPharmacies
                                }


                            })

                            res.send({allPharmacies:FirstPharmacies, allOrders:allExistOrders})
                        }else{
                            res.send("No Orders ")
                        }
                    }
                })
            });
        });



var secondPh=[]
//var secondOrder=[]
                app.post('/order/submit',staticUserAuth, function(req,res){

                        var order_userLocation = 'Alharam'

                        MongoClient.connect(url, function(err, db) {

                                if (err) throw err;

                                var order = {

                                        userID: req.body.userID,
                                        location: order_userLocation,
                                        order: req.body.user_order,
                                        confirmed:0
                                };
                                db.collection("orders").insertOne(order, function(err, res) {

                                        if (err){
                                                throw err
                                        }else{
                                                var existPharmacies = []
                                          db.collection('pharmacy').find({city:"Giza"}).toArray(function(err, pharmacies){
                                             				
                                                        for (let i = 0 ; i<pharmacies.length;i++){
                                                        	var deliver = pharmacies[i].deliverTo

                                                                if(deliver.includes(order_userLocation)){
                                                           
                                                                	var deliverArray = deliver.split(',')

                                                                	for (var s = 0 ; s < deliverArray.length;s++){
                                                                            deliverArray[s] = deliverArray[s].replace(/[{()}]/g, '');
                                                                			var element = deliverArray[s].split(':')

                                                                			var key = element[0]
                                                                			var val = element[1]
                                                                			//console.log(val)

                                                                			if(key.trim() === order_userLocation.trim()){
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
                							
                                                        //  ioOrderConfirm.emit('pharmcyConfirmed',{order:orderID});
                                                        res.status(200).send({allOrders:orderID})
                							
                						}
                					})
        				}
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
