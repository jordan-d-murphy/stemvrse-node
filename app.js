// stemvrse node app 
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const admin = require('firebase-admin');
const serviceAccount = process.env.SERVICEACCOUNT
const PORT = process.env.PORT || 3000;
const io = require('socket.io')(server);
var firebase = require('firebase');
require('firebase/auth');
require('firebase/database');


const config = {
    "apiKey": process.env.FIREBASEAPIKEY,
    "authDomain": process.env.AUTHDOMAIN,
    "databaseURL": process.env.DATABASEURL,
    "projectId": process.env.PROJECTID,
    "storageBucket": process.env.STORAGEBUCKET,
    "messagingSenderId": process.env.MESSAGINGSENDERID,
    "serviceAccount": process.env.SERVICEACCOUNT 
  }

firebase.initializeApp(config); 


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets/', express.static('./assets'));

app.get('/', (req, res) => {     
    res.sendFile('login.html',{root: __dirname});
});

// app.post("/firebase-login", function(req, res){
//     admin.auth().verifyIdToken(req.body.idToken)
//     .then(function(decodedToken) {
//         console.log(JSON.stringify(decodedToken));

//     }).catch(function(error) {
//         res.json(error);
//     });
// });

app.get('/home', isAuthenticated, (req, res) => {
    console.log("\n\nGET /home   - user login \n\n")
    res.sendFile('home.html',{root: __dirname});
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    console.log("\n\nGET /dashboard   - admin login \n\n")
    res.sendFile('index.html',{root: __dirname});
});



io.on("connection", function (socket) {
    socket.on("loadData", function (notification_request) {
        console.log("loadData event from socket.io!");
        getDataFromFirebase();
    });
    socket.on("deleteUser", function (username) {  
        console.log("username is " + username)
        deleteUser(username);
    });
    socket.on("editUser", function (userInfo) {  
        editUser(userInfo);
    });
    socket.on("createUser", function (userInfo) {  
        createUser(userInfo);
    });
    // socket.on("loadRaidData", function (notification_request) {  
    //     getRaidDataFromFirebase();
    // });
});


server.listen(PORT, () => {
    console.log("Listening on port " + PORT);
    setUpFirebase();
});


function setUpFirebase() {
    console.log("setUpFirebase()")
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(serviceAccount)),
                databaseURL: "https://stemvrse-node.firebaseio.com"
            });
            console.log("firebase initialized!");
        }


function getDataFromFirebase() {
    var db = admin.database();
    var ref = db.ref("testdata");
    console.log("getDataFromFirebase()");
    ref.on("value", function(snapshot) {
        data = snapshot.val()
        if (data) {
            io.emit('newData', JSON.stringify(data));
        } else {
            io.emit('newData', null);
        }
    });
}
        


function deleteUser(username) {
    var db = admin.database();
    var ref = db.ref("testdata/" + username);
    console.log("deleteUser(" + username + ")");
    ref.remove();
}
        


function editUser(userInfo) {
    var db = admin.database();
    var ref = db.ref("testdata/" + userInfo.username); 
    console.log("editUser(" + userInfo.username + ")"); 
    updatedUserData = { 
            account: userInfo.account,
            email: userInfo.email,
            phone: userInfo.phone
         }
    ref.update(updatedUserData)
}
        


function createUser(userInfo) {
    var db = admin.database();
    var ref = db.ref("testdata/" + userInfo.username); 
    console.log("createUser(" + userInfo.username + ")");
    updatedUserData = { 
            account: userInfo.account,
            email: userInfo.email,
            phone: userInfo.phone
         }
    ref.set(updatedUserData);
}
        


function isAuthenticated(req, res, next){
   var user = firebase.auth().currentUser;
      if (user !== null) {
        req.user = user;
        next();
      } else {
        res.redirect('/login');
      }
}