var dateS='';
var dateE='';
var timeS='';
var timeE='';
var appliance='';
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
var results;              //results from database
var resultsLen;

var tokens;
var teTokens;
var dateInc;              //start date and time of grapgh and increase per minute
var dateEndPoint;         //end date and time of grapgh
var totalPoints;          //total points(minutes) to show on grapgh

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
      appliance: {
        required: true
      },
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

    switch(appliance)
    {
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

    // //getting date of today in format mm/dd/yyyy
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
    url:"/history",
    data:{deviceNumber:deviceNumber, dateS:dateS, dateE:dateE, timeS:timeS, timeE:timeE, option:option },
    success:function(response){
      console.log(response.status);

      if (response.status=="No Result Found") 
      {
        $("#emptyResult-error").html("No data is available for "+appliance+" for the selected period. ");
      }
      else
      {
        results=response.data;
        resultsLen=results.length;
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
  dd = tokens[2];

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
  if(option=="All")
  {
    console.log(appliance);
    RenderGraphAll();
  }
  else
  {
    RenderGraph();
  }

}


//Render grapgh for all parameters
function RenderGraphAll()
{
  var html;

  html='<br>';
  html+='<div class="row">';
  html+='<div class="col-sm-offset-4" >';
  html+='<p  style="color: green; font-size:24px "> <b>History of '+appliance+' - Board 1</b> </p>';
  html+='</div>';
  html+='</div>';
  html+='<br>'

  html+='<div class="row">';
  html+='<div class="col-sm-12"  id="graph-current">';
  html+='</div>';
  html+='<div class="col-sm-offset-5">';
  html+='<button  type="button" class="btn btn-info" onclick="ChangeOption(1)">View Details</button>';
  html+='&nbsp';
  html+='<button  type="button" class="btn btn-info" onclick="RenderTableAll()">View All Details</button>';
  html+='</div>';
  html+='<br><br><br><br>';
  html+='<div class="col-sm-12"  id="graph-realpower">';
  html+='</div>';
  html+='<div class="col-sm-offset-5">';
  html+='<button  type="button" class="btn btn-info" onclick="ChangeOption(2)">View Details</button>';
  html+='&nbsp';
  html+='<button  type="button" class="btn btn-info" onclick="RenderTableAll()">View All Details</button>';
  html+='</div>';
  html+='<br><br><br><br>';
  html+='<div class="col-sm-12"  id="graph-powerfactor">';
  html+='</div>';
  html+='<div class="col-sm-offset-5">';
  html+='<button  type="button" class="btn btn-info" onclick="ChangeOption(3)">View Details</button>';
  html+='&nbsp';
  html+='<button  type="button" class="btn btn-info" onclick="RenderTableAll()">View All Details</button>';
  html+='</div>';
  html+='</div>';

  $("#middle-screen").html(html);

  var x_title = "Time and Date";
  var y_title = '';
  var parameter = '';
  var unit='';
  var subtitle=''
  var k;                   // to increment results length 
  var dateWithVal;        //to compare the value of date and time from database with every point of grapgh
  var divID;              //to select corresponding ID for graph


  //draw three grapghs by running loop three times. (Graphs for Current, RealPower, PowerFactor)
  for(var i=0; i<3; i++)
  {
    switch(i) 
    {
      case 0:
        y_title = 'Current (Arms)';
        parameter = 'Current';
        unit= ' Ampere';
        subtitle='Current (Arms)';
        k=0;
        divID="#graph-current";
        break;

      case 1:
        y_title = 'Real Power';
        parameter = 'Real Power';
        unit = ' Watts';
        subtitle='Real Power';
        k=0;
        divID="#graph-realpower";
        break;
      case 2:

        y_title = 'Power Factor';
        parameter = 'Power Factor';
        unit = '';
        subtitle='Power Factor';
        k=0;
        divID="#graph-powerfactor";

        break;

      default:
        break;
    }

    $(divID).highcharts({
      chart: {
        type: 'line',
        zoomType: 'x',
        panning: true,
        panKey: 'shift'
      },

      title: {
          text: appliance+' - Board 1',
          align: 'center',
      },

      subtitle: {
        text: subtitle
      },

      xAxis: {
          type: 'datetime',
          minTickInterval: 60 * 1000,          
          title: {
              text: x_title
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
          name: parameter,
          pointInterval:  60 * 1000,      // per minute
          pointStart: Date.UTC(yyyy, mm-1, dd, hh, min),
          //data: [3.9, 3.9, 3.9,3.7, 3.9, 3.9]

          data : (function () {
              // generate an array of random data
              var data = [];

              for (var j = 0; j <totalPoints; j++) 
              {
                if(k<resultsLen)
                {
                  tokens=results[k].DateTime.split("-");
                  dateWithVal = Date.UTC(tokens[0],tokens[1]-1,tokens[2],tokens[3],tokens[4]);

                  if(dateInc==dateWithVal )
                  {
                    switch(i)
                    {
                      case 0:
                        data.push(results[k].Devices[0].Current);
                        break;
                      case 1:
                        data.push(results[k].Devices[0].RealPower);
                        break;
                      case 2:
                        data.push(results[k].Devices[0].PowerFactor);
                        break;
                      default:
                        break; 
                    }

                    k++;
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
  }

}


//Render grapgh for single selected parameter
function RenderGraph()
{
  var html;

  html='<br>';
  html+='<div class="row">';
  html+='<div class="col-sm-offset-4" >';
  html+='<p  style="color: green; font-size:22px "> <b>'+ option +' of '+appliance+' - Board 1</b> </p>';
  html+='</div>';
  html+='</div>';
  html+='<br>'
  html+='<div class="row">';
  html+='<div class="col-sm-12"  id="graph">';
  html+='</div>';
  html+='<div class="col-sm-offset-6">';
  html+='<button  type="button" class="btn btn-info" onclick="RenderTable()">View Details</button>';
  html+='</div>';
  html+='</div>';

  $("#middle-screen").html(html);


  var x_title = "Time and Date";
  var y_title ='';
  var unit='';
  var k=0;                // to increment results length 
  var dateWithVal;        //to compare the value of date and time from database with every point of grapgh

  switch(option) 
  {
    case "Voltage":
      y_title = 'Voltage (Vrms)';
      unit=' Volts';
      break;
    case "Current":
      y_title = 'Current (Arms)';
      unit=' Ampere';
      break;
    case "RealPower":
      y_title = 'Real Power';
      unit=' Watts';
      break;
    case "PowerFactor":
      y_title = 'Power Factor';
      unit='';
    default:
      unit='';
  }

  $('#graph').highcharts({
    chart: {
      type: 'line',
      zoomType: 'x',
      panning: true,
      panKey: 'shift'
    },

    title: {
      text: appliance+' - Board 1'  
    },

    subtitle: {
      text: y_title
    },

    xAxis: {
        type: 'datetime',
        minTickInterval: 60 * 1000,       
        
        title: {
            text: x_title
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
        name: option,
        pointInterval:  60 * 1000,      // per minute
        pointStart: Date.UTC(yyyy, mm-1, dd, hh, min),
        data : (function () {
            // generate an array of random data
            var data = [];

            for (var j = 0; j <totalPoints; j++) 
            {
              if(k<resultsLen)
              {

                tokens=results[k].DateTime.split("-");
                dateWithVal = Date.UTC(tokens[0],tokens[1]-1,tokens[2],tokens[3],tokens[4]);

                if(dateInc==dateWithVal )
                {
                  switch(option)
                  {
                    case "Current":
                      data.push(results[k].Devices[0].Current);
                      break;
                    case "RealPower":
                      data.push(results[k].Devices[0].RealPower);
                      break;
                    case "PowerFactor":
                      data.push(results[k].Devices[0].PowerFactor);
                      break;
                    default:
                      break; 
                  }

                  k++;
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

}


function RenderTableAll()
{
  var html;

  offset = 10;
  pageCounter = 1;
  count = 0;

  $("#footer").css("margin-top","124px");

  html='<br>';
  html+='<div class="row">';
  html+='<div class="col-sm-offset-4" >';
  html+='<p  style="color: green; font-size:22px "> <b>Details of '+appliance+' - Board 1</b> </p>';
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
  html+='<th>Voltage (Volts)</th>';
  html+='<th>Current (Ampere)</th>';
  html+='<th>Real Power (Watts)</th>';
  html+='<th>pf</th>';
  html+='</tr>';
  html+='</thead>';
  html+='<tbody id="table-body">';
  html+='</tbody>';
  html+='</table>';
  html+='</div>';
  html+='</div>';

  html+='<div class="row" id="next-back-bottom">';
  html+='<div class="col-sm-3 col-sm-offset-2">';
  html+='<button  type="button" class="btn btn-info btn-block" onclick="RenderGraphAll()">View Graphs</button>';
  html+='</div>';
  html+='<div  class=" col-sm-1 col-sm-offset-3">';
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

  RenderTableBodyAll();

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
  html+='<p  style="color: green; font-size:22px "> <b>Details of '+ option +' of '+appliance+' - Board 1</b> </p>';
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
  switch(option)
  {

    case "Current":
      html+='<th>Current (Ampere)</th>';
      break;
    case "RealPower":
      html+='<th>Real Power (Watts)</th>';
      break;
    case "PowerFactor":
        html+='<th>Power Factor</th>';
      break;
    default:
      break; 
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
  html+='<button  type="button" class="btn btn-info btn-block" onclick="RenderGraph()">View Graph</button>';
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

  if(option=="All")
  {
    RenderTableBodyAll();
  }
  else
  {
    RenderTableBody();
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

  if(option=="All")
  {
    RenderTableBodyAll();
  }
  else
  {
    RenderTableBody();
  }
   
}

function RenderTableBodyAll()
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

    htmlB+="<td>";
    htmlB+=results[n].Devices[0].Current;
    htmlB+="</td>";

    htmlB+="<td>";
    htmlB+=results[n].Devices[0].RealPower;
    htmlB+="</td>";

    htmlB+="<td>";
    htmlB+=results[n].Devices[0].PowerFactor;
    htmlB+="</td>";

    htmlB+="</tr>";

    $("#table-body").append(htmlB);

    count++;
  }

}


function RenderTableBody()
{
  var htmlB;
  var dt;       //value of dateTime
  var val;      //value of option like current etc
  var tks;      //store value after split
  var count=0;  // to have 10 results on one page

  for(var n=offset-10; n<resultsLen && count<10; n++)
  {

    tks=results[n].DateTime.split("-");
    dt = new Date(tks[0],tks[1]-1,tks[2],tks[3],tks[4]).toLocaleString();

    switch(option)
    {

      case "Current":
        val = results[n].Devices[0].Current;
        break;
      case "RealPower":
        val = results[n].Devices[0].RealPower;
        break;
      case "PowerFactor":
        val = results[n].Devices[0].PowerFactor;
        break;
      default:
        break; 
    }

    htmlB="<tr>";

    htmlB+="<td>";
    htmlB+=n+1;
    htmlB+="</td>";

    htmlB+="<td>";
    htmlB+=dt;
    htmlB+="</td>";

    htmlB+="<td>";
    htmlB+=val;
    htmlB+="</td>";

    htmlB+="</tr>";

    $("#table-body").append(htmlB);

    count++;
  }

}


function ChangeOption(arg)
{

  switch(arg)
  {
    case 1:
     option = "Current";
     RenderTable();
     break;
    case 2:
     option = "RealPower";
     RenderTable();
     break;
    case 3:
     option = "PowerFactor";
     RenderTable();
     break;
    default:
      option = "All"
      RenderTableAll();
      break;
  }
}
