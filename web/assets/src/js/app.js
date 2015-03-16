var app = angular.module('codeMon', ['ngMaterial', 'ngFx'])
            .config(function($interpolateProvider){
                $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
            });


app.controller('codeMonDash', ['$scope', '$mdDialog', '$http', '$timeout', function($scope, $mdDialog, $http, $timeout){
    'use strict';
  
    var populateItems = function(data){
      return function(){
        $scope.sessions.push(data);
      };
    }
    
    $scope.loading = 0;
    $scope.sessions = []
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