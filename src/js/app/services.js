angular.module('pushupometer')
  .factory('ApiService', function (Restangular, SETTINGS) {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(SETTINGS.API_URL);
    });
  })
  .service('GithubService', function(ApiService, SETTINGS) {
    this.getMembers = function() {
      return ApiService.all('github').all('orgs').all(SETTINGS.ORGANIZATION).all('members').getList();
    }
  })
  .service('AuthService', function ($window, $q, $cookieStore, ApiService, SETTINGS) {
    var userData = false;

    this.getUser = function() {
      return userData;
    };

    this.gotoGithubOauth = function () {
      $window.location.href = SETTINGS.AUTH_URL;
    };

    this.authenticate = function (code) {
      var saveToken = function(accessToken) {
        $cookieStore.put('accessToken', accessToken);
        ApiService.setDefaultHeaders({'access_token': accessToken});
        return ApiService.all('github').one('user').get().then(function(data) {
          if (data.id !== undefined) {
            userData = data;
            return data;
          } else {
            return $q.reject(false);
          }
        });
      };

      if (code) {
        return this.generateToken(code).then(saveToken);
      }

      if ($cookieStore.get('accessToken')) {
        return saveToken($cookieStore.get('accessToken'));
      } else {
        return $q.reject(false);
      }
    };

    this.logout = function() {
      $cookieStore.remove('accessToken');
      ApiService.setDefaultHeaders({});
      userData = false;
      return $q.when(true);
    };

    this.generateToken = function (code) {
      return ApiService.all('github').one('gettoken', code).get().then(
        function (data) {
          return data.access_token ? data.access_token : $q.reject(false);
        });
    };
  });
