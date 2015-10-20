angular.module('pushupometer', ['ui.router', 'ngCookies', 'restangular', 'app-templates'])

  .controller('WorkoutController', function() {

  })

  .controller('ListController', function(GithubService) {
    var ctrl = this;
    this.members = [];

    GithubService.getMembers().then(function(members) {
      ctrl.members = members;

      angular.forEach(members, function(member) {
        GithubService.getStats(member.login).then(function(stats) {
          member.stats = stats;
        });
      });
    });
  })

  .controller('MainController', function($state, AuthService) {
    this.getCurrentUser = function() {
      return AuthService.getUser();
    };

    this.logout = function() {
      AuthService.logout();
      $state.go('login');
    };
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
    AUTH_URL: '/api/github/oauth',
    ORGANIZATION: 'StudyTube'
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
        templateUrl: 'js/templates/base.html',
        controllerAs: 'mainCtrl'
      })
      .state('login', {
        url: '/login?code=',
        templateUrl: 'js/templates/login.html',
        controller:  'LoginController',
        controllerAs: 'ctrl'
      })
      .state('list', {
        parent: 'base',
        url: '',
        templateUrl: 'js/templates/list.html',
        controller: 'ListController',
        controllerAs: 'ctrl'
      })
      .state('workout', {
        parent: 'base',
        url: 'workout/:user',
        templateUrl: 'js/templates/workout.html',
        controller: 'WorkoutController',
        controllerAs: 'ctrl'
      });
  })

  .run(function(AuthService, $state, $rootScope) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
      // this hack is required to allow resolve operate with current state
      $state.current = toState;

      AuthService.authenticate().catch(function() {
        if (toState.name !== 'login') {
          $state.go('login');
        }
      });
    });
  });
