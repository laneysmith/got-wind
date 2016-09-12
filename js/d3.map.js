// console.log(windData.dwml.data);
var width = window.innerWidth,
  height = window.innerHeight;

var projection = d3.geo.albers()
  .center([20, 35])
  .scale(10000)
  // .parallels([30, 40])
  // .scale(10000)
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






	console.log(waveData);
  var temperatures = waveData[4].data;
  var headers = waveData[4].header;
  var la1 = headers.la1;
  var lo1 = headers.lo1;
  var dx = headers.dx;
  var dy = headers.dy;
  var nx = headers.nx;

  var mydata = temperatures.map(function(d, i) {
    var pos = projection([
      lo1 + dx * (i % nx),
      la1 + dy * parseInt(i / nx)
    ]);
    return {
      t: d,
      x: pos[0],
      y: pos[1]
    };
  })
  var color = d3.scale.linear()
    .domain(d3.extent(temperatures))
    .range(["blue", "red"]);
  var tempCircles = g.append('g').attr('class', 'temperatures');
  tempCircles.selectAll('circle')
    .data(mydata.filter(function(d) {
      if (isNaN(d.t)) {
        return false;
      } else {
        return true;
      };
    }))
    .enter()
    .append('circle')
    .on("click", clicked)
    .attr('r', 15)
    .attr('cx', function(d) {
      return d.x;
    })
    .attr('cy', function(d) {
      return d.y;
    })
    .style('fill', function(d) {
      return color(d.t)
    });









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
    // .style("text-anchor", function(d) {
    // 	return d.lon > -1 ? "start" : "end";
    // });

  // g.append("path")
  // 	.datum(topojson.feature(windData, windData.dwml.data))
  // 	.attr("d", path)
  // 	.attr("class", "place");










  // var temperatures = uswind.field;
  // var headers = uswind.timestamp;
  // var la1 = uswind.y0;
  // var lo1 = -84;
  // var dx = 1;
  // var dy = 1;
  // var nx = 11;
  //
  // var mydata =  temperatures.map(function(d, i){
  //   var pos = projection([
  //     lo1 + dx * (i % nx),
  //     la1 + dy * parseInt(i / nx)
  //   ]);
  //   return {t: d, x: pos[0], y: pos[1]};
  // })
  //
  // var color = d3.scale.linear()
  //   .domain(d3.extent(temperatures))
  //     .range(["blue", "red"]);
  // var tempCircles = svg.append('g').attr('class', 'temperatures');
  // tempCircles.selectAll('circle')
  //   .data(mydata)
  //   .enter()
  //     .append('circle')
  //     .attr('r', 2)
  //     .attr('cx', function(d) {return d.x; })
  //     .attr('cy', function(d) {return d.y; })
  //     .style('fill', function(d) {return color(d.t)});









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

// Initialize slider
var slider = d3.slider().min(0).max(20).tickValues([0, 5, 10, 15, 20]).stepValues([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]).tickFormat(tickFormatter);
// Render the slider in the div
d3.select('#slider').call(slider);
