var dateS='';
var dateE='';
var timeS='';
var timeE='';
var option='';
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
var results;              //results of voltage from database
var resultsLen;
var resultSurges;		  //results of voltage surges from database
var resultSurgesLen;

var tokens;
var teTokens;
var dateInc;             //start date and time of grapgh and increase per minute
var dateEndPoint;        //end date and time of grapgh
var totalPoints;        //total points(minutes) to show on grapgh

var offset;               //offset for different pages of table
var pageCounter;          //to show page number of table

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
      	$(function() {
  		    $("#datepicker").datepicker({inline: true});
  		    $('.timepicker').wickedpicker({twentyFour: true});
		});
      }
    }
  });
}

function Search()
{

  $(".errors").html("");
	var validator = $("#select-sub-form").validate({
    rules: {
      dateStart: {
        required: true,
      },
      dateEnd: {
        required: true,
      },
      timepickerStart:
      {
        required: true
      },
      timepickerEnd:
      {
        required: true
      },
      option:
      {
        required: true
      }
    }
  });

  if(validator.form())
  {
    dateS = $("#datepicker1").val();
    dateE = $("#datepicker2").val();
    timeS = $("#timepickerStart").val();
    timeE = $("#timepickerEnd").val();
    appliance = $("#appliance").val();
    option = $("#option").val();

    ajaxCall();

    //getting date of today in format mm/dd/yyyy
    // today = new Date();
    // dd = today.getDate();
    // mm = today.getMonth()+1;       //January is 0!
    // yyyy = today.getFullYear();
   

    // if(dd<10) {
    //     dd='0'+dd;
    // } 

    // if(mm<10) {
    //     mm='0'+mm;
    // } 

    // today = mm+'/'+dd+'/'+yyyy;


    // dateToday = new Date(today);
    // dateStart = new Date(dateS);
    // dateEnd = new Date(dateE);

    // //To check if Start date is not future date
    // dateTimeDiff = dateToday.getTime() - dateStart.getTime();
    // daysDiff = dateTimeDiff / (1000 * 3600 * 24);

    // if(daysDiff<0)
    // {
    //   $("#error-datepicker1").html("Please select today or past date. There is no data for future date.");
    // }
    // else
    // {
    //   //To check if End date is not future date
    //   dateTimeDiff = dateToday.getTime() - dateEnd.getTime();
    //   daysDiff = dateTimeDiff / (1000 * 3600 * 24);

    //   if(daysDiff<0)
    //   {
    //     $("#error-datepicker2").html("Please select today or past date. There is no data for future date.");
    //   }
    //   else
    //   {

    //     //To check if Start date is not greater than End date 
    //     dateTimeDiff = dateEnd.getTime() - dateStart.getTime();
    //     daysDiff = dateTimeDiff / (1000 * 3600 * 24); 

    //     if(daysDiff<0)        //Start date is greater than End date
    //     {
    //      $("#error-datepicker1").html("Start date cannot be greater than End date.");
    //     }
    //    // else if(daysDiff==0)   //Start date and End date is same day
    //    // {
         
    //       //To check if Start Time is not future time

    //       //To check if End Time is not future time
          
    //       //To check if Start Time is not greater than or equal to End Time

    //     //}
    //     else                  //Start date is less than End date
    //     {
    //       ajaxCall();
    //     }
    //   }
    // }
    
  }
  else
  {
  	console.log("Error - Cannot validate form");
  }
}	


function ajaxCall()
{
  $.ajax({
    type:"POST",
    url:"/qualityStats",
    data:{dateS:dateS, dateE:dateE, timeS:timeS, timeE:timeE},
    success:function(response){
      console.log(response.status);
      
      if (response.status=="No Result Found") 
      {
        $("#emptyResult-error").html("No data is available for the selected period. ");
      }
      else
      {
        results=response.data;
        resultsLen=results.length;
        resultSurges=response.surges;
        resultSurgesLen=resultSurges.length; 
        GraphSettings();
      }
    }
  });
}

