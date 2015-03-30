angular.module('Application', ['ngRoute', 'app-templates'])
.controller('MainController', function () {

})
.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'js/templates/index.html',
      controller: 'MainController'
    })
    .when('/index.html', {
      templateUrl: 'js/templates/index.html',
      controller: 'MainController'
    });

  $locationProvider.html5Mode(true);
});