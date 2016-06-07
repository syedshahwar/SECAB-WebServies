var dateS='';
var dateE='';
var timeS='';
var timeE='';
var appliance='';
var dateToday='';
var dateStart='';
var dateEnd='';
var timeStart='';
var timeEnd='';
var today='';
var mm='';
var dd='';
var yyyy='';
var hh='';
var min='';
var dateTimeDiff='';
var daysDiff='';
var deviceNumber;
var results;              //results of energy from database
var resultsLen;

var tokens;
var teTokens;
var dateInc;             //start date and time of grapgh and increase per minute
var dateEndPoint;        //end date and time of grapgh
var totalPoints;        //total points(minutes) to show on grapgh

var interval;           //for repeatedly calling function after every 1 min

var offset;             //offset for different pages of table
var pageCounter;        //to show page number of table
var energy = [];        //to store value of energy for start of every page

window.onload=function(){

  $.ajax({
    type:"GET",
    url:"/sessionCheck",
    success:function(response){
            
      if(response == 'Incorrect')
      {
        window.location.replace("login.html");
      }
      else
      {
        appliance = "Board";
        deviceNumber = 0;
        ajaxCall();
        interval = setInterval(ajaxCall, 60*1000);
      }
    }
  });
}

function ShowEnergyMeter()
{

  clearInterval(interval);

  appliance = $("#appliance").val();

  switch(appliance) 
  {
    case "Board":
      deviceNumber=0;
      break;
    case "Light":
      deviceNumber=1;
      break;
    case "Fan":
      deviceNumber=2;
      break;
    case "Television":
      deviceNumber=3;
      break;
    case "Socket":
       deviceNumber=4;
      break;
    default:
      deviceNumber=0;
  }
  
  ajaxCall();
  interval = setInterval(ajaxCall, 60*1000);

}


function ajaxCall()
{
  $.ajax({
    type:"POST",
    url:"/energyMeter",
    data:{deviceNumber:deviceNumber},
    success:function(response){
      console.log(response.status);

      if (response.status=="No Result Found") 
      {
        $("#energyGraph").html('<br><br><br><br><div class="col-sm-offset-3" > <p id="emptyResult-error" style="color: green; font-size:20px "> No Energy Consumption by '+appliance+' during last 24 Hrs </p></div>');
        $("#footer").css("margin-top", "124px");
      }
      else
      {
        results=response.data;
        resultsLen=results.length;
        dateS = response.dateS;
        dateE = response.dateE;
        console.log(dateS);
        console.log(dateE);

        GraphSettings();
      }
    }
  });
}

function GraphSettings()
{

  //start date and time for beginning of graph and increment per minute
  tokens = dateS.split('-');
  yyyy=tokens[0];
  mm=tokens[1];
  dd=tokens[2];
  hh=tokens[3];
  min=tokens[4];
  dateInc = Date.UTC(yyyy,mm-1,dd,hh,min);

  //End date and time for end of graph and calculating number of minutes to show on graph

  tokens = dateE.split("-");
  dateEndPoint = Date.UTC(tokens[0],tokens[1]-1,tokens[2],tokens[3],tokens[4]);
  console.log(dateEndPoint);

  totalPoints = (dateEndPoint - dateInc)/60000;
  console.log("total mins:"+totalPoints)
  console.log(dateInc);
  
  RenderGraph();
  
}

//Render grapgh for single selected parameter
function RenderGraph()
{
  var html;

  html='<br>';
  html+='<div class="row">';
  html+='<div class="col-sm-12"  id="graph">';
  html+='</div>';
  html+='</div>';

  html+='<div class="row">';
  html+='<div class="col-sm-offset-1 col-sm-4">';
  html+='<p style="font-size:20px; color:green">Units Consumed: <span id="total-units" style="color:#315D7B"></span></p>';
  html+='</div>';
  html+='<div class="col-sm-offset-6">';
  html+='<button id="energyMeterDetails-btn" type="button" class="btn btn-info" onclick="RenderTable()">View Details</button>';
  html+='</div>';
  html+='</div>';


  $("#energyGraph").html(html);

  var x_title = "Time and Date";
  var y_title = "Energy";
  var unit=" kWh";
  var k=0;                // to increment results length 
  var l=0;                // to increment for per device Energy on same time
  var dateWithVal;        //to compare the value of date and time from database with every point of grapgh
  var energy=0;

  $('#graph').highcharts({
    chart: {
      type: 'line',
      zoomType: 'x',
      panning: true,
      panKey: 'shift'
    },

    title: {
      text: 'Energy Meter - '+appliance+'',  
    },

    subtitle: {
      text: new Date(yyyy,mm-1,dd,hh,min).toLocaleString()+" to "+new Date(tokens[0],tokens[1]-1,tokens[2],tokens[3],tokens[4]).toLocaleString()
    },

    xAxis: {
        type: 'datetime',
        minTickInterval: 60 * 1000,       
        
        title: {
            text: x_title,

        }
    },
    yAxis: {
        title: {
            text:  y_title
        },
        pointStart:0,
        plotLines: [{
            value: 0,
            width: 1
        }]
    },
    tooltip: {
        //valueSuffix: unit,
        pointFormat: "Energy: {point.y:.4f} kWh"
    },
    
    series: [{
      //name: "Energy",
      pointInterval:  60 * 1000,      // per minute
      pointStart: Date.UTC(yyyy, mm-1, dd, hh, min),
      data : (function () {
        var data = [];

        for (var j = 0; j <totalPoints; j++) 
        {
            if(k<resultsLen)
            {
              tokens=results[k].DateTime.split("-");
              dateWithVal = Date.UTC(tokens[0],tokens[1]-1,tokens[2],tokens[3],tokens[4]);

              if(dateInc==dateWithVal )
              {
                for(l=0; l<results[k].Devices.length; l++)
                {
                  energy+=results[k].Devices[l].Energy;
                }
                data.push(energy);
                k++;
              }
              else
              {
                data.push(energy);
              }

            }
            else
            {
              data.push(energy);
            }

            dateInc+=60000;  
        }
        return data;
      }()) 
    }]
  
  });
  
  $("#total-units").html(energy.toFixed(4));
  //Reset Graph dateInc value to beginning date and time
  dateInc = dateInc - totalPoints * 60000;

}


