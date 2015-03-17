var app = angular.module('codeMon', ['ngMaterial', 'ngFx', 'angularMoment', 
                                     'angular-loading-bar', 'ui.router', 'hljs', 'cfp.loadingBar'])
app.run(['$rootScope', 'cfpLoadingBar', function($rootScope, cfpLoadingBar){
  $rootScope.$on('cfpLoadingBar:loading', function(){
    $rootScope.dataLoading = 1;
  });
  $rootScope.$on('cfpLoadingBar:completed', function(){
    $rootScope.dataLoading = 0;
  });
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    if(toState.name === 'dashboard')
    {
      $rootScope.hideBack = 1;
    }
    else
    {
      $rootScope.hideBack = 0;
    }
  });
}]);

app.config(['$interpolateProvider', '$stateProvider', '$urlRouterProvider', function($interpolateProvider, $stateProvider, $urlRouterProvider){
  $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
  $urlRouterProvider.otherwise('/dashboard');
  $stateProvider
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'partials/dashboard.html',
      controller: 'codeMonDashCtrl'
    })
    .state('session', {
      url: '/session/{id}',
      templateUrl: 'partials/session.html',
      controller: 'sessionCtrl'
    })
}]);

app.controller('sessionCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$http', 'cfpLoadingBar', 'SessionService', 
                               function($rootScope, $scope, $state, $stateParams, $http, cfpLoadingBar, SessionService){
  $rootScope.back = 'dashboard';
  if(SessionService.selected().getId() === false)
  {
    $http.get('changes/' + $stateParams.id)
        .success(function(data, status, headers, config){
          $scope.filename = data.results[0].file;
          $scope.content = data.results[0].content;
        })
        .error(function(data, status, headers, config){});
  }
  else
  {
    $scope.session = SessionService.selected();
    $scope.content = $scope.session.getContent();
  }
}]);

app.controller('codeMonDashCtrl', ['$scope', '$mdDialog', 
                                   '$http', '$timeout', 
                                   'moment', '$state',
                                   '$stateParams', 'SessionService', 
                                   function($scope, $mdDialog, 
                                            $http, $timeout, 
                                             moment, $state,
                                            $stateParams, SessionService){
    'use strict';
    $scope.loading = 0;
    $scope.sessions = []
    $scope.momentjs = moment
    
    $scope.selectItem = function($index, item){
      
      SessionService.selected(item);
      
      var end = $scope.sessions.length;
      for(var i = 0; i < end; i++)
      {
        $timeout(removeAll(), i * 100);
      }
    }
    var removeAll = function(){
      return function(){
        $scope.sessions.pop();
        if($scope.sessions.length == 0)
        {
          $scope.$broadcast('sessionsAnimateOver');
        }
      }
    }
    
    $scope.$on('sessionsAnimateOver', function(){
      $state.go('session', {id:SessionService.selected().getId()});
    });
  
    var populateItems = function(item){
      return function(){
        item.updatedAt = moment(item.updatedAt.date+item.updatedAt.timezone)
        $scope.sessions.push(item);
        
        $http.get('changes/' + item.id)
          .success(function(data, status, headers, config){
            item.changes = {
              status: data.status,
              data: data.results
            }
          })
          .error(function(data, status, headers, config){});
      };
    }
    $http.get('sessions').
      success(function(data, status, headers, config){
        var end = data.results.length;
        for(var i = 0; i < end; i++)
        {
          $timeout(populateItems(data.results[i]), i * 300);
        }
      }).
      error(function(data, status, headers, config){
      })
    
    $scope.showAlert = function(ev) {
      console.log('clicked');
      $mdDialog.show(
        $mdDialog.alert()
          .title('This is an alert title')
          .content('You can specify some description text in here.')
          .ariaLabel('Password notification')
          .ok('Got it!')
          .targetEvent(ev)
      );
    };
    
}]);