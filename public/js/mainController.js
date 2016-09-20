(function() {
  'use strict';

  angular
    .module('windApp')
    .controller('MainController', MainController);

		MainController.$inject = ['$scope', 'dataFactory'];

    function MainController($scope, dataFactory) {

      $scope.timeIndex = 0;
      $scope.select;

      // dataFactory.getWind().then(function(data) {
      //   console.log("data=", data);
      //   $scope.wind = data
      // })

      // FORECAST SLIDER
      var slider = d3.slider().min(0).max(12).tickValues([0, 3, 6, 9, 12]).stepValues([0, 3, 6, 9, 12]).tickFormat(tickFormatter).showRange(true);
      d3.select('#slider').call(slider);
      slider.callback(updateTime);

      // RENDER MAP
      var width = 500,
        height = 400;

      var projection = d3.geo.albers()
        .center([20, 35])
        .scale(19000)
        .translate([width / 2, height / 2]);

      var path = d3.geo.path()
        .projection(projection);

      // var zoom = d3.behavior.zoom()
      //   .translate([0, 0])
      //   .scale(1)
      //   .scaleExtent([-8, 8])
      //   .on("zoom", zoomed);

      var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);

      svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        // .call(zoom);

      var g = svg.append("g");

      // svg
      //   .call(zoom)
      //   .call(zoom.event);

      d3.json("data/maps/states.json", function(error, us) {

        // FORMAT WIND/WAVE DATA
        var wind = allData.data;
        var len = wind.location.length;
        var windInfo = allData.head;
        var windLocation = wind.location;
        var windParameters = wind.parameters;
        var weatherArray = [];
        for (let i = 0; i < len; i++) {
          var dataPoint = {
            lat: parseFloat(windLocation[i].point["latitude"]),
            lon: parseFloat(windLocation[i].point["longitude"]),
            dir: windParameters[i].direction.value,
            spd: windParameters[i]["wind-speed"][0].value,
            gust: windParameters[i]["wind-speed"][1].value,
            wave: windParameters[i]["water-state"].waves.value,
          }
          weatherArray.push(dataPoint)
        }

        $scope.$apply(function() {
          $scope.selected = weatherArray[0];
        });

        // WAVE CIRCLES
        g.selectAll("circle")
          .data(weatherArray.filter(function(d) {
            if (isNaN(d.wave[$scope.timeIndex])) {
              return false;
            } else {
              return true;
            };
          }))
          .enter()
          .append('circle')
          .on("click", selectPoint)
          .attr("class", "waves")
          .attr("r", 35)
          .attr("transform", function(d) {
            return "translate(" + projection([d.lon, d.lat]) + ")";
          })
          .attr("fill", function(d) {
            return waveColor(parseInt(d.wave[$scope.timeIndex]))
          });

        // STATES
        if (error) throw error;
        g.selectAll("path")
          .data(us.features)
          .enter()
          .append("path")
          .attr("class", "land")
          .style("stroke-width", "0.5px")
          .attr("d", path)
        g.selectAll(".pin")
          .data(cities)
          .enter().append("circle", ".pin")
          .attr("r", 2)
          .attr("transform", function(d) {
            return "translate(" + projection([
              d.lon,
              d.lat
            ]) + ")";
          })
          .text(function(d) {
            return d.city;
          });

        // WIND VECTORS
        g.selectAll(".thing")
          .data(weatherArray)
          .enter()
          .append("line")
          .attr({
            x2: function(d) {return d.lat},
            y2: function(d) {return d.lon},
            x1: function(d) {return (d.lat + (parseInt(d.spd[$scope.timeIndex])))},
            y1: function(d) {return (d.lon + (parseInt(d.spd[$scope.timeIndex])))},
          })
          .attr("stroke-width", 2)
          .attr("stroke", function(d) {
            return windColor(parseInt(d.spd[$scope.timeIndex]))
          })
          .on("click", selectPoint)
          .attr("transform", function(d) {
            return "translate(" + projection([
              d.lon,
              d.lat
            ]) + ") rotate(" + (d.dir[$scope.timeIndex]) + ")";
          })
          .call(lineAnimate);

        // CITY LABELS
        g.selectAll(".place-label")
          .data(cities)
          .enter().append("text")
          .attr("class", "place-label")
          .attr("transform", function(d) {
            return "translate(" + projection([d.lon, d.lat]) + ")";
          })
          .attr("dy", ".35em")
          .text(function(d) {
            return d.city;
          });

        g.selectAll(".place-label")
          .attr("x", function(d) {
            return d.lon > -1 ? 6 : 8;
          })

      });

      // UPDATE DATA BASED ON SELECTED POINT
      function selectPoint(d) {
        $scope.$apply(function() {
          $scope.selected = d;
        })
        var coords = projection([d.lon, d.lat])
        g.select("selected")
          .style("fill", "white")
        g.append("circle", "selected")
          .attr("cx", coords[0])
          .attr("cy", coords[1])
          .attr("r", 5)
          .style("fill", "black");
      }




      // function zoomed() {
      //   g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      //   g.select(".land").style("stroke-width", 0.5 / d3.event.scale + "px");
      // }

      d3.select(self.frameElement).style("height", height + "px");

      // FORECAST SLIDER TICK FORMATTER
      function tickFormatter(d) {
        if (d === 0) {
          return "Now"
        } else {
          return "+" + d + " Hrs";
        }
      }

      // CHANGE FORECAST TIME
      function updateTime(slider) {
        $scope.$apply(function() {
          if (slider.value() === 0) {
            $scope.timeIndex = 0;
          } else {
            $scope.timeIndex = slider.value() / 3;
          }
          g.selectAll(".waves")
            .attr("fill", function(d) {
              return waveColor(parseInt(d.wave[$scope.timeIndex]))
            });
        })
      }

      // WAVE COLOR
      function waveColor (value) {
        return d3.scale.linear()
          .domain([0, 8])
          .range(["yellow", "red"])(value);
      }

      // WIND COLOR
      function windColor (value) {
        return d3.scale.linear()
          .domain([0, 20])
          .range(["blue", "red"])(value);
      }

      // WIND VECTOR ANIMATION
      function lineAnimate(selection) {
        selection
          .attr({
            x2: function(d) {return (d.lat + (parseInt(d.spd[0])))},
            y2: function(d) {return (d.lon + (parseInt(d.spd[0])))}
          })
          .style('opacity', 0)
          .transition()
          .ease('linear')
          .duration(1000)
          .delay(function(d) {
            return d.spd[0] * 10;
          })
          .attr({
            x2: function(d) {return d.lat},
            y2: function(d) {return d.lon}
              })
            .style('opacity', 1)
            .transition()
            .duration(1000)
            .style('opacity', 0.1)
            .each('end', function() {
              d3.select(this).call(lineAnimate)
            });
          }

      // Formulas from http://www.movable-type.co.uk/scripts/latlong.html
      // function toRad(deg) {return deg * Math.PI / 180;}
      // function toDeg(rad) {return rad * 180 / Math.PI;}
      // function lonLat(lonLat, d, dir) {
      //   var R = 6371; // Earth's radius in km
      //   var lon1 = toRad(lonLat[0]),
      //     lat1 = toRad(lonLat[1]);
      //   var lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) + Math.cos(lat1) * Math.sin(d / R) * Math.cos(dir));
      //   var lon2 = lon1 + Math.atan2(Math.sin(dir) * Math.sin(d / R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2));
      //   return [toDeg(lon2), toDeg(lat2)];
      // }

    }

})();
