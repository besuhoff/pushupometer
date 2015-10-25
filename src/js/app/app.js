angular.module('pushupometer', ['ui.router', 'ngCookies', 'restangular', 'app-templates'])

  .controller('WorkoutController', function() {

  })

  .controller('ListController', function(members, $stateParams) {
    this.members = members;
    this.filter = $stateParams.filter;
  })

  .controller('MainController', function($state, $scope, AuthService) {
    var ctrl = this;
    ctrl.stateChanging = false;

    //Call some code when a state change starts
    $scope.$on("$stateChangeStart", function () {
      ctrl.stateChanging = true;
    });

    //Call some code when a state change finishes
    $scope.$on("$stateChangeSuccess", function () {
      ctrl.stateChanging = false;
    });

    $scope.$on("$stateChangeSuccess", function () {
      ctrl.stateChanging = false;
    });


    this.getCurrentUser = function() {
      return AuthService.getUser();
    };

    this.logout = function() {
      AuthService.logout();
      $state.go('login');
    };

    var monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    var d = new Date();
    this.month = monthNames[d.getMonth()];
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
        url: '?filter=',
        templateUrl: 'js/templates/list.html',
        controller: 'ListController',
        controllerAs: 'ctrl',
        resolve: {
          members: function(GithubService, $stateParams) {
            return GithubService.getMembers($stateParams.filter).then(function(members) {
              angular.forEach(members, function(member) {
                GithubService.getStats(member.login).then(function(stats) {
                  member.stats = stats;
                });
              });

              return members;
            });

          }
        }
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
