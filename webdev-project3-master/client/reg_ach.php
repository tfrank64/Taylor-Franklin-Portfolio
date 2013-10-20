<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Register Achievements Page</title>
  
   <script>

  // Load the JavaScript SDK Asynchronously
  (function(d){
    var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    d.getElementsByTagName('head')[0].appendChild(js);
  }(document));

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '364074063698127', // App ID
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      frictionlessRequests : true, // enable frictionless requests
      xfbml      : true  // parse XFBML
    });
  }
  
  
      var appToken='<?php
      $APPLICATION_ID = '364074063698127';
      $APPLICATION_SECRET = '892657deaea4b82bc332b21d69263779';

      $token_url ="https://graph.facebook.com/oauth/access_token?" .
      "client_id=" . $APPLICATION_ID .
      "&client_secret=" . $APPLICATION_SECRET .
      "&grant_type=client_credentials";
      $result=file_get_contents($token_url);
      $pieces=explode("=", $result);
      echo $pieces[1];
      ?>';

      //alert(appToken);
	  
	  
	    function registerAchievement(url) {
			FB.api( '/364074063698127/achievements', 'post', {
				'achievement': url,
				'access_token': appToken,
				'display_order': 1      
			  }, function(response) {
				if (response.error) {
				  document.getElementById('mymessage').innerHTML = response.error.message;
				} else {
				  document.getElementById('mymessage').innerHTML = "Thanks. This achievement has been registered with Facebook.";
				}
			});
		  }
</script>
  
</head>


<body>

<div id="fb-root"></div>
<div id="mymessage"></div>

<button id="register" onclick="registerAchievement('http://taylor.johnellmore.com/testShip/ach1.html')">Register</button><br />
</body>
</html>