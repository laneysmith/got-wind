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

      // RENDER MAP
      var width = 400,
        height = 450;
      var projection = d3.geo.albers()
        .center([20, 35.38])
        .scale(12700)
        .translate([width / 2, height / 2]);
      var path = d3.geo.path()
        .projection(projection);
      var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([-8, 8])
        // .on("zoom", zoomed);
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
        $scope.$apply(function() {
          $scope.date = allData.head.product["creation-date"]._;
        });
        var windLocation = wind.location;
        var windParameters = wind.parameters;
        var weatherArray = [];
        for (let i = 0; i < len; i++) {
          var lat = parseFloat(windLocation[i].point["latitude"]);
          var lon = parseFloat(windLocation[i].point["longitude"]);
          var lonLat0 = [lon, lat];
          var x0y0 = projection(lonLat0);
          var dataPoint = {
            x0: x0y0[0],
            y0: x0y0[1],
            x1: [],
            y1: [],
            lat: lat,
            lon: lon,
            duration: [],
            delay: Math.random() * 1000,
            dir: [],
            spd: windParameters[i]["wind-speed"][0].value,
            gust: windParameters[i]["wind-speed"][1].value,
            wave: windParameters[i]["water-state"].waves.value,
          }
          for (let j = 0; j < windParameters[j].direction.value.length; j++) {
            let speed = parseFloat(windParameters[i]["wind-speed"][0].value[j]);
            let dir = parseFloat(windParameters[i].direction.value[j]);
            dataPoint.dir.push(dir)
            if (dir+180 > 360) {
              dir -= 180;
            } else {
              dir += 180;
            }
            let lonLat1 = lonLat(lonLat0, 0.9 * speed, toRad(dir));
            let x1y1 = projection(lonLat1);
            dataPoint.x1.push(x1y1[0])
            dataPoint.y1.push(x1y1[1])
            dataPoint.duration.push(8000 / speed)
          }
          weatherArray.push(dataPoint)
        }
        console.log(weatherArray);
        $scope.$apply(function() {
          $scope.weatherArray = weatherArray;
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
          .attr("r", 25)
          .attr("cx", function(d) {return d.x0})
          .attr("cy", function(d) {return d.y0})
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
        function renderWindVectors () {
          return g.selectAll("line")
            .data(weatherArray)
            .enter()
            .append("line")
            .attr({
              x1: function(d) {return d.x0},
              y1: function(d) {return d.y0}
            })
            .call(lineAnimate)
            .on("click", selectPoint)
            .attr("stroke-width", 2)
            .attr("stroke", function(d) {
              return windColor(parseInt(d.spd[$scope.timeIndex]))
            });
        }
        renderWindVectors();

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
          })
          .attr("x", function(d) {
            return d.lon > -1 ? 6 : 8;
          });

      });

      // UPDATE DATA BASED ON SELECTED POINT
      function selectPoint(d) {
        $scope.$apply(function() {
          $scope.selected = d;
        })
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
          // RECOLOR EXISTING WAVES
          g.selectAll(".waves")
            .attr("fill", function(d) {
              return waveColor(parseInt(d.wave[$scope.timeIndex]))
            });
        })
      }

      // WAVE COLOR SCALE
      function waveColor (value) {
        return d3.scale.linear()
          .domain([0, 8])
          .range(["yellow", "red"])(value);
      }

      // WIND COLOR SCALE
      function windColor (value) {
        return d3.scale.linear()
          .domain([0, 20])
          .range(["blue", "red"])(value);
      }
//
      // WIND VECTOR ANIMATION from https://github.com/Wolfrax/Swind
      function lineAnimate(selection) {
        selection
          .attr({
            x2: function(d) {return d.x0},
            y2: function(d) {return d.y0}
          })
          .style('opacity', 0)
          .transition()
            .ease('linear')
            .duration(function(d) {return d.duration[$scope.timeIndex]})
            .delay(function(d) {return d.delay})
            .attr({
              x2: function(d) {return d.x1[$scope.timeIndex]},
              y2: function(d) {return d.y1[$scope.timeIndex]}
            })
            .style('opacity', 0.8)
          .transition()
            .duration(1000)
            .style('opacity', 0.1)
          .each('end', function() {d3.select(this).call(lineAnimate)});
        }

      // FORECAST SLIDER
      var slider = d3.slider().min(0).max(12)
        .tickValues([0, 3, 6, 9, 12])
        .stepValues([0, 3, 6, 9, 12])
        .tickFormat(tickFormatter)
        .showRange(true);
      d3.select('#slider').call(slider);
      slider.callback(updateTime);

      // FORMULAS FROM http://www.movable-type.co.uk/scripts/latlong.html
      function toRad(deg) {return deg * Math.PI / 180;}
      function toDeg(rad) {return rad * 180 / Math.PI;}
      function lonLat(lonLat, d, dir) {
        var R = 6371; // Earth's radius in km
        var lon1 = toRad(lonLat[0]),
          lat1 = toRad(lonLat[1]);
        var lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) + Math.cos(lat1) * Math.sin(d / R) * Math.cos(dir));
        var lon2 = lon1 + Math.atan2(Math.sin(dir) * Math.sin(d / R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2));
        return [toDeg(lon2), toDeg(lat2)];
      }

    }

})();
