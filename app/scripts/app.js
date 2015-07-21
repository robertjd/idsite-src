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
  .run(function(Stormpath,$window){
    var window = $window;
    Stormpath.init.catch(function(err){
      if(err && err.status === 401 || err.message.match(/jwt not found/)){
        if(window.location.host.match(/localhost/)){
          var path = '/' + window.location.hash.match(/#\/[^\?]*/)[0];
          document.body.innerHTML = 'Fetching JWT..';
          window.$.ajax({
            url: '/jwt?path=' + encodeURIComponent(path)
          }).done(function(hash) {
            window.location.hash = hash;
            window.location.reload();
          });
        }
      }
    });
  });
})(window);