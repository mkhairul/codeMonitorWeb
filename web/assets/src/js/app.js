var app = angular.module('codeMon', ['ngMaterial', 'ngFx', 'angularMoment', 'ngRoute', 'angular-loading-bar'])
            .config(function($interpolateProvider){
                $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
            });

app.config(['$routeProvider', function($routeProvider){
  $routeProvider.
    when('/dashboard', {
      templateUrl: 'partials/dashboard.html',
      controller: 'codeMonDash'
    }).
    otherwise({
      redirectTo:'/dashboard'
    })
}]);

app.controller('codeMonDash', ['$scope', '$mdDialog', '$http', '$timeout', 'moment', function($scope, $mdDialog, $http, $timeout, moment){
    'use strict';
    $scope.loading = 0;
    $scope.sessions = []
    $scope.momentjs = moment
    
    $scope.selectItem = function($index, item){
      console.log('selected')
      var end = $scope.sessions.length;
      for(var i = 0; i < end; i++)
      {
        $timeout(removeAll(), i * 300);
      }
    }
    var removeAll = function(){
      return function(){
        $scope.sessions.pop();
      }
    }
  
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
  
    
    /*
    for(var i = 0; i < 15; i++)
    {
      $scope.sessions.push({
        name: 'session-'+i
      });
    }
    console.log($scope.sessions);
    */
  
    
}]);