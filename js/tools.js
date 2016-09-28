(function() {
  'use strict';

  angular
    .module('windApp')
    .factory('tools', tools);

  function tools() {

    return {
      // MAP ZOOM
      // function zoomed() {
      //   g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      //   g.select(".land").style("stroke-width", 0.5 / d3.event.scale + "px");
      // }

      // WAVE COLOR SCALE
      waveColor: function(value) {
        return d3.scale.linear()
          .domain([0, 8])
          .range(["hsl(195, 100%, 80%)", "hsl(195, 100%, 40%)"])(value);
      },

      // WIND COLOR SCALE
      windColor: function(value) {
        return d3.scale.linear()
          .domain([0, 20])
          .range(["blue", "red"])(value);
      },

      // FORECAST SLIDER TICK FORMATTER
      tickFormatter: function(d) {
        if (d === 0) {
          return "Now";
        } else {
          return "+" + d + " Hrs";
        }
      },

      // FORMULAS FROM http://www.movable-type.co.uk/scripts/latlong.html
      toRad: function(deg) {
        return deg * Math.PI / 180;
      },
      toDeg: function(rad) {
        return rad * 180 / Math.PI;
      },
      lonLat: function(lonLat, d, dir) {
        var R = 6371; // Earth's radius in km
        var lon1 = this.toRad(lonLat[0]),
          lat1 = this.toRad(lonLat[1]);
        var lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) + Math.cos(lat1) * Math.sin(d / R) * Math.cos(dir));
        var lon2 = lon1 + Math.atan2(Math.sin(dir) * Math.sin(d / R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2));
        return [this.toDeg(lon2), this.toDeg(lat2)];
      }

    }
  }

})();
