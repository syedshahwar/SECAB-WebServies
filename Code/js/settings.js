var currentEmail='';
var newEmail='';
var currentPass='';
var newPass='';
var currentPassHash='';
var newPassHash='';
var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

window.onload=function(){
    
  $.ajax({
    type:"GET",
    url:"/sessionCheck",
    success:function(response){
            
      if(response == 'Incorrect')
      {
        window.location.replace("login.html");
      }

    }
  });
}

function ChangeEmail()
{
  $(".email").removeAttr('disabled');
}

function ChangePassword()
{

	$(".pass").removeAttr('disabled');
}

$(function() {
    
  $("#enter-email").click(EmailValidation);
  $("#enter-pass").click(PassValidation);

});

function EmailValidation()
{
  $("#empty-current-email").css('display', 'none');
  $("#invalid-current-email").css('display', 'none');

  $("#empty-new-email").css('display', 'none');
  $("#invalid-new-email").css('display', 'none');

  $("#success-change-email").css('display', 'none');


  currentEmail = $("#current-email").val();
  newEmail = $("#new-email").val();

  //if current email field is empty
  if ($.trim(currentEmail).length == 0) 
  {
    $("#empty-current-email").css('display', 'initial');
    $("#empty-current-email").html("<p style='color: #FF3333'>Please enter current email</p>");
  }

  //if new email field is empty
  else if ($.trim(newEmail).length == 0)
  {
    $("#empty-new-email").css('display', 'initial');
    $("#empty-new-email").html("<p style='color: #FF3333'>Please enter new email</p>");
  }

  else
  {
    if( validateCurrentEmail(currentEmail) )
    {
      $.ajax({
        type:"POST",
        url:"/verifyEmail",
        data: {email: currentEmail} ,
        success:function(response){
          if(response == 'Not Verified')
          {
            $("#invalid-current-email").css('display', 'initial');
            $("#invalid-current-email").html("<p style='color: #FF3333'>Your entered wrong curent email</p>");
          }
          else
          {

            if (currentEmail == newEmail)
            {
              $("#invalid-new-email").css('display', 'initial');
              $("#invalid-new-email").html("<p style='color: #FF3333'>You Entered the same email</p>");
            }
            else
            {

              if( validateNewEmail(newEmail) )
              {
                $.ajax({
                  type:"POST",
                  url:"/updateEmail",
                  data: {email: newEmail} ,
                  success:function(response){
                    if(response == 'Not Updated')
                    {
                      $("#invalid-new-email").css('display', 'initial');
                      $("#invalid-new-email").html("<p style='color: #FF3333'>Your entered new email already exists</p>");
                    }
                    else
                    {
                      $("#success-change-email").css('display', 'initial');
                      $("#success-change-email").html("Email Successfully Changed");
                      //setTimeout(out, 10000);
                    }  
                  } 
                });
              }
            }

            
          }
        }
      });
    }
  }
  
}


function validateCurrentEmail(mail) 
{
  if (filter.test(mail)) 
  {
    return true;
  }
  else 
  {
    $("#invalid-current-email").css('display', 'initial');
    $("#invalid-current-email").html("<p style='color: #FF3333'>You entered invalid current email</p>");
    return false;
  }
}

function validateNewEmail(mail) 
{
  if (filter.test(mail)) 
  {
    return true;
  }
  else 
  {
    $("#invalid-new-email").css('display', 'initial');
    $("#invalid-new-email").html("<p style='color: #FF3333'>You entered invalid new email</p>");
    return false;
  }
}



function PassValidation()
{
  $("#empty-current-pass").css('display', 'none');
  $("#invalid-current-pass").css('display', 'none');

  $("#empty-new-pass").css('display', 'none');
  $("#invalid-new-pass").css('display', 'none');

  $("#success-change-pass").css('display', 'none');


  currentPass = $("#current-pass").val();
  currentPassHash = CryptoJS.SHA256(currentPass).toString();

  newPass = $("#new-pass").val();
  newPassHash = CryptoJS.SHA256(newPass).toString();
  

  //if current password field is empty
  if ($.trim(currentPass).length == 0) 
  {

    $("#empty-current-pass").css('display', 'initial');
    $("#empty-current-pass").html("<p style='color: #FF3333'>Please enter current password</p>");
  
  }

  else if ($.trim(newPass).length == 0)
  {
    $("#empty-new-pass").css('display', 'initial');
    $("#empty-new-pass").html("<p style='color: #FF3333'>Please enter new password</p>");
   // $("#password").css('border-color','red');
  }

  else
  {
    $.ajax({
      type:"POST",
      url:"/verifyPassword",
      data: {password: currentPassHash} ,
      success:function(response){
        if(response == 'Not Verified')
        {
          $("#invalid-current-pass").css('display', 'initial');
          $("#invalid-current-pass").html("<p style='color: #FF3333'>You entered wrong current password</p>");
        }
        else
        {

          if (currentPass == newPass)
          {
            $("#invalid-new-pass").css('display', 'initial');
            $("#invalid-new-pass").html("<p style='color: #FF3333'>You Entered the same password</p>");
          }
          else
          {
            $.ajax({
              type:"POST",
              url:"/updatePassword",
              data: {password: newPassHash} ,
              success:function(response){
                if(response == 'Not Updated')
                {
                  $("#invalid-new-pass").css('display', 'initial');
                  $("#invalid-new-pass").html("<p style='color: #FF3333'>Password is not updated, Try again</p>");
                }
                else
                {
                  $("#success-change-pass").css('display', 'initial');
                  $("#success-change-pass").html("Password Successfully Changed");
                  //setTimeout(out, 10000);
                }  
              } 
            });
          }
        }
      }
    });
  }

}
/*
function out()
{
  window.location.replace("login.html");
}*/



	










