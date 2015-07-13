'use strict';

(function(){

  angular
  .module('stormpathIdpApp', [
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/register', {
        templateUrl: 'views/registration.html',
        controller: 'RegistrationCtrl'
      })
      .when('/forgot/:retry?', {
        templateUrl: 'views/forgot.html',
        controller: 'ForgotCtrl'
      })
      .when('/reset', {
        templateUrl: 'views/reset.html',
        controller: 'ResetCtrl'
      })
      .when('/verify', {
        templateUrl: 'views/verify.html',
        controller: 'VerifyCtrl'
      })
      .when('/unverified', {
        templateUrl: 'views/unverified.html',
        controller: 'UnverifiedCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function(Stormpath,$window,$document){
    Stormpath.init.catch(function(err){
      if(err && err.status === 401){

        // In this block, we handle what happens if the JWT
        // for ID Site has expired

        // First we blank out the page (to hide the default error message)

        document.body.innerHTML = '';

        // If you want the user to stay on ID Site, then send
        // them to the URL on your site that triggers the
        // redirect to ID Site.  They will be redirected back
        // to ID site with a new JWT:

        $window.location.replace('http://yousite.com/login');

        // If you want the user to return to your site (requiring
        // them to click the login buttom manually) then you can
        // simply redirect them back to the page they came from:
        //
        //   $window.location.replace($document.referrer);

      }
    });
  });
})(window);