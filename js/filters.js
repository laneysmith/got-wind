(function() {
  'use strict';

  angular
    .module('windApp')
    .filter('degreeFilter', degreeFilter);

  function degreeFilter() {
    return function degreesToCardinal(degrees) {
      var cardinal = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
      var index = parseInt((degrees / 22.5) + 0.5);
      return cardinal[index % 16];
    }
  }

})();
