var colorVar, xVar, yVar, colDom, xDom, yDom;

var width = 800,
    height = 700;

var projection = d3.geo.mercator()
    .scale(120)
    .translate([width / 2, height / 2 + 100])
    .clipExtent([[0, 100], [800, 600]]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
var g = svg.append("g")
    .attr("id", "mapSVG");

var colorVarType = "HIVstage3Rates_",
    colorVarYear = "08",
    colorVariable = colorVarType + colorVarYear;

var countryhash = new Object();
var warhash = new Object();
var codehash = [];

var neutr = 8,
    green = 16,
    domVal = [0, neutr, green];
var colorFn = d3.scale.linear().domain(domVal).range(["#C14448","grey","#89D071"]);
var yi = "08", 
    yf = "09";

var newRad = 20000;

var dataOptions;

var rounded;

var tmpSt, tmpEnd, dateRange;
var dateFormat = d3.time.format("%x").parse;
function types(d) {
  d.StDateP = dateFormat(String(d.StDate));
  d.EndDateP = dateFormat(String(d.EndDate));
  return d;
}

function recolor(){
  d3.select("#warBox")
    .html('');
  g.selectAll(".circ")
    .classed("hidden", function(d) {
      if (d.StDateP.getTime() > rounded[0].getTime() && 
        d.StDateP.getTime() < rounded[1].getTime()){
        d3.select("#warBox")
          .append('div')
          .attr("class","waritem")
          .html(d.txt);
        return false;
      } else {
        return true;
      }
    });
}




// Create the map
function drawMap(){
  // Load data
  d3.json("../data/maps/final/world.json",function(error,geodata) {
    d3.csv("../data/other/CC.csv",function(error2,cCode) {
      d3.csv("../data/maps/final/MID.csv", types, function(error3, mid) {
      if (error) return console.log(error);
      if (error2) return console.log(error2);
      if (error3) return console.log(error3);

      function buildCodes(){
        codehash['Outcome'] = new Object();
        codehash['Settle'] = new Object();
        codehash['Fatality'] = new Object();
        codehash['Hostility'] = new Object();

        codehash['Outcome'][1] = "Victory by A";
        codehash['Outcome'][2] = "Victory by B";
        codehash['Outcome'][3] = "Yield by A";
        codehash['Outcome'][4] = "Yield by B";
        codehash['Outcome'][5] = "Stalemate";
        codehash['Outcome'][6] = "Compromise";
        codehash['Outcome'][7] = "Released";
        codehash['Outcome'][8] = "Unclear";
        codehash['Outcome'][9] = "Joins ongoing war";
        codehash['Outcome'][-9] = "N/A";

        codehash['Settle'][1] = "Negotiated";
        codehash['Settle'][2] = "Imposed";
        codehash['Settle'][3] = "None";
        codehash['Settle'][4] = "Unclear";
        codehash['Settle'][-1] = "N/A";

        codehash['Fatality'][0] = "0";
        codehash['Fatality'][1] = "1-25";
        codehash['Fatality'][2] = "26-100";
        codehash['Fatality'][3] = "101-250";
        codehash['Fatality'][4] = "251-500";
        codehash['Fatality'][5] = "501-999";
        codehash['Fatality'][6] = ">999";
        codehash['Fatality'][-9] = "N/A";

        codehash['Hostility'][0] = "None";
        codehash['Hostility'][1] = "Threat: force";
        codehash['Hostility'][2] = "Threat: blockade";
        codehash['Hostility'][3] = "Threat: occupation";
        codehash['Hostility'][4] = "Threat: declare war";
        codehash['Hostility'][5] = "Threat: CBR weapons";
        codehash['Hostility'][6] = "Threat: join war";
        codehash['Hostility'][7] = "Show of force";
        codehash['Hostility'][8] = "Alert";
        codehash['Hostility'][9] = "Nuclear alert";
        codehash['Hostility'][10] = "Mobilization";
        codehash['Hostility'][11] = "Fortify border";
        codehash['Hostility'][12] = "Border violation";
        codehash['Hostility'][13] = "Blockade";
        codehash['Hostility'][14] = "Occupation";
        codehash['Hostility'][15] = "Seizure";
        codehash['Hostility'][16] = "Attack";
        codehash['Hostility'][17] = "Clash";
        codehash['Hostility'][18] = "Declare war";
        codehash['Hostility'][19] = "CBR weapons";
        codehash['Hostility'][20] = "Start interstate war";
        codehash['Hostility'][21] = "Join interstate war";
        codehash['Hostility'][-9] = "N/A";
      }
      buildCodes();

      // Set up hash
      cCode.forEach(function(d, i) {
          countryhash[d.CId] = d;
      });

      mid.forEach(function(d, i){
          var tmpTxt = '<div class="warT"><b>ID</b></div><div class="warV">'+
            d.DispNum3+'</div><br>'
          tmpTxt += '<div class="warT"><b>Outcome</b></div><div class="warV">'+
            codehash['Outcome'][d.Outcome]+'</div><br>'
          tmpTxt += '<div class="warT"><b>Settlement</b></div><div class="warV">'+
            codehash['Settle'][d.Settle]+'</div><br>'
          tmpTxt += '<div class="warT"><b>Hostility</b></div><div class="warV">'+
            codehash['Hostility'][d.HiAct]+'</div><br>'
          tmpTxt += '<div class="warT"><b>Fatality</b></div><div class="warV">'+
            codehash['Fatality'][d.Fatality]+'</div><br>'
          d['txt'] = tmpTxt;
          warhash[d.DispNum3] = d;
      });
      

      // d3.select("#warBox")
      //    .selectAll("div")
      //    .data(mid)
      //    .enter()
      //    .append("div")
      //        .attr("class","waritem")
      //        .attr("id",function (d){ 
      //         return "w"+d.DispNum3;
      //       })
      //        .text(function (d) {
      //         var tmpTxt = '';
      //         tmpTxt += 'ID <br><b><span>'+d.DispNum3+'</span></b>'
      //         tmpTxt += 'Outcome <br><b><span>'+d.Outcome+'</span></b>'
      //         tmpTxt += 'Settlement <br><b><span>'+d.Settle+'</span></b>'
      //         tmpTxt += 'Hostility <br><b><span>'+d.HiAct+'</span></b>'
      //         tmpTxt += 'Fatality <br><b><span>'+d.Fatality+'</span></b>'
      //         return tmpTxt;
      //       });


      // Draw map
      g.selectAll("path")
        .data(topojson.feature(geodata,geodata.objects.countries).features) 
        .enter()
        .append("path")
        .attr("class", "countries")
        .attr("d",path)
        .attr("class", function(d) {
          return d.id;
        })
        .style("fill", "#222")
        .on("mouseover", function(d) {
          d3.select(this)
            .style("fill", "#aaa");
          d3.select("#countryId")
            .select("#cId")
            .text(d.id);
          d3.select("#countryId")
            .select("#cName")
            .text(countryhash[d.id]["CName"]);
        })
        .on("mouseout", function() {
          d3.select(this)
            .style("fill", "#222")
        });

      // Add dots for incidents
      g.selectAll(".circ")
        .data(mid)
        .enter()
        .append("circle")
        .style("fill", "red")
        .attr("class", "circ")
        .attr('d', path)
        .attr("cx", function(d) {
          return projection([d.longitude, d.latitude])[0];
        })
        .attr("cy", function(d) {
          return projection([d.longitude, d.latitude])[1];
        })
        .attr("r", 0.5);

     

    //   // Add dots for incidents
    //   g.selectAll(".circ")
    //     .data(hiv)
    //     .enter()
    //     .append("circle")
    //     .style("fill", "rgba(255, 255, 255, 0.5)")
    //     .attr("class", "circ")
    //     .attr("r", function(d) {
    //       return hash[d.id]["PopulationAccessPerCenter"] / Number(25000 - newRad);
    //     })
    //     .attr("transform", function(d) {
    //       var proj = projection([hash[d.id]["Longitude"], hash[d.id]["Latitude"]]);
    //       return "translate(" + proj + ")";
    //     })
    //     .on("mouseover", function(d) {
    //       d3.select(this)
    //         .style("stroke", "white")
    //         .style("stroke-width", 3);
    //       d3.select("#stateId")
    //         .select("#sName")
    //         .text(hash[d.id]["Geography"]);
    //       d3.select("#stateId")
    //         .select("#sTC")
    //         .text(hash[d.id]["TestingCenters"]);
    //       d3.select("#stateId")
    //         .select("#sPA")
    //         .text(hash[d.id]["PopulationAccessPerCenter"]);
    //     })
    //     .on("mouseout", function(e) {
    //       d3.select(this)
    //       .style("stroke-width", 0)
    //     });

      // Show axis

      var navWidth = width * 3/4,
        navHeight = 20;

      dateRange = d3.extent(mid.map(function(d) { return d.StDateP }));

      var navX = d3.time.scale()
        .domain(dateRange)
        .range([0, navWidth-1]);

      var xAxis = d3.svg.axis()
        .scale(navX)
        .orient("bottom")
        .ticks(7);

      // Brush fn
      function brushfn() {
        if (!d3.event.sourceEvent) return;

        var selected = brush.extent();
        rounded = selected.map(d3.time.year.round);

        if (!(rounded[0] < rounded[1])) {
          rounded[0] = d3.time.year.floor(selected[0]);
          rounded[1] = d3.time.year.ceil(selected[1]);
        }

        d3.select(this).transition()
            .call(brush.extent(rounded))
            .call(brush.event);

        var yearString = d3.time.format("%y");
        yi = yearString(rounded[0]);
        yf = yearString(rounded[1]);

        recolor();
      }   
      

      // Bottom nav
      var brush = d3.svg.brush()
        .x(navX)
        .extent([new Date(1900, 11, 31), dateRange[1]])
        .on("brushend", brushfn);

      // Grid bg
      svg.append("rect")
        .attr("class", "brushBG")
        .attr("width", navWidth)
        .attr("height", navHeight)
        .attr("x", 160)
        .attr("y", (height));

      svg.append("g")
        .attr("class", "brushGrid")
        .attr("transform", "translate(160," + (height - 50) + ")")
        .call(d3.svg.axis()
            .scale(navX)
            .orient("bottom")
            .ticks(d3.time.month, 1)
            .tickSize(-navHeight)
            .tickFormat(""))
        .selectAll(".tick")
      .classed("minor", function(d) { 
        return d.getMonth(); 
      });    

    // Set up brush
     var gBrush = svg.append("g")
        .attr('class', 'brush')
        .attr("transform", "translate(160," + (height - 70) + ")")
        .call(brush);

      gBrush.selectAll('rect')
        .attr('height', navHeight);

      d3.select('svg')
        .append('g')
        .attr('id', 'xAxis')
        .attr("transform", "translate(160," + (height - 50) + ")")
        .call(xAxis);
            
      });
    });
  });
}
drawMap();

$( document ).ready(function() {
  // $('#valChanges').submit(function (e){
  //   neutr = $('.Nneutr').val();
  //   green = $('.Ngreen').val();
  //   domVal = [0, Number(neutr), Number(green)];
  //   colorFn = d3.scale.linear().domain(domVal).range(["#C14448","grey","#89D071"]);
  //   recolor();

  //   newRad = $('.Nrad').val();

  //   g.selectAll(".circ")
  //     .attr("r", function(d) {
  //       return hash[d.id]["PopulationAccessPerCenter"] / Number(25000 - newRad);
  //     })

  //   e.preventDefault();
  //   return false;
  // });
});