function RenderTable()
{
  clearInterval(interval);
 
  var html;

  offset = 10;
  pageCounter = 1;
  count = 0;

  $("#footer").css("margin-top","124px");

  html='<br>';
  html+='<div class="row">';
  html+='<div class="col-sm-offset-4" >';
  html+='<p  style="color: green; font-size:22px "> <b>Energy Consumption of '+appliance+' for Last 24 Hrs</b> </p>';
  html+='</div>';
  html+='</div>';
  html+='<br>'

  html+='<div class="row" id="next-back-top">';
  html+='<div  class=" col-sm-1 col-sm-offset-8">';
  html+='<button class="btn btn-info back-btn" onclick="Back()" >Back</button>';
  html+='</div>';
  html+='<div  class=" col-sm-1">';
  html+='<h4 class="pageNumber" style="text-align:center; color:blue"> </h4>';
  html+='</div>';
  html+='<div  class=" col-sm-1">';
  html+='<button  class="btn btn-info next-btn" onclick="Next()" >Next</button>';
  html+='</div>';
  html+='</div>';

  html+='<div class="row" id="main-content">';
  html+='<div class="col-sm-11" >';
  html+='<table class="table">';
  html+='<thead style="color:green">';
  html+='<tr>';
  html+='<th>S.No.</th>';
  html+='<th>Date & Time</th>';
  html+='<th>Energy (kWh)</th>';
  html+='</tr>';
  html+='</thead>';
  html+='<tbody id="table-body">';
  html+='</tbody>';
  html+='</table>';
  html+='</div>';
  html+='</div>';
  
  html+='<div class="row" id="next-back-bottom">';
  html+='<div class="col-sm-3 col-sm-offset-3">';
  html+='<button  type="button" class="btn btn-info btn-block" onclick="window.location.href=\'energyMeter.html\'">View Graph</button>';
  html+='</div>';
  html+='<div  class=" col-sm-1 col-sm-offset-2">';
  html+='<button class="btn btn-info back-btn" onclick="Back()" >Back</button>';
  html+='</div>';
  html+='<div  class=" col-sm-1">';
  html+='<h4 class="pageNumber" style="text-align:center; color:blue"> </h4>';
  html+='</div>';
  html+='<div  class=" col-sm-1">';
  html+='<button  class="btn btn-info next-btn" onclick="Next()" >Next</button>';
  html+='</div>';
  html+='</div>';


  $("#middle-screen").html(html);

  $(".pageNumber").html(pageCounter);

  $(".back-btn").attr('disabled','disabled');  //disabling back button on 1st page

  //diabling next button if total users are less than 10

  if(resultsLen<=10)
  {
    $(".next-btn").attr('disabled','disabled');
  }

  energy[0]=0;

  RenderTableBody();

}

function Next()
{
  pageCounter++;
  //offset = pageCounter * 10;
  offset +=10;

  $("#table-body").html("");
  $(".pageNumber").html(pageCounter);

  $(".back-btn").removeAttr('disabled'); //enabling back button

  if( resultsLen <= offset)
  {
      $(".next-btn").attr('disabled','disabled');     //diabling next button if total users limit reached
  }
  
  RenderTableBody();
  
}


function Back()
{

  pageCounter--;
  //offset = pageCounter * 10;
  offset -=10;

  $("#table-body").html("");
  $(".pageNumber").html(pageCounter);


  $(".next-btn").removeAttr('disabled'); //enabling next button

  if(offset==10)
  {
    $(".back-btn").attr('disabled','disabled');     //diabling next button if we reached 1st page again
  }

  RenderTableBody();
   
}

function RenderTableBody()
{
  var htmlB;
  var dt;       //value of dateTime
  var tks;      //store value after split
  var count=0;  // to have 10 results on one page
  var energyPerPage=0;
  var val=0;
  var energyPerPage=0;

  energyPerPage = energy[pageCounter-1];

  for(var n=offset-10; n<resultsLen && count<10; n++)
  {
        //value of enery on single 1 min (could be of one device or more)

    tks=results[n].DateTime.split("-");
    dt = new Date(tks[0],tks[1]-1,tks[2],tks[3],tks[4]).toLocaleString();

    for(var m=0; m<results[n].Devices.length; m++)
    {
      val=results[n].Devices[m].Energy;
      energyPerPage+=val;
    }         

    htmlB="<tr>";

    htmlB+="<td>";
    htmlB+=n+1;
    htmlB+="</td>";

    htmlB+="<td>";
    htmlB+=dt;
    htmlB+="</td>";

    htmlB+="<td>";
    htmlB+=energyPerPage.toFixed(4);
    htmlB+="</td>";

    htmlB+="</tr>";

    $("#table-body").append(htmlB);

    count++;
  }

  energy[pageCounter]=energyPerPage;

}