function GraphSettings()
{

  //start date and time for beginning of graph and increment per minute
  tokens = dateS.split('-');
  yyyy = tokens[0];
  mm = tokens[1];
  dd= tokens[2];

  tokens = timeS.split("");
  hh=tokens[0]+tokens[1];
  min=tokens[5]+tokens[6];

  dateInc = Date.UTC(yyyy, mm-1, dd, hh, min);

  //End date and time for end of graph and calculating number of minutes to show on graph

  tokens = dateE.split("-");
  teTokens = timeE.split("");
  var a =  teTokens[0]+teTokens[1];
  var b =  teTokens[5]+teTokens[6];
  dateEndPoint = Date.UTC(tokens[0],tokens[1]-1,tokens[2],a,b);

  totalPoints = (dateEndPoint - dateInc)/60000;
  console.log("total mins:"+totalPoints)
  console.log(dateInc);
  if(option=="Voltage")
  {
    RenderVoltageGraph();
  }
  else
  {
    if(resultSurgesLen==0)
    {
      RenderVoltageGraph();
    }
    else
    {
      RenderSurgesGraph();
    }               
  }


}

//Render grapgh for single selected parameter
function RenderVoltageGraph()
{

  var highSurgesCount=0;
  var lowSurgesCount=0;
  var powerFailure=[];
  var powerFailureCount=0;
  var powerFailureFlag=0;

  var html;

  html='<br>';
  html+='<div class="row">';
  html+='<div class="col-sm-offset-5" >';
  html+='<p  style="color: green; font-size:22px "> <b>'+ option +' History</b> </p>';
  html+='</div>';
  html+='</div>';
  html+='<br>'

  html+='<div class="row">';
  html+='<div class="col-sm-12"  id="graph">';
  html+='</div>';

  html+='<div class="col-sm-5 col-sm-offset-1" id="info">';
  html+='</div>';

  if(option=="Voltage")
  {
    html+='<div class="col-sm-6">';
    html+='<button  type="button" class="btn btn-info" onclick="RenderTable()">View Details</button>';
    html+='</div>';
  }


  if(option=="Voltage Surges")
  {
    html+='<div class="col-sm-6">';
    html+='<p id="#emptySurges-error" style="color:green; font-size:15px">Congrats! No Voltage Surge during the selected period.</p>';
    html+='</div>';
  }
  html+='</div>';
  html+='<br>';

  $("#middle-screen").html(html);

  var x_title = "Time and Date";
  var y_title = "Voltage (Vrms)";
  var unit='';
  var k=0;                // to increment results length 
  var dateWithVal;        //to compare the value of date and time from database with every point of grapgh

  $('#graph').highcharts({
    chart: {
      type: 'line',
      zoomType: 'x',
      panning: true,
      panKey: 'shift'
    },

    title: {
        text: 'Voltage (Vrms)',  
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
        valueSuffix: unit
    },
    
    series: [{
      name: "Voltage",
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
                data.push(results[k].Voltage);
                k++;
            /*    if(powerFailureFlag=1)
                {
                  powerFailure.push(dateWithVal);
                }

                powerFailureFlag=0;*/
              }
              else
              {
                data.push(null);
                powerFailureCount++;
                /*if(powerFailureFlag==0)
                {
                  powerFailure.push(dateWithVal);
                  powerFailureCount++;
                } 
                powerFailureFlag=1;*/ 
              }

            }
            else
            {
              data.push(null);
              powerFailureCount++;
              
             /* powerFailure.push(dateWithVal);
              if(powerFailureFlag==0)
              {
                powerFailure.push(dateWithVal);
                powerFailureCount++;
              } 
              powerFailureFlag=1; */
            }

            dateInc+=60000;  
        }
        return data;
      }()) 
    }]
  
  });

  //Reset Graph dateInc value to beginning date and time
  dateInc = dateInc - totalPoints * 60000;

 
  powerFailureCount = powerFailureCount/60;
  powerFailureCount = powerFailureCount.toString();
  
  var ts = powerFailureCount.split(".");

  var htmlInfo;
  htmlInfo='<table style="font-size:15px; color:green">';
  htmlInfo+='<tr>';
  htmlInfo+='<td>';
  htmlInfo+='Power Failure Time:';
  htmlInfo+='</td>';
  htmlInfo+='<td style="color:#315D7B">';
  
  if(ts.length==2)
  {
    ts[1]  = ((ts[1].substr(0,2))/100)*60;
    htmlInfo+=ts[0]+' Hrs '+ ts[1].toFixed(2)+' Mins';
  }
  else
  {
     htmlInfo+=ts[0]+' Hrs';
  }
  
  htmlInfo+='</td>';
  htmlInfo+='</tr>';
  htmlInfo+='</table>';

  $("#info").html(htmlInfo);

}


