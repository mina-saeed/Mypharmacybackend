const config = require('./config.json')
var express = require('express');
var passport = require('passport');
var request = require('request');
var cors = require('cors')
const fs = require('fs');
let http = require('http').Server(app);
var Strategy = require('passport-facebook').Strategy;
var bodyParser = require("body-parser");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mypharmacy";
const basicAuth = require('./basicAuth.js')
var cookieParser = require('cookie-parser');
var session = require('express-session');
const datetime = require('node-datetime');
var multer = require('multer');
const fileUpload = require('express-fileupload');
const mongo = require('mongodb')
let io = require('socket.io')(http);
var app = express()

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

                app.post('/order/submit',staticUserAuth, function(req,res){

                        var order_userID = 1
                        var order_userLocation = 20
                        var user_order = 500

                        MongoClient.connect(url, function(err, db) {

                                if (err) throw err;

                                var order = {

                                        userID: order_userID,
                                        location: order_userLocation,
                                        order: user_order,
                                };
                                db.collection("orders").insertOne(order, function(err, res) {

                                        if (err){
                                                throw err
                                        }else{
                                      //          console.log(socket)
                                       //   db.collection('pharmacy').find({city:"Giza"}).toArray(function(err, pharmacies){
                                          //   socket.to('pharma@mail.com').emit('message', { text: 'data' });   
                                                io.emit('first',{type:'new-message', text:"Mesage"});   
                                              //  io.emit('message', Object.keys(io.sockets.manager.rooms) );



                                           
                                                   /* console.log(users['pharma@mail.com'].emit('add-message', "Hello"));
                                                         users['pharma@mail.com'].emit('add-message', "Hello");*/
/*                                                        for (let i = 0 ; i<pharmacies.length;i++){

                                                                if(pharmacies[i].deliverTo.includes("Alharam")){


                                                                        for (let x = 0 ; x< users.length;x++){
                                                                              //  let key =users[i]
                                                                         //     console.log(users[i])
                                                                              
                                                                              var online_pharmacy= users[i].split(",")
                                                                             var dbPharma = pharmacies[i].email
                                                                             var socketPharma = online_pharmacy[0]
                                                                             var socketIdPharma = online_pharmacy[1]
                                                                             //   console.log(dbPharma)
                                                                             var str = socketIdPharma.trim();
                                                                                
                                                                             if(dbPharma.trim() == socketPharma.trim()){
                                                                                console.log(str)

                                                                                        console.log("Done")

                                                                                }else{
                                                                                        console.log("Error")
                                                                                }
                                                                        }
                                                                }
                                                        }*/
                                             //   })
                                        }
                                        db.close();
                                })
                        })
                })





/*  socket.on('join', function (data) {
 
  	var user={
  		[data.email.email]:socket.id 
  	}
  	users.push(user)
     console.log(users)
   // socket.join(data.email); // We are using room of socket io
  //  console.log(io.sockets.adapter.rooms)
  });*/

/*socket.on('disconnect', function(){
    console.log('user disconnected');
});*/





/*app.get('/order',staticUserAuth,function(req,res){
    //res.redirect("/order")
})*/







http.listen(3008, () => {
  console.log('started on port 5000');
});
app.listen(3009, function() {
    console.log("Listening!")
})

function secondPriorty(){
         io.emit('second',{type:'new-message', text:"Mesage22"});  
}
setInterval(secondPriorty, 30000);
