$(function() {
    
    $("#logout").click(ajaxCallOut);
});


function ajaxCallOut()
{
    $.ajax({
        type:"GET",
        url:"/logout",
        success:function(response){
            
            if(response == 'Session Destroyed')
            {
                window.location.replace("login.html");
            }
            else
            {
                $("#divn").html("Session not destroyed");
            }
        }
    });
    
}