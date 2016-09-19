(function() {
  'use strict';

  angular
    .module('windApp')
    .controller('MainController', MainController);

		MainController.$inject = ['$scope', 'dataFactory'];

    function MainController($scope, dataFactory) {
      $scope.city = "Waves, NC";
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
        .call(zoom)
        .on("click", clicked);

      var g = svg.append("g");

      svg
        .call(zoom)
        .call(zoom.event);

      // WAVE DATA
      // console.log(waveData);
      // var waveHeight = waveData[3].data;
      // var headers = waveData[3].header;
      // var la1 = headers.la1;
      // var lo1 = headers.lo1;
      // var dx = headers.dx;
      // var dy = headers.dy;
      // var nx = headers.nx;
      //
      // var mydata = waveHeight.map(function(d, i) {
      //   var pos = projection([
      //     lo1 + (i * dx),
      //     la1 + (i * dy)
      //   ]);
      //   return {
      //     t: d,
      //     x: pos[0],
      //     y: pos[1]
      //   };
      // })
      //
      // var mydata = waveHeight.map(function(d, i) {
      //   var pos = projection([
      //     lo1 + dx * (i % nx),
      //     la1 + dy * parseInt(i / nx)
      //   ]);
      //   return {
      //     t: d,
      //     x: pos[0],
      //     y: pos[1]
      //   };
      // })
      // mydata.forEach(function(d) {
      //   g.append("path")
      //       .datum({type: "Point", coordinates: [d.x, d.y]})
      //       .attr("d", path.pointRadius(d.t));
      // });

      // var color = d3.scale.linear()
      //   .domain(d3.extent(waveHeight))
      //   .range(["yellow", "red"]);
      // var waveCircles = g.append('g').attr('class', 'temperatures');
      // waveCircles.selectAll('circle')
      //   .data(mydata.filter(function(d) {
      //     if (isNaN(d.t)) {
      //       return false;
      //     } else {
      //       return true;
      //     };
      //   }))
      //   .enter()
      //   .append('circle')
      //   .on("click", clicked)
      //   .attr('r', 45)
      //   // .attr({
      //   //   x: function(d) { return d.x;},
      //   //   y: function(d) { return d.y;},
      //   //   width: 1.5*nx,
      //   //   height: 1.5*nx
      //   // })
      //   .attr('cx', function(d) {
      //     return d.x;
      //   })
      //   .attr('cy', function(d) {
      //     return d.y;
      //   })
      //   .style('fill', function(d) {
      //     return color(d.t)
      //   });

      // STATES
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
          .on("click", clicked)
          .attr('r', 45)
          .attr("transform", function(d) {
            return "translate(" + projection([d.lon, d.lat]) + ")";
          })
          .attr('fill', function(d) {
            return waveColor(parseInt(d.wave[$scope.timeIndex]))
          });

          // ADD STATES
        if (error) throw error;
        g.selectAll("path")
          .data(us.features)
          .enter()
          .append("path")
          .attr("class", "land")
          .style("stroke-width", "0.5px")
          .attr("d", path)
          .on("click", clicked);
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

        // .style("text-anchor", function(d) {
        // 	return d.lon > -1 ? "start" : "end";
        // });

        // g.append("path")
        // 	.datum(topojson.feature(windData, windData.dwml.data))
        // 	.attr("d", path)
        // 	.attr("class", "place");




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
          .on("click", clicked)
          .attr("transform", function(d) {
            return "translate(" + projection([
              d.lon,
              d.lat
            ]) + ") rotate(" + (d.dir[$scope.timeIndex]) + ")";
          })
          .call(lineAnimate);

        // weatherArray.forEach(function(d) {
        //   g.append("path")
        //       .datum({type: "Point", coordinates: [d.lat, d.lon]})
        //       .attr("d", path.pointRadius(d.spd[0]));
        // });

        // var myWidnData = wind.map(function(d, i) {
        //   var pos = projection([
        //     lo1 + dx * (i % nx),
        //     la1 + dy * parseInt(i / nx)
        //   ]);
        //   return {
        //     t: d,
        //     x: pos[0],
        //     y: pos[1]
        //   };
        // })
        // var color = d3.scale.linear()
        //   .domain(d3.extent(wind))
        //   .range(["blue", "red"]);
        // var tempCircles = g.append('g').attr('class', 'temperatures');
        // tempCircles.selectAll('circle')
        //   .data(myWidnData.filter(function(d) {
        //     if (isNaN(d.t)) {
        //       return false;
        //     } else {
        //       return true;
        //     };
        //   }))
        //   .enter()
        //   .append('circle')
        //   .on("click", clicked)
        //   .attr('r', 30)
        //   // .attr("width", 10)
        //   // .attr("height", 10)
        //   .attr('cx', function(d) {
        //     return d.x;
        //   })
        //   .attr('cy', function(d) {
        //     return d.y;
        //   })
        //   .style('fill', function(d) {
        //     return color(d.t)
        //   });






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









        ///// USE this
        // var windSpeed = waveData[4].data;
        // var headers = waveData[4].header;
        // var la1 = headers.la1;
        // var lo1 = headers.lo1;
        // var dx = headers.dx;
        // var dy = headers.dy;
        // var nx = headers.nx;
        //
        // var myWindData = windSpeed.map(function(d, i) {
        //   var pos = projection([
        //     lo1 + dx * (i % nx),
        //     la1 + dy * parseInt(i / nx)
        //   ]);
        //   return {
        //     t: d,
        //     x: pos[0],
        //     y: pos[1]
        //   };
        // })
        // var color = d3.scale.linear()
        //   .domain(d3.extent(windSpeed))
        //   .range(["white", "black"]);
        // var tempCircles = g.append('g').attr('class', 'temperatures');
        // tempCircles.selectAll('line')
        //   .data(myWindData.filter(function(d) {
        //     if (isNaN(d.t)) {
        //       return false;
        //     } else {
        //       return true;
        //     };
        //   }))
        //   .enter()
        //   .append("line")
        //   .attr({
        //     x1: function(d) {return d.x},
        //     y1: function(d) {return d.y},
        //     x2: function(d) {return (d.x+(5*d.t))},
        //     y2: function(d) {return (d.y+(5*d.t))},
        //   })
        //   .attr("stroke-width", 2)
        //   .attr("stroke", function(d) {
        //     return color(d.t)
        //   })
        //   .on("click", clicked)
        //
        // .attr('r', 30)



        // .attr("width", 10)
        // .attr("height", 10)
        // .attr('cx', function(d) {
        //   return d.x;
        // })
        // .attr('cy', function(d) {
        //   return d.y;
        // })
        // .style('fill', function(d) {
        //   return color(d.t)
        // })
        // .call(lineAnimate);









        // var lines = []
        // 	//// MATH FUNCTIONS
        // 	function toRad(deg) {return deg * Math.PI / 180;}
        // 	function toDeg(rad) {return rad * 180 / Math.PI;}
        //
        // 	function lonLatFromLonLatDistanceAndBearing(lonLat, d, brng) {
        // 	  // Formulae from http://www.movable-type.co.uk/scripts/latlong.html
        // 	  // brg in radians, d in km
        // 	  var R = 6371; // Earth's radius in km
        // 	  var lon1 = toRad(lonLat[0]), lat1 = toRad(lonLat[1]);
        // 	  var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) + Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );
        // 	  var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1), Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));
        // 	  return [toDeg(lon2), toDeg(lat2)];
        // 	}
        //
        // 	//// INITIALISATION
        // 	var cardinalToBearing = {};
        //
        // 	function init() {
        // 	  var i, cardinalPoints = ['S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE'];
        // 	  // Calculate cardinal point to bearing mapping (wind direction is where the wind is coming *from*!)
        // 	  for(i = 0; i < cardinalPoints.length; i++)
        // 	    cardinalToBearing[cardinalPoints[i]] = i * Math.PI / 8;
        // 	  // Prepare line co-ordinates
        // 	  var windData = weather.SiteRep.DV.Location;
        // 	  for(i = 0; i < windData.length; i++) {
        // 	    var d = windData[i];
        // 	    var speed = d.Period.Rep.S;
        // 	    var feelsLikeTemperature = d.Period.Rep.F;
        // 	    var lonLat0 = [d.lon, d.lat];
        //
        // 	    // Scale line length proportionally to speed
        // 	    var lonLat1 = lonLatFromLonLatDistanceAndBearing(lonLat0, 1.2 * speed, cardinalToBearing[d.Period.Rep.D]);
        //
        // 	    var x0y0 = projection(lonLat0);
        // 	    var x1y1 = projection(lonLat1);
        // 	    var line = {
        // 	      x0: x0y0[0],
        // 	      y0: x0y0[1],
        // 	      x1: x1y1[0],
        // 	      y1: x1y1[1],
        // 	      s: speed,
        // 	      // f: feelsLikeTemperature,
        // 	      duration: 8000 / speed, /* pre-compute duration */
        // 	      delay: Math.random() * 1000 /* pre-compute delay */
        // 	    };
        // 	    // console.log(line);
        // 	    lines.push(line);
        // 	  }
        // 	}
        //
        // 	g.selectAll("line")
        // 	  .data(lines)
        // 	  .enter()
        // 	  .append("line")
        // 	  .attr({
        // 	    x1: function(d) {return d.x0},
        // 	    y1: function(d) {return d.y0}
        // 	  })
        // 	  .call(lineAnimate);









      });

      function clicked(d) {

        console.log(d);
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