function RenderSurgesGraph()
{

  var highSurgesCount=0;
  var lowSurgesCount=0;
  var powerFailure=[];
  var powerFailureCount=0;
  var powerFailureFlag=0;

  var html;

  html='<br>';
  html+='<div class="row">';
  html+='<div class="col-sm-offset-5" >';
  html+='<p  style="color: green; font-size:22px "> <b>'+ option +' History</b> </p>';
  html+='</div>';
  html+='</div>';
  html+='<br>'

  html+='<div class="row">';
  
  html+='<div class="col-sm-12"  id="graph">';
  html+='</div>';
  
  html+='<div class="col-sm-5 col-sm-offset-1" id="info">';
  html+='</div>';
  
  html+='<div >';
  html+='<button  type="button" class="btn btn-info" onclick="RenderTable()">View Details</button>';
  html+='</div>';
  
  html+='</div>';
  html+='<br>';

  $("#middle-screen").html(html);

  var x_title = "Time and Date";
  var y_title = "Voltage (Vrms)";
  var unit='';
  var k=0;                // to increment results length 
  var l=0;                // to increments resultSurges
  var dateWithVal;        //to compare the value of date and time from database with every point of grapgh
  var dt;

  $('#graph').highcharts({
    chart: {
      type: 'line',
      zoomType: 'x',
      panning: true,
      panKey: 'shift'
    },

    title: {
      text: 'Voltage',  
    },
    subtitle:{
      text: 'Voltage Surges', 
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
        valueSuffix: unit
    },
    
    series: [{
      name: "Voltage",
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
                data.push(results[k].Voltage);
                k++;
               /* if(powerFailureFlag=1)
                {
                  powerFailure.push(dateWithVal);
                }

                powerFailureFlag=0; */
              }
              else
              {
                data.push(null);
                powerFailureCount++;
                
              /*  if(powerFailureFlag==0)
                {
                  powerFailure.push(dateWithVal);
                  powerFailureCount++;
                } 
                powerFailureFlag=1; */

              }

            }

            else
            {
              data.push(null);
              powerFailureCount++;

              /*if(powerFailureFlag==0)
              {
                powerFailure.push(dateWithVal);
                powerFailureCount++;
              } 
              powerFailureFlag=1; */

            }

            dateInc+=60000;  
        }
        return data;
      }()) 
    },

    {
      name: "Voltage Surges",
      color: "#FF0000",
      pointInterval:  60 * 1000,      // per minute
      pointStart: Date.UTC(yyyy, mm-1, dd, hh, min),
      data : (function () {
        var data = [];
        //Reset Graph dateInc value to beginning date and time
        dateInc = dateInc - totalPoints * 60000;

        for (var j = 0; j <totalPoints; j++) 
        {
            if(l<resultSurgesLen)
            {
              tokens=resultSurges[l].DateTime.split("-");
              dateWithVal = Date.UTC(tokens[0],tokens[1]-1,tokens[2],tokens[3],tokens[4]);

              if(dateInc==dateWithVal)
              {
                data.push(resultSurges[l].VoltageSurge);

                if(resultSurges[l].VoltageSurge>=250)
                {
                  highSurgesCount++;
                }
                else
                {
                  lowSurgesCount++;
                }

                l++;

              }
              else
              {
                data.push(null);
              }

            }
            else
            {
              data.push(null);
            }

            dateInc+=60000;  
        }
        return data;
      }()) 
    }]
  
  });

  //Reset Graph dateInc value to beginning date and time
  dateInc = dateInc - totalPoints * 60000;

  powerFailureCount = powerFailureCount/60;
  powerFailureCount = powerFailureCount.toString();
  
  var ts = powerFailureCount.split(".");

  var htmlInfo;
  htmlInfo='<table style="font-size:15px; color:green">';
  htmlInfo+='<tr>';
  htmlInfo+='<td>';
  htmlInfo+='Power Failure Time:';
  htmlInfo+='</td>';
  htmlInfo+='<td style="color:#315D7B">';
  
  if(ts.length==2)
  {
    ts[1]  = ((ts[1].substr(0,2))/100)*60;
    htmlInfo+=ts[0]+' Hrs '+ ts[1].toFixed(2)+' Mins';
  }
  else
  {
     htmlInfo+=ts[0]+' Hrs';
  }
  
  htmlInfo+='</td>';
  htmlInfo+='</tr>';

  htmlInfo+='<tr>';
  htmlInfo+='<td>';
  htmlInfo+='High Surges Count:';
  htmlInfo+='</td>';
  htmlInfo+='<td style="color:#315D7B">';
  htmlInfo+=highSurgesCount;
  htmlInfo+='</td>';
  htmlInfo+='</tr>';

  htmlInfo+='<tr>';
  htmlInfo+='<td>';
  htmlInfo+='Low Surges Count:';
  htmlInfo+='</td>';
  htmlInfo+='<td style="color:#315D7B">';
  htmlInfo+=lowSurgesCount;
  htmlInfo+='</td>';
  htmlInfo+='</tr>';
  htmlInfo+='</table>';

  $("#info").html(htmlInfo);

}


