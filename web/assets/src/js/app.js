var app = angular.module('codeMon', ['ngMaterial'])
            .config(function($interpolateProvider){
                $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
            });


app.controller('codeMonDash', ['$scope', '$mdDialog', function($scope, $mdDialog){
    'use strict';
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
  
    $scope.sessions = []
  
    for(var i = 0; i < 15; i++)
    {
      $scope.sessions.push({
        name: 'session-'+i
      });
    }
    console.log($scope.sessions);
  
    
}]);