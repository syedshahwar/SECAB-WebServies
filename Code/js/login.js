var mail='';
var password='';
var passwordHash='';
var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

$(function() {
    
    $("#btn-login").click(validation);


    $("#forgot-password").click(function(){
        
        $("#container-login").hide();
        $("#container-forgot-password").show();
        
    });
    
    $("#back-to-login").click(function(){
        
        $("#container-forgot-password").hide();
        $("#container-login").show();
            
    });
 
});


function validation()
{

    $("#empty-email-field").css('display', 'none');
    $("#empty-password-field").css('display', 'none');
    $("#invalid-email-alert").css('display', 'none');
    $("#invalid-password-alert").css('display', 'none');
    $("#login-alert").css('display', 'none');


    mail = $("#email").val();
    password = $("#password").val();
    passwordHash = CryptoJS.SHA256(password).toString();

    //if email field is empty
    if ($.trim(mail).length == 0) 
    {
            $("#empty-email-field").css('display', 'initial');
            $("#empty-email-field").html("<p style='color: #FF3333'>Please enter your email.</p>");
           // $("#email").css('border-color','red');
    }

    //if password field is empty
    else if ($.trim(password).length == 0)
    {
            $("#empty-password-field").css('display', 'initial');
            $("#empty-password-field").html("<p style='color: #FF3333'>Please enter your password.</p>");
           // $("#password").css('border-color','red');
    }

    else
    {
        //if( validateEmail(mail) && validatePassword(password) )
        if( validateEmail(mail) )
        {

            //ajax call to check the email and password from database
            $.ajax({
            type:"POST",
            url:"/login",
            data: {email: mail , pass: passwordHash} ,
            success:function(response){
                if(response == 'Logged In')
                {
                    window.location.replace("index.html");
                }
                else
                {    
                    $("#login-alert").css('display', 'initial');
                    $("#login-alert").html("<p style='color: #FF3333'>Email or password is incorrect.</p>");
                }
            }
            });
        }
    }
}

function validateEmail(mail) {
    if (filter.test(mail)) 
    {
        return true;
    }
    else 
    {
        $("#invalid-email-alert").css('display', 'initial');
        $("#invalid-email-alert").html("<p style='color: #FF3333'>Email is invalid.</p>");
        return false;
    }
}

/*
function validatePassword(password) {
    var passLength = password.length;
    if (passLength >= 6) 
    {
        return true;
    }
    else 
    {
        $("#invalid-password-alert").css('display', 'initial');
        $("#invalid-password-alert").addClass("alert alert-warning");
        $("#invalid-password-alert").html("Password is invalid");
        return false;
    }
}
*/



