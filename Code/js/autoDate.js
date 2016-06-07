$(document).ready(function(){

	var from;
	var to;

	from =  GetDateString("from");
	to = GetDateString("to"); 

	$("#datepicker1").val(from);
	$("#datepicker2").val(to);

});


function GetDateString(arg)
{
  var date;
  var yyyy;
  var mm;
  var dd;
  var hh;
  var min;
  var dateTime;

  if(arg=="from")
  {
    date = new Date();

    dd = date.getDate()-1;
  	mm = date.getMonth()+1;       //January is 0!
  	yyyy = date.getFullYear();
  
  }
  else
  {
    date = new Date();

    dd = date.getDate();
  	mm = date.getMonth()+1;       //January is 0!
  	yyyy = date.getFullYear();
  }

  if(dd<10) {
    dd='0'+dd;
  } 

  if(mm<10) {
    mm='0'+mm;
  }

  date = yyyy+'-'+mm+'-'+dd;

  return date;
}