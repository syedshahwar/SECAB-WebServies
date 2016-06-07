var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var uri = 'mongodb://localhost:27017/SECAB';
var request = require('request');
var http = require('http');
var isodate = require("isodate");

//Database variables
var db;
var users;    //for Users collection
var devicesState; //for DeviceState collection
var history;  //for History collection
var voltageSurges; //for VoltageSurges collection


//--------------------------------------------------//


app.use(express.static(__dirname));
app.engine('html', require('ejs').renderFile);

app.use(session({secret: 'ssshhhhh'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


MongoClient.connect(uri, function (err, database) {
  if(!err) 
  {
    users = database.collection('Users');
    devicesState = database.collection('DeviceState');
    history = database.collection('History');
    voltageSurges = database.collection('VoltageSurges');        

    console.log('Connection established to', uri);

  } 
  else 
  {
    console.log('Unable to connect to the mongoDB server. Error:\n\n', err);
  }
});



//Start the application , listening at port 8080
//var server = app.listen(8080,'192.168.43.97',function () {
var server = app.listen(8080,function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('express app listening at http://%s:%s',host,port);

});


//signup

app.post("/signup",function(req,res){

  var userName = req.body.uName;
  var email = req.body.mail;
  var passwordHash = req.body.pass;

  var user = {"UserName": userName, "Email": email, "Password": passwordHash };
    
    // Insert user
    users.insert(user, function (err, result) {
      if(!err) 
      {
        res.end("Inserted");
        console.log('Inserted %d documents into the "Users" collection. The documents inserted with "_id" are:', result.length, result);  
      } 
      else 
      {
        res.end("Error");
        console.log("Error while inserting data into Users\n\n", err); 
      }

    });
});

//login

app.post("/login",function(req,res){

  var email = req.body.email;
  var passwordHash = req.body.pass;

  users.find({"Email": email, "Password": passwordHash}).toArray(function (err, result) {

    if(!err)
    {
      //console.log("length",result.length);
      if(result.length==1)
      {
        req.session.email=email; 
        req.session.username=result[0].UserName;
        res.end("Logged In");
      }
      else
      {
        res.end("Incorrect");
      }  
    }      

    else
    {
       console.log("Error while getting document(s). \n\n", err);
    }

  });   

});



//session check

app.get('/sessionCheck', function(req,res){

  var responseString = {status:"", uName:""};
  
  if(req.session.email)
  {
    responseString.status="correct";
    responseString.uName=req.session.username;
    res.json(responseString);
    res.end();
  }
  else
  {
    res.end("Incorrect");
  }
});


//logout

app.get('/logout',function(req,res){

  req.session.destroy(function(err){
    if(!err){

      res.end("Session Destroyed");
    }
    else
    {
      console.log(err);
    }
  });

});


//store the data of every minute if receiving from board

app.get("/board",function(req,res){

  var str;
  var subStrs;
  var noOfDevices;
  var dateTime;

  var i;
  var hist;            //to store every minute history in History collection of database
  var data;            //array to store value of each argument of every device after spliting
  var histObj;         //to store data in database

  //str = "230-4;0.9;100;0.3;13-6;0.8;112;0.4;18";
 // str ="230-v";
  console.log("oooookkkkkkkk!!!");

  //console.log(req.query.details);

  str = req.query.details;
  subStrs = str.split("-");
  noOfDevices = subStrs.length-1;

  dateTime = GetDateString(0);            //Calling my function to get current date and time  

  console.log(dateTime);

  if(subStrs[1]=="V")
  {
    hist = '{"UserName":"shahwar", "BoardID":"b1@shahwar", "DateTime":'+dateTime +', "Voltage":'+ subStrs[0] +', "UsageStatus":0 }';
  }

  else
  {
    hist = '{"UserName":"shahwar", "BoardID":"b1@shahwar", "DateTime":'+dateTime +', "Voltage":'+ subStrs[0] +', "UsageStatus":1' +', "Devices":[';

    for (i = 1 ; i <= noOfDevices ; i++) 
    {
      data = subStrs[i].split(";");
      /*  energy conversion from joule to kWh*/
      data[4] = data[4] / (3600*1000);
      hist+='{"DeviceNumber":'+data[0]+', "Current":'+data[1]+', "RealPower":'+data[2]+', "PowerFactor":'+data[3]+', "Energy":'+data[4]+'}';
      if (i!=noOfDevices)
      {
        hist+=',';
      } 
    };

    hist+=']}';
  }

  histObj = JSON.parse(hist);

  history.insert(histObj, function (err, result) {
    if(!err) 
    {
      res.end("Inserted");
      console.log('Inserted documents into the "History" collection. The documents inserted with "_id" are:', result.length, result);  
    } 
    else 
    {
      res.end("Error");
      console.log("Error while inserting data into History collection\n\n", err); 
    }    
  });

});


//store voltage surges received from board
app.get("/voltageSurge",function(req,res){
  
  var dateTime;
  var surge;
  
  surge = req.query.surge;
  
  dateTime = GetDateString(0);            //Calling my function to get current date and time  
  dateTime = JSON.parse(dateTime);

  voltageSurges.insert({"UserName":"shahwar", "BoardID":"b1@shahwar", "DateTime":dateTime, "VoltageSurge":surge }, function (err, result) {
    if(!err) 
    {
      res.end("Inserted");
      console.log('Inserted documents into the "VoltageSurges" collection. The documents inserted with "_id" are:', result.length, result);  
    } 
    else 
    {
      res.end("Error");
      console.log("Error while inserting data into VoltageSurges collection\n\n", err); 
    }    
  });

});


// Devices' States . Get the states of devices from database on load of view board html page

app.get('/DeviceStateAndParameters',function(req,res){


  var dateTime;
  var now;
  var aMinBefore;
  var responseString = {status:"", states:[], resultStatus:"", data:[], devicesWithData:[]};

  devicesState.find({"UserName":"shahwar", "BoardID":"b1@shahwar"}).toArray(function (err, result) {

    if(!err)
    {
      responseString.status="Correct";
      responseString.states.push(result[0].device1);
      responseString.states.push(result[0].device2);
      responseString.states.push(result[0].device3);
      responseString.states.push(result[0].device4);
    }  

    else
    {
      console.log("Error while getting document(s) from DeviceState collection. \n\n", err);
      responseString.status="Incorrect";
    }

  }); 

  now = new Date();
  aMinBefore = now - 60*1000;

  dateTime = GetDateString(aMinBefore);            //Calling my function to get current date and time  
  dateTime = JSON.parse(dateTime);
  console.log(dateTime);

  //history.find({}).sort({_id:-1}).limit(1).toArray(function (err, result) {
  //});
  
  history.find({"UserName":"shahwar", "BoardID":"b1@shahwar", "DateTime":dateTime}).toArray(function (err, result) {
    if(!err)
    {

      if(result.length==1)
      {
        responseString.resultStatus = "Found";
        
        if(result[0].UsageStatus==1)
        {
          responseString.data = result;

          for(var i=0; i<result[0].Devices.length; i++)
          {
            responseString.devicesWithData.push(result[0].Devices[i].DeviceNumber);
          }
        }

        else
        {
          responseString.data = result;
        }
        
        res.json(responseString);
        res.end();
      }
      else
      {
        responseString.resultStatus = "Not Found";
        res.json(responseString);
        res.end();
      }
    }
    else
    {
      console.log("Error while getting document(s) from History collection for Board parameters display. \n\n", err);
    }
  });

});


// Devices' Control from web server i.e sending request to board from server

app.post('/DeviceControl', function(req,res){

  var states;
  var noOfDevices;
  var board;
  var boardObj;
  var updatedStates;
  var updatedStatesObj;

  var addr = "http://192.168.43.63:80/?deviceState="+req.body.state;

  request.get(addr, function(err, response, body){

    if (!err) 
    {
      states=body.split("");
      noOfDevices = states.length;
      
      board ='{"UserName":"shahwar", "BoardID":"b1@shahwar"}';
      updatedStates='{"$set":{';

      for(var i=0; i<noOfDevices; i++)
      {
        updatedStates+= '"device'+(i+1)+'":'+states[i]+'';
        if (i!=noOfDevices-1)
        {
          updatedStates+=',';
        } 
      }
      updatedStates+= '}}';

      boardObj = JSON.parse(board);
      updatedStatesObj =  JSON.parse(updatedStates);
      
      devicesState.updateOne(boardObj, updatedStatesObj,  function(err, result){

        if(!err)
        {
          res.end("Updated");
        }
        else
        {
          res.end("Failed");
        }

      });
      
    }
    else 
    {
      console.log("Device Control(err): "+err);
    }
  });

});


//Update Devices' States after change is made on board i.e controlling device from board

app.get("/updateStates",function(req,res){

  states=req.query.states.split("");
  noOfDevices = states.length;
      
  board ='{"UserName":"shahwar", "BoardID":"b1@shahwar"}';
  updatedStates='{"$set":{';

  for(var i=0; i<noOfDevices; i++)
  {
    updatedStates+= '"device'+(i+1)+'":'+states[i]+'';
    if (i!=noOfDevices-1)
    {
      updatedStates+=',';
    } 
  }
  updatedStates+= '}}';

  boardObj = JSON.parse(board);
  updatedStatesObj =  JSON.parse(updatedStates);
      
  devicesState.updateOne(boardObj, updatedStatesObj,  function(err, result){
    if(!err)
    {
      res.end("Updated");
    }
    else
    {
      res.end("Failed");
    }
  });

});


//Energy for last 24 hours Energy Meter

app.post('/energyMeter', function(req,res){
  console.log("meter "+req.session.email);

  var deviceNumber = req.body.deviceNumber;
  var responseString = {status:"", dateS:"", dateE:"", data:[]};
  
  var now;                //time and date now
  var aDayBefore;         //time ane date one day before i.e. 24hrs less
  var dateTimeS;
  var dateTimeE;

  var histSearch;
  var histSelection;
  var histSearchObj;
  var histSelectionObj;

  now = new Date();
  aDayBefore = now - 24*60*60*1000;

  dateTimeS = GetDateString(aDayBefore);     //Calling my function to get date time of 24hrs back, aDayBefore is in miliseconds and date time of 24hrs back
  dateTimeE = GetDateString(0);              //Calling my function to get current date time

  responseString.dateS = JSON.parse(dateTimeS);
  responseString.dateE = JSON.parse(dateTimeE);

  console.log(responseString.dateS);
  console.log(responseString.dateE);

  if(deviceNumber==0)           // 0 for complete Board
  {
    //histSearch = '{ "DateTime":{ "$gte":'+ dateTimeS +' , "$lte": '+ dateTimeE +'} ,"Devices":{"$elemMatch": {"DeviceNumber": {"$in":[1,2,3,4,5,6]} } } }';
    histSearch = '{ "DateTime":{ "$gte":'+ dateTimeS +' , "$lte": '+ dateTimeE +'} ,"UsageStatus":1 }';
    histSelection='{"DateTime":1, "Devices.Energy":1, "Devices.DeviceNumber":1 , "_id":0 } ';
  }
  else                        //for other appliances
  {
    histSearch = '{ "DateTime":{ "$gte":'+ dateTimeS +' , "$lte": '+ dateTimeE +'} ,"Devices":{"$elemMatch": {"DeviceNumber": '+deviceNumber+' } } }';
    histSelection='{"Devices":{"$elemMatch": {"DeviceNumber": '+deviceNumber+' } },"DateTime":1, "Devices.Energy":1, "_id":0 } ';
  }

  histSearchObj = JSON.parse(histSearch);
  histSelectionObj = JSON.parse(histSelection);

  history.find(histSearchObj, histSelectionObj).toArray(function (err, result) {

    if(!err)
    {
      console.log("length",result.length);
      if(result.length>=1)
      {

        //console.log(result);
        console.log(result.length);
        
        for (var i=0; i<result.length; i++) {
          console.log(result[i]);
        }


        responseString.status="Found";
        responseString.data= result;
        res.json(responseString);
        res.end();

      }
      else
      {
        responseString.status="No Result Found";
        res.json(responseString);
        res.end();
      }  
    }  

    else
    {
       console.log("Error while getting document(s) from History collection. \n\n", err);
    }

  }); 

});


// Search option for energy, Enery Meter TAB
app.post('/energySearch', function(req,res){

  var responseString = {status:"", data:[]};

  var deviceNumber = req.body.deviceNumber;
  var dateS = req.body.dateS;
  var dateE = req.body.dateE;
  var timeS = req.body.timeS;
  var timeE = req.body.timeE;

  var time;
  var dateTimeS;
  var dateTimeE;

  var histSearch;
  var histSelection;
  var histSearchObj;
  var histSelectionObj;
 
  time = timeS.split("");
  timeS='-'+time[0]+time[1]+'-'+time[5]+time[6];

  time = timeE.split("");
  timeE='-'+time[0]+time[1]+'-'+time[5]+time[6];

  dateTimeS = dateS + timeS;
  dateTimeE = dateE + timeE;

  dateTimeS = JSON.stringify(dateTimeS);
  dateTimeE = JSON.stringify(dateTimeE);

  if(deviceNumber==0)           // 0 for complete Board
  {
    histSearch = '{ "DateTime":{ "$gte":'+ dateTimeS +' , "$lte": '+ dateTimeE +'} ,"Devices":{"$elemMatch": {"DeviceNumber": {"$in":[1,2,3,4,5,6]} } } }';
    histSelection='{"DateTime":1, "Devices.Energy":1, "Devices.DeviceNumber":1 , "_id":0 } ';
  }
  else                        //for other appliances
  {
    histSearch = '{ "DateTime":{ "$gte":'+ dateTimeS +' , "$lte": '+ dateTimeE +'} ,"Devices":{"$elemMatch": {"DeviceNumber": '+deviceNumber+' } } }';
    histSelection='{"Devices":{"$elemMatch": {"DeviceNumber": '+deviceNumber+' } },"DateTime":1, "Devices.Energy":1, "_id":0 } ';
  }

  histSearchObj = JSON.parse(histSearch);
  histSelectionObj = JSON.parse(histSelection);


  history.find(histSearchObj, histSelectionObj).toArray(function (err, result) {

    if(!err)
    {
      console.log("length",result.length);
      if(result.length>=1)
      {

        //console.log(result);
        console.log(result.length);
        
        for (var i=0; i<result.length; i++) {
          console.log(result[i]);
        }


        responseString.status="Found";
        responseString.data= result;
        res.json(responseString);
        res.end();

      }
      else
      {
        responseString.status="No Result Found";
        res.json(responseString);
        res.end();
      }  
    }  

    else
    {
       console.log("Error while getting document(s) from History collection. \n\n", err);
    }

  }); 

});


// Search options for Quality Stats TAB

app.post('/qualityStats',function(req,res){

  var responseString = {status:"", data:[], surges:[] };
  var dateS = req.body.dateS;
  var dateE = req.body.dateE;
  var timeS = req.body.timeS;
  var timeE = req.body.timeE;

  var time;
  var dateTimeS;
  var dateTimeE;

  var histSearch;
  var histSelection;
  var histSearchObj;
  var histSelectionObj;
 
  time = timeS.split("");
  timeS='-'+time[0]+time[1]+'-'+time[5]+time[6];

  time = timeE.split("");
  timeE='-'+time[0]+time[1]+'-'+time[5]+time[6];

  dateTimeS = dateS + timeS;
  dateTimeE = dateE + timeE;

  dateTimeS = JSON.stringify(dateTimeS);
  dateTimeE = JSON.stringify(dateTimeE);


  histSearch = '{ "DateTime":{ "$gte":'+ dateTimeS +' , "$lte": '+ dateTimeE +'} }';
  histSelection='{"DateTime":1 ,"Voltage":1 ,"_id":0 } ';
  

  histSearchObj = JSON.parse(histSearch);
  histSelectionObj = JSON.parse(histSelection);


  history.find(histSearchObj, histSelectionObj).toArray(function (err, result) {

    if(!err)
    {
      if(result.length>=1)
      {

        console.log(result.length);
        for (var i=0; i<result.length; i++) 
        {
          console.log(result[i]);
        }

        responseString.status="Found";
        responseString.data= result;

        histSelection='{"DateTime":1 ,"VoltageSurge":1 ,"_id":0 } ';
        histSelectionObj = JSON.parse(histSelection);

        voltageSurges.find(histSearchObj, histSelectionObj).toArray(function (err, result) {

          if(!err)
          {
            
            console.log(result.length);
            for (var i=0; i<result.length; i++) 
            {
              console.log(result[i]);
            }

            responseString.surges= result;
            res.json(responseString);
            res.end();

          }  

          else
          {
             console.log("Error while getting document(s) from VoltageSurges collection. \n\n", err);
          }

        }); 

      }
      else
      {
        responseString.status="No Result Found";
        res.json(responseString);
        res.end();
      }  
    }  

    else
    {
       console.log("Error while getting document(s) from History collection (For Voltage). \n\n", err);
    }

  }); 

});


// Search options for History TAB

app.post('/history',function(req,res){

  var responseString = {status:"", data:[]};

  var deviceNumber = req.body.deviceNumber;
  var dateS = req.body.dateS;
  var dateE = req.body.dateE;
  var timeS = req.body.timeS;
  var timeE = req.body.timeE;
  var option = req.body.option;
  var time;
  var dateTimeS;
  var dateTimeE;

  var histSearch;
  var histSelection;
  var histSearchObj;
  var histSelectionObj;
 
  time = timeS.split("");
  timeS='-'+time[0]+time[1]+'-'+time[5]+time[6];

  time = timeE.split("");
  timeE='-'+time[0]+time[1]+'-'+time[5]+time[6];

  dateTimeS = dateS + timeS;
  dateTimeE = dateE + timeE;

  dateTimeS = JSON.stringify(dateTimeS);
  dateTimeE = JSON.stringify(dateTimeE);


  histSearch = '{ "DateTime":{ "$gte":'+ dateTimeS +' , "$lte": '+ dateTimeE +'} ,"Devices":{"$elemMatch": {"DeviceNumber": '+deviceNumber+' } } }';

  if(option=='All')
  {
    histSelection='{"Devices":{"$elemMatch": {"DeviceNumber": '+deviceNumber+' } },"UserName":0 , "BoardID":0 ,"_id":0 } ';
  }
  else  
  {
    histSelection='{"Devices":{"$elemMatch": {"DeviceNumber": '+deviceNumber+' } },"DateTime":1, "Devices.'+option+'":1, "_id":0 } ';
  }

  histSearchObj = JSON.parse(histSearch);
  histSelectionObj = JSON.parse(histSelection);


  history.find(histSearchObj, histSelectionObj).toArray(function (err, result) {

    if(!err)
    {
      console.log("length",result.length);
      if(result.length>=1)
      {

        //console.log(result);
        console.log(result.length);
        
        for (var i=0; i<result.length; i++) {
          console.log(result[i]);
         // console.log("-----");
         //console.log("no of devices "+result[i].Devices.length);
         //console.log(result[i].Devices[0].PowerFactor);
         // console.log("-----------------");
        }


        responseString.status="Found";
        responseString.data= result;
        res.json(responseString);
        res.end();

      }
      else
      {
        responseString.status="No Result Found";
        res.json(responseString);
        res.end();
      }  
    }  

    else
    {
       console.log("Error while getting document(s) from History collection. \n\n", err);
    }

  }); 

});

// To get the date and time String

function GetDateString(arg)
{
  var date;
  var yyyy;
  var mm;
  var dd;
  var hh;
  var min;
  var dateTime;

  if(arg==0)
  {
    date = new Date();  
  }
  else
  {
    date = new Date(arg);
  }

  dd = date.getDate();
  mm = date.getMonth()+1;       //January is 0!
  yyyy = date.getFullYear();
  hr = date.getHours();
  min = date.getMinutes();

  if(dd<10) {
    dd='0'+dd;
  } 

  if(mm<10) {
    mm='0'+mm;
  }

  if(hr<10){
    hr='0'+hr;
  } 

  if(min<10){
    min='0'+min;
  }

  dateTime = yyyy+'-'+mm+'-'+dd+'-'+hr+'-'+min;
  dateTime = JSON.stringify(dateTime);

  return dateTime;

}


/****** Privacy Settings *****/


// Verify Current Email
app.post('/verifyEmail', function(req,res){


 // if(req.session.email == req.body.email)

  users.find({"UserName":req.session.username, "Email": req.body.email}).toArray(function (err, result) {

    if(!err)
    {
      //console.log("length",result.length);
      if(result.length==1)
      {
        res.end("Verified");
      }
      else
      {
        res.end("Not Verified");
      }
    }
    else
    {
       console.log("Error while getting document(s). - verdify email \n\n", err);
    }
  });
  
});


//Update Email
app.post('/updateEmail', function(req,res){

  users.find({"Email": req.body.email}).toArray(function (err, result) {

    if(!err)
    {
      //console.log("length",result.length);
      if(result.length==1)
      {
        res.end("Not Updated");
      }
      else
      {
        users.updateOne({"UserName":req.session.username}, {$set:{"Email":req.body.email}},  function(err, result){
          if(!err)
          {
            res.end("Updated");
          }
          else
          {
           console.log("Error while updating email");
          }

        });
      }  
    }      

    else
    {
       console.log("Error while getting document(s) - update email. \n\n", err);
    }

  });

});


//Verify Current Password
app.post('/verifyPassword', function(req,res){


  users.find({"UserName":req.session.username, "Password": req.body.password}).toArray(function (err, result) {

    if(!err)
    {
      //console.log("length",result.length);
      if(result.length==1)
      {
        res.end("Verified");
      }
      else
      {
        res.end("Not Verified");
      }
    }
    else
    {
       console.log("Error while getting document(s) - verdify password. \n\n", err);
    }
  });

});


//Update Password
app.post('/updatePassword', function(req,res){

  users.updateOne({"UserName":req.session.username}, {$set:{"Password":req.body.password}},  function(err, result){
    if(!err)
    {
      res.end("Updated");
    }
    else
    {
      console.log("Error while updating password.");
      res.end("Not Updated");
    }

  });

});