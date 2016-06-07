var image;
var interval;

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
        $("#user-name").html(response.uName);  
        ajaxCall();
        //interval = setInterval(ajaxCall, 10*1000);
      }
      
    }
  }); 
}

function ajaxCall()
{

  var counter=0;      //to increment according no. of devices whose data is available

  $.ajax({
    type:"GET",
    url:"/DeviceStateAndParameters",
    success:function(response){
      if(response.status == 'Incorrect')
      {
        $("#States-Error").html("Error while getting the states of the Devices, Try again by reloading the page.");
      } 
      else if (response.status == 'Correct')
      {
        console.log(response.states.length);

        if(response.resultStatus == "Found" )
        {
          if(response.data[0].Voltage<200 || response.data[0].Voltage>240)
          {
            $("#voltage-board").css("color","red");
          }
          else
          {
            $("#voltage-board").css("color","#315D7B");
          }

          $("#voltage-board").html(response.data[0].Voltage);

          for(var i=0; i<response.states.length; i++)
          {
            console.log("Device "+(i+1) + " : "+response.states[i]);

            image = document.getElementById("device-"+(i+1)+"");

            if(response.states[i])
            {
              image.src="../images/on.png";

              if(response.devicesWithData.indexOf(i+1) != -1)
              {
                $("#current-device-"+(i+1)+"").html(response.data[0].Devices[counter].Current);
                $("#power-device-"+(i+1)+"").html(response.data[0].Devices[counter].RealPower);
                $("#pF-device-"+(i+1)+"").html(response.data[0].Devices[counter].PowerFactor);
              }
              else
              {
                $("#para-device-"+(i+1)+"").css("color","#315D7B");
                $("#para-device-"+(i+1)+"").css("font-size","12px");
                $("#para-device-"+(i+1)+"").html("<br><p>Device is just turned ON!</p><p>Values will be available within a minute.</p>");
              }  
              counter++;
            }
            else
            {
              image.src="../images/off.png";
            }
          }
        }
        else
        {
          $("#board").html('<br><div class="row"><div class="col-sm-offset-3 col-sm-7" style="color:red; font-size:24px" ><p>Load Shedding or Connection Error</p></div></div>');
        }
      }
    }
  }); 
}
 


function UpdateImage(id)
{

  var deviceState;
  image = document.getElementById("device-"+id+"");

  if (image.src.match("off")) 
  {
    image.src = "../images/on.png";
    deviceState = id+"1";
    UpdateState(deviceState);
  } 
  else 
  {
    image.src = "../images/off.png";
    deviceState = id+"0";
    UpdateState(deviceState);
  }

}

function UpdateState(deviceState)
{
  console.log(deviceState);
  $.ajax({

    type:"POST",
    url:"/DeviceControl",
    data:{state:deviceState},
    success:function(response){
     if(response == "Failed")
     {
      console.log("Error-Update State (View Board)");
     }
    }
  });
}
