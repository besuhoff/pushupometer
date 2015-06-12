angular.module('pushupometer', ['ui.router', 'ngCookies', 'restangular', 'app-templates'])

  .controller('ListController', function() {

  })

  .controller('MainController', function(AuthService) {
    this.getCurrentUser = function() {
      return AuthService.getUser();
    }
  })

  .controller('LoginController', function($state, $stateParams, AuthService){
    var ctrl = this;

    this.hideForm = true;

    this.gotoGithubOauth = function() {
      return AuthService.gotoGithubOauth();
    };

    var code = $stateParams.code;

    AuthService.authenticate(code).then(function(){
      $state.go('list');
    }).catch(function() {
      ctrl.hideForm = false;
    });
  })

  .constant('SETTINGS', {
    API_URL: '/api',
    AUTH_URL: '/api/github/oauth'
  })

  .config(function ($urlRouterProvider, $locationProvider, $stateProvider, RestangularProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise(function($injector) {
      $injector.get('$state').transitionTo('login');
      $injector.get('$rootScope').prerenderStatusCode = 404;
    });
    RestangularProvider.setMethodOverriders(["put", "post"]);

    $stateProvider
      .state('base', {
        abstract: true,
        url: '/',
        controller: 'MainController',
        templateUrl: 'js/templates/base.html'
      })
      .state('login', {
        parent: 'base',
        url: 'login/:code',
        templateUrl: 'js/templates/login.html',
        controller:  'LoginController',
        controllerAs: 'ctrl'
      })
      .state('list', {
        parent: 'base',
        url: '',
        templateUrl: 'js/templates/list.html',
        controller: 'ListController'
      });
  })

  .run(function(AuthService, $state, $rootScope) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
      // this hack is required to allow resolve operate with current state
      $state.current = toState;

      if (!AuthService.getUser() && toState.name !== 'login') {
        $state.go('login');
      }
    });
  });
