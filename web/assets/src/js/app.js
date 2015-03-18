var app = angular.module('codeMon', ['ngMaterial', 'ngFx', 'angularMoment', 
                                     'angular-loading-bar', 'ui.router', 'hljs', 
                                     'cfp.loadingBar', 'diff-match-patch'])
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

app.controller('RightNavCtrl', ['$scope', '$mdSidenav', function($scope, $mdSidenav){
  $scope.close = function(){}
}]);
app.controller('LeftNavCtrl', ['$scope', '$mdSidenav', function($scope, $mdSidenav){
  $scope.close = function(){}
}]);

app.controller('sessionCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$http', 
                               'cfpLoadingBar', '$mdSidenav', '$mdMedia', 'moment',
                               'SessionService', 
                               function($rootScope, $scope, $state, $stateParams, $http, 
                                        cfpLoadingBar, $mdSidenav, $mdMedia, moment,
                                        SessionService){
  
  $scope.selectedFile = '';
                                 
  $scope.selectChange = function(index){
    SessionService.selected().select(index);
    $scope.$broadcast('refreshContent');
  }
  
  $scope.changeFile = function(index){ 
    SessionService.selected().selectFile(index);
    $scope.$broadcast('refreshContent');
  }
  
  $scope.$on('refreshContent', function(){
    $scope.session = SessionService.selected();
    $scope.content = SessionService.selected().getContent();
    $scope.diff = SessionService.selected().getDiff();
    $scope.changes = SessionService.selected().getChanges();
    $scope.currentChanges = SessionService.selected().currentChanges;
    $scope.filename = SessionService.selected().getFilename();
    $scope.files = SessionService.selected().getFiles();
    $scope.changesInCurrentFile = SessionService.selected().getChangesInSelectedFile();
  });
  
  $scope.momentjs = moment;
  $rootScope.back = 'dashboard';
  if(SessionService.selected().getId() === false)
  {
    $http.get('changes/' + $stateParams.id)
        .success(function(data, status, headers, config){
          SessionService.selected({
              id: data.results[0].parent.id,
              changes: data.results
            });
          $scope.$broadcast('refreshContent');
        })
        .error(function(data, status, headers, config){});
  }
  else
  {
    $scope.$broadcast('refreshContent');
  }
}]);


app.controller('codeMonDashCtrl', ['$rootScope', '$scope', '$mdDialog', '$mdToast',
                                   '$http', '$timeout', 
                                   'moment', '$state', '$animate',
                                   '$stateParams', 'SessionService', 
                                   function($rootScope, $scope, $mdDialog, $mdToast,
                                            $http, $timeout, 
                                             moment, $state, $animate,
                                            $stateParams, SessionService){
    'use strict';
    $scope.loading = 0;
    $scope.sessions = []
    $scope.momentjs = moment
    
    $scope.selectItem = function($index, item){
      
      if($rootScope.dataLoading == 1)
      {
          $scope.showSimpleToast();
          return false;
      }
      
      
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
            item.changes = data.results;
          })
          .error(function(data, status, headers, config){});
      };
    }
    
    $scope.$on('startPopulateItem', function(){
      var session_list = SessionService.sessions();
      var end = session_list.length;
      for(var i = 0; i < end; i++)
      {
        $timeout(populateItems(session_list[i]), i * 300);
      }
    });
    
    if(SessionService.sessions().length)
    {
      $scope.$broadcast('startPopulateItem');
    }
    else
    {
      $http.get('sessions').
        success(function(data, status, headers, config){
          SessionService.sessions(data.results);
            $scope.$broadcast('startPopulateItem');
        }).
        error(function(data, status, headers, config){
        })
    }
                                     
  $scope.toastPosition = {
    bottom: false,
    top: true,
    left: false,
    right: true
  };
  $scope.getToastPosition = function() {
    return Object.keys($scope.toastPosition)
      .filter(function(pos) { return $scope.toastPosition[pos]; })
      .join(' ');
  };
  $scope.showSimpleToast = function() {
    $mdToast.show(
      $mdToast.simple()
        .content('Chill bro, not yet finish loading.')
        .position($scope.getToastPosition())
        .hideDelay(3000)
    );
  };
    
}]);