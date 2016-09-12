(function() {
  'use strict';

  angular
    .module('windApp')
    .controller('MainController', MainController);

		MainController.$inject = ['$scope', 'dataFactory'];

    function MainController($scope, dataFactory) {
      $scope.city = "Waves, NC";
      // dataFactory.getWind().then(function(data) {
      //   console.log("data=", data);
      //   $scope.wind = data
      // })
      $scope.thing = "abc";
    }

})();
