angular.module('Application', ['ui.router', 'app-templates'])
.controller('ListController', function () {

})
.controller('MainController', function () {

})
.config(function($stateProvider, $locationProvider) {
  $stateProvider
    .state('base', {
      abstract: true,
      url: '/',
      controller: 'MainController',
      templateUrl: 'js/templates/base.html'
    })
    .state('list', {
      parent: 'base',
      url: '',
      templateUrl: 'js/templates/list.html',
      controller: 'ListController'
    });
  $locationProvider.html5Mode(true);
});