function RenderTable()
{
  var html;

  offset = 10;
  pageCounter = 1;
  count = 0;

  $("#footer").css("margin-top","124px");

  html='<br>';
  html+='<div class="row">';
  html+='<div class="col-sm-offset-4" >';
  html+='<p  style="color: green; font-size:22px "> <b>Details of Board 1</b> </p>';
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
  if(option == "Voltage")
  {
    html+='<th>Voltage (Volts)</th>';
  }
  else
  {
    html+='<th>Voltage Surges (Volts)</th>';
  }
  
  html+='</tr>';
  html+='</thead>';
  html+='<tbody id="table-body">';
  html+='</tbody>';
  html+='</table>';
  html+='</div>';
  html+='</div>';
  
  html+='<div class="row" id="next-back-bottom">';
  html+='<div class="col-sm-3 col-sm-offset-3">';
  if(option=="Voltage")
  {
    html+='<button  type="button" class="btn btn-info btn-block" onclick="RenderVoltageGraph()">View Graph</button>';
  }
  else
  {
    html+='<button  type="button" class="btn btn-info btn-block" onclick="RenderSurgesGraph()">View Graph</button>';
  }
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

  if(option=="Voltage")
  {
    if(resultsLen<=10)
    {
        $(".next-btn").attr('disabled','disabled');
    }
    RenderTableBodyVoltage();
  }
  else
  {
    if(resultSurgesLen<=10)
    {
        $(".next-btn").attr('disabled','disabled');
    }
    RenderTableBodySurges();
  }

}

function Next()
{
  pageCounter++;
  //offset = pageCounter * 10;
  offset +=10;

  $("#table-body").html("");
  $(".pageNumber").html(pageCounter);

  $(".back-btn").removeAttr('disabled'); //enabling back button


  if(option=="Voltage")
  {
    if( resultsLen <= offset)
    {
      $(".next-btn").attr('disabled','disabled');     //diabling next button if total users limit reached
    }
    RenderTableBodyVoltage();
  }
  else
  {
    if( resultSurgesLen <= offset)
    {
      $(".next-btn").attr('disabled','disabled');     //diabling next button if total users limit reached
    }
    RenderTableBodySurges();
  }
  
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

  if(option=="Voltage")
  {
    RenderTableBodyVoltage();
  }
  else
  {
    RenderTableBodySurges();
  }
   
}

function RenderTableBodyVoltage()
{
  var htmlB;
  var dt;       //value of dateTime
  var tks;      //store value after split
  var count=0;  // to have 10 results on one page

  for(var n=offset-10; n<resultsLen && count<10; n++)
  {

    tks=results[n].DateTime.split("-");
    dt = new Date(tks[0],tks[1]-1,tks[2],tks[3],tks[4]).toLocaleString();

    htmlB="<tr>";

    htmlB+="<td>";
    htmlB+=n+1;
    htmlB+="</td>";

    htmlB+="<td>";
    htmlB+=dt;
    htmlB+="</td>";

    htmlB+="<td>";
    htmlB+=results[n].Voltage;
    htmlB+="</td>";

    htmlB+="</tr>";

    $("#table-body").append(htmlB);

    count++;
  }

}

function RenderTableBodySurges()
{
  var htmlB;
  var dt;       //value of dateTime
  var tks;      //store value after split
  var count=0;  // to have 10 results on one page

  for(var n=offset-10; n<resultSurgesLen && count<10; n++)
  {

    tks=resultSurges[n].DateTime.split("-");
    dt = new Date(tks[0],tks[1]-1,tks[2],tks[3],tks[4]).toLocaleString();

    htmlB="<tr>";

    htmlB+="<td>";
    htmlB+=n+1;
    htmlB+="</td>";

    htmlB+="<td>";
    htmlB+=dt;
    htmlB+="</td>";

    htmlB+="<td>";
    htmlB+=resultSurges[n].VoltageSurge;
    htmlB+="</td>";

    htmlB+="</tr>";

    $("#table-body").append(htmlB);

    count++;
  }

}
