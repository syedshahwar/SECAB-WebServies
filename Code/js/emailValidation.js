
var mail ='';
var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;


function EmailValidation(email)
{

	$("#empty-email-field").css('display', 'none');
  $("#empty-password-field").css('display', 'none');
  $("#invalid-email-alert").css('display', 'none');

	mail = email;

	if ($.trim(mail).length == 0) 
    {
            $("#empty-email-field").css('display', 'initial');
            $("#empty-email-field").html("<p style='color: #FF3333'>Please enter your email.</p>");
    }

    else
    {
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
}