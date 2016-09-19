(function() {
  'use strict';

  angular
    .module('windApp')
    .controller('MainController', MainController);

		MainController.$inject = ['$scope', 'dataFactory'];

    function MainController($scope, dataFactory) {
      $scope.city = "Waves, NC";
      $scope.selected = {
        lat: 35.1,
        lon: -76.2,
        spd: [8],
        dir: [8],
        gust: [8],
        wave: [8]
      };
      $scope.timeIndex = 0;

      // dataFactory.getWind().then(function(data) {
      //   console.log("data=", data);
      //   $scope.wind = data
      // })

      // FORECAST SLIDER
      var slider = d3.slider().min(0).max(12).tickValues([0, 3, 6, 9, 12]).stepValues([0, 3, 6, 9, 12]).tickFormat(tickFormatter).showRange(true);
      d3.select('#slider').call(slider)

      function updateTime(slider) {
        $scope.$apply(function() {
          if (slider.value() === 0) {
            $scope.timeIndex = 0;
          } else {
            $scope.timeIndex = slider.value() / 3;
          }
          console.log("timeIndex=", $scope.timeIndex);
        })
      }

      slider.callback(updateTime)

      // RENDER MAP
      var width = 500,
        height = 500;

      var projection = d3.geo.albers()
        .center([20, 35])
        .scale(15000)
        .translate([width / 2, height / 2]);

      var path = d3.geo.path()
        .projection(projection);

      var zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([-8, 8])
        .on("zoom", zoomed);

      var svg = d3.select("#mapBox").append("svg")
        .attr("width", width)
        .attr("height", height);

      svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

      var g = svg.append("g");

      svg
        .call(zoom)
        .call(zoom.event);

      d3.json("maps/states.json", function(error, us) {

        // FORMAT WIND/WAVE DATA
        console.log("dwml=", allData);
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

        // WAVE CIRCLES
        var waveColor = d3.scale.linear()
          .domain([0, 10])
          .range(["yellow", "red"]);
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
          .attr('r', 45)
          .attr("transform", function(d) {
            return "translate(" + projection([d.lon, d.lat]) + ")";
          })
          .attr('fill', function(d) {
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
        var windColor = d3.scale.linear()
          .domain([0, 25])
          .range(["blue", "red"]);
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
      }

      function zoomed() {
        g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        g.select(".land").style("stroke-width", 0.5 / d3.event.scale + "px");
      }

      d3.select(self.frameElement).style("height", height + "px");

      // FORECAST SLIDER TICK FORMATTER
      function tickFormatter(d) {
        if (d === 0) {
          return "Now"
        } else {
          return "+" + d + " Hours";
        }
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

    }

})();
