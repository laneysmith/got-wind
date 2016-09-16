// console.log(windData.dwml.data);
var width = window.innerWidth,
  height = window.innerHeight;

var projection = d3.geo.albers()
  .center([20, 35])
  .scale(10000)
  .translate([width / 2, height / 2])
  // .rotate([0, 0]);

var path = d3.geo.path()
  .projection(projection);

var zoom = d3.behavior.zoom()
  .translate([0, 0])
  .scale(1)
  .scaleExtent([-8, 8])
  .on("zoom", zoomed);

var svg = d3.select("body").append("svg")
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









// console.log(waveData);
var waveHeight = waveData[3].data;
var headers = waveData[3].header;
var la1 = headers.la1;
var lo1 = headers.lo1;
var dx = headers.dx;
var dy = headers.dy;
var nx = headers.nx;

var mydata = waveHeight.map(function(d, i) {
  var pos = projection([
    lo1 + (i * dx),
    la1 + (i * dy)
  ]);
  return {
    t: d,
    x: pos[0],
    y: pos[1]
  };
})

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

// console.log("mydata=", mydata);
// var color = d3.scale.linear()
//   .domain(d3.extent(waveHeight))
//   .range(["blue", "red"]);
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
//   .append('rect')
//   .on("click", clicked)
//   // .attr('r', 30)
//   .attr({
//     x: function(d) { return d.x;},
//     y: function(d) { return d.y;},
//     width: nx,
//     height: nx
//   })
//   // .attr('cx', function(d) {
//   //   return d.x;
//   // })
//   // .attr('cy', function(d) {
//   //   return d.y;
//   // })
//   .style('fill', function(d) {
//     return color(d.t)
//   });








d3.json("maps/states.json", function(error, us) {
  if (error) throw error;
  // add states to map
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

  console.log(dwmlThingy);
  var wind = dwmlThingy.data;
  var len = wind.location.length;
  var windInfo = dwmlThingy.head;
  var windLocation = wind.location;
  var windParameters = wind.parameters;
  var windArray = [];
  for (let i = 0; i < len; i++) {
    var dataPoint = {
      lat: parseFloat(windLocation[i].point["latitude"]),
      lon: parseFloat(windLocation[i].point["longitude"]),
      dir: windParameters[i].direction.value,
      spd: windParameters[i]["wind-speed"].value
    }
    windArray.push(dataPoint)
  }

  var windColor = d3.scale.linear()
    .domain([0, 25])
    .range(["blue", "red"]);
  g.selectAll(".thing")
    .data(windArray)
    .enter()
    .append("line")
    .attr({
      x1: function(d) {
        return d.lat
      },
      y1: function(d) {
        return d.lon
      },
      x2: function(d) {
        return (d.lat + (parseInt(d.spd[0])))
      },
      y2: function(d) {
        return (d.lon + (parseInt(d.spd[0])))
      },
    })
    .attr("stroke-width", 2)
    .attr("stroke", function(d) {
      return windColor(parseInt(d.spd[0]))
    })
    .on("click", clicked)
    .attr("transform", function(d) {
      return "translate(" + projection([
        d.lon,
        d.lat
      ]) + ")";
    })
    // .attr('transform', 'translate(200,100)rotate(-22)')
    // .rotate(72)
    .text(function(d) {
      return d.spd;
    })
    .call(lineAnimate);


  // var color = d3.scale.linear()
  //   .domain(d3.extent(windArray))
  //   .range(["white", "black"]);
  // var tempCircles = g.append('g').attr('class', 'temperatures');
  // tempCircles.selectAll('line')
  //   .data(windArray.filter(function(d) {
  //     if (isNaN(d.spd)) {
  //       return false;
  //     } else {
  //       return true;
  //     };
  //   }))
  //   .enter()
  //   .append("line")
  //   .attr({
  //     x1: function(d) {return d.lat},
  //     y1: function(d) {return d.lon},
  //     x2: function(d) {return (d.lat+(5*d.spd))},
  //     y2: function(d) {return (d.lon+(5*d.spd))},
  //   })
  //   .attr("stroke-width", 2)
  //   .attr("stroke", "red")
  //   .on("click", clicked)




  //
  // g.selectAll("circle")
  // .data(windArray).enter()
  // .append("circle")
  // .attr("cx", function (d) { console.log(projection(d)); return projection(d.lon)[0]; })
  // .attr("cy", function (d) { return projection(d.lat)[0]; })
  // .attr("r", "8px")
  // .attr("fill", "red")


  // windArray.forEach(function(d) {
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

// tick formatter
var formatter = d3.format(",.2f");
var tickFormatter = function(d) {
  return formatter(d) + " hr";
}


// LINE ANIMATION

function lineAnimate(selection) {
  selection
    .attr({
      x2: function(d) {return d.lat},
      y2: function(d) {return d.lon}
    })
    .style('opacity', 0)
    .transition()
    .ease('linear')
    .duration(1000)
    .delay(function(d) {
      return d.spd[0] * 10;
    })
    .attr({
        x2: function(d) {return (d.lat + (parseInt(d.spd[0])))},
        y2: function(d) {return (d.lon + (parseInt(d.spd[0])))}
        })
      .style('opacity', 0.9)
      .transition()
      .duration(1000)
      .style('opacity', 0.1)
      .each('end', function() {
        d3.select(this).call(lineAnimate)
      });
    }




  // Initialize slider
  var slider = d3.slider().min(0).max(20).tickValues([0, 5, 10, 15, 20]).stepValues([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]).tickFormat(tickFormatter);
  // Render the slider in the div
  d3.select('#slider').call(slider);
