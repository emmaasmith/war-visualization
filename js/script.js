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
var navg = svg.append('g')
    .attr('id', 'timeline');

var colorVarType = "HIVstage3Rates_",
    colorVarYear = "08",
    colorVariable = colorVarType + colorVarYear;

var countryhashMap = new Object();
var countryhashCOW = new Object();
var warhash = new Object();
var codehash = [];

var neutr = 8,
    green = 16,
    domVal = [0, neutr, green];
var colorFn = d3.scale.linear().domain(domVal).range(["#C14448","grey","#89D071"]);
var yi = "08", 
    yf = "09";

var newRad = 20000;
var currCol = '', clicked = 0;
var countryFilter = 0;

var dataOptions;
var navX, navY;

var rounded;
var navHeight, navWidth;

var tmpSt, tmpEnd, dateRange;
var dateFormat = d3.time.format("%x").parse;
function types(d) {
  d.StDateP = dateFormat(zeropad(d.StartMonth1)+'/'+
    zeropad(d.StartDay1)+'/'+d.StartYear1);
  if(d.EndYear1 != -9 && d.EndYear1 != -8){
    d.EndDateP = dateFormat(zeropad(d.EndMonth1)+'/'+
      zeropad(d.EndDay1)+'/'+d.EndYear1);
  } else {
    d.EndDateP = dateFormat(zeropad(d.EndMonth2)+'/'+
      zeropad(d.EndDay2)+'/'+d.EndYear2);
  }
  return d;
}

function zeropad(x){
  var val = String(x);
  var zeros = '00'
  return zeros.substring(0, (zeros.length - val.length)) + val;
}

function addBoxes(){
  var tmpHTML = '', itemHTML = '', allHTML = '',
      hasCtry = 0;

  for (d in warhash) {
    hasCtry = 0;

    tmpHTML = '<div id="' + warhash[d]['name'] +
      '" class="ui styled accordion"><div class="title"><i class="dropdown icon"></i>'+
      warhash[d]['min'].getFullYear() + '-' + warhash[d]['max'].getFullYear() + 
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 
      warhash[d]['name'] + '</div><div class="content">';

    if (warhash[d]['min'] > rounded[0].getTime() && 
      warhash[d]['max'] < rounded[1].getTime()){

      for(e in warhash[d]){
        if(warhash[d][e]['txt'] != undefined){
          if(countryFilter==0 || (countryFilter!=0 && warhash[d][e]['ccode'] == countryFilter)){
            hasCtry = 1;
          }
          tmpHTML += warhash[d][e]['txt'];
        }


        navg.append('g')
          .selectAll(".tlcirc")

      };

      tmpHTML += '</div></div>';
      itemHTML += tmpHTML;
      tmpHTML = '';
    }
    if(hasCtry == 1){
      allHTML += itemHTML;
    }
    
    itemHTML = '';
  };

  d3.select("#warBox")
    .html(allHTML);
  $('.ui.accordion').accordion('refresh');

  navg
    .selectAll(".tlcirc")
    .style("fill", function(d){
      if(d['StDateP'] != undefined && 
        d['StDateP'].getTime() > rounded[0] && d['StDateP'].getTime() < rounded[1]){
        return "#222";
      } else {
        return "#bbb";
      }
    })
}

function recolor(warData){
  g.selectAll("path")
    .style("fill", function(d) {
      if(countryhashMap[d.id] != undefined){
        var cName = countryhashMap[d.id]['cowCode'];
        for (i in warData){
          if(warData[i]['ccode'] != undefined){
            if (cName == warData[i]['ccode']){
              if(warData[i]['Outcome']==1){
                return '#3C9EB4';
              } else if (warData[i]['Outcome']==2){
                return '#AC394B';
              } else {
                return '#F2EFD9';
              }
            }
          }
        }
      }
      return '#222';
    })
}

function allblack(){
  g.selectAll("path")
    .style("stroke-width", '0px');
}

function changeCheck(e){
  var isChecked = e.checked;
  if(isChecked){
    g.selectAll(".circ")
      .style("visibility", "visible");
  } else {
    g.selectAll(".circ")
      .style("visibility", "hidden");
  } 
}


// Create the map
function drawMap(){
  // Load data
  d3.json("../data/maps/final/world.json",function(error,geodata) {
  d3.csv("../data/other/CCFin.csv",function(error2,cCode) {
  d3.csv("../data/maps/final/MID.csv", types, function(error3, mid) {
  d3.csv("../data/COW/Inter-StateWarData_v4.0.csv", types, function(error4, cow) {
      if (error) return console.log(error);
      if (error2) return console.log(error2);
      if (error3) return console.log(error3);
      if (error4) return console.log(error4);

      // Hard-code discrete variables
      function buildCodes(){
        codehash['Region'] = new Object();
        codehash['Outcome'] = new Object();

        codehash['Region'][1] = "W. Hemisphere";
        codehash['Region'][2] = "Europe";
        codehash['Region'][4] = "Africa";
        codehash['Region'][6] = "Middle East";
        codehash['Region'][7] = "Asia";
        codehash['Region'][9] = "Oceania";
        codehash['Region'][11] = "Europe & Middle East";
        codehash['Region'][12] = "Europe & Asia";
        codehash['Region'][13] = "W. Hemisphere & Asia";
        codehash['Region'][14] = "Europe, Africa & Middle East";
        codehash['Region'][15] = "Europe, Africa, Middle East & Asia";
        codehash['Region'][16] = "Africa, Middle East, Asia & Oceania";
        codehash['Region'][17] = "Asia & Oceania";
        codehash['Region'][18] = "Africa & Middle East";
        codehash['Region'][19] = "Europe, Africa, Middle East, Asia & Oceania";
        
        codehash['Outcome'][1] = "Victor";
        codehash['Outcome'][2] = "Loser";
        codehash['Outcome'][3] = "Compromise/Tied";
        codehash['Outcome'][4] = "Transformed to new war";
        codehash['Outcome'][5] = "Ongoing";
        codehash['Outcome'][6] = "Stalemate";
        codehash['Outcome'][7] = "Continuing low-level conflict";
        codehash['Outcome'][8] = "Changed sides";
      }
      buildCodes();

      // Set up hashes
      cCode.forEach(function(d, i) {
          countryhashCOW[d.cowCode] = d;
          countryhashMap[d.CId] = d;
      });

      cow.forEach(function(d, i){
        // Add this specific country
        var tmpTxt = '<div class="waritem" id="'+d.WarNum+'"><div class="warT ';
        var tmpOut = d.Outcome;
        if(tmpOut == 1){
          tmpTxt += 'stWin';
        } else if (tmpOut == 2){
          tmpTxt += 'stLose';
        }
        tmpTxt += '"><b>'+ d.StateName+'</b></div>';
        if(1 == d.Initiator){
          tmpTxt += '<div class="warV">Initiator,&nbsp;&nbsp;';
        } else {
          tmpTxt += '<div class="warV">';
        }
        tmpTxt += codehash['Outcome'][tmpOut]+'</div><br>';
        tmpTxt += '<div class="warT">Fatalities:</div><div class="warV">'+
          d.BatDeath+'</div><br></div>';

        d['txt'] = tmpTxt;

        // If first time encountering a war
        if(warhash[d.WarNum] == undefined){
          warhash[d.WarNum] = new Object();
          warhash[d.WarNum]['min'] = d.StDateP;
          warhash[d.WarNum]['max'] = d.EndDateP;
          warhash[d.WarNum]['name'] = d.WarName;
        } else {
          if (warhash[d.WarNum]['min'] > d.StDateP){
            warhash[d.WarNum]['min'] = d.StDateP;
          }
          if (warhash[d.WarNum]['max'] > d.EndDateP){
            warhash[d.WarNum]['max'] = d.EndDateP;
          }
        }
        warhash[d.WarNum][d.StateName] = d;
      });
      

      // Draw map
      g.selectAll("path")
        .data(topojson.feature(geodata,geodata.objects.countries).features) 
        .enter()
        .append("path")
        .attr("transform", "translate(0," + -60 + ")")
        .attr("class", "countries")
        .attr("d",path)
        .attr("id", function(d) {
          return d.id;
        })
        .style("fill", "#222")
        .on("mouseover", function(d) {
          d3.select(this)
            .style("fill", function(){
              currCol = $(this).attr('style');
              currCol = currCol.substring(6, 13);
              return "#aaa";
            });
          d3.select("#countryId")
            .select("#cName")
            .text(function(){
              var tmp = countryhashMap[d.id];
              if(tmp != undefined){
                return tmp['StateName'];
              }
              return '';
            });
        })
        .on("mouseout", function(d) {
          d3.select(this)
            .style("fill", function(){
              return currCol;
            })
        })
        .on("click", function(d) {
          if(clicked == 0 || clicked != d.id){
            clicked = d.id;
            allblack();
            d3.select(this)
              .style({
                stroke: '#fff',
                'stroke-width': '5px'
              });
          } else {
            clicked = 0;
            d3.select(this)
            .style('stroke-width', '0px');
          }
          var tmp = countryhashMap[d.id];
          if(tmp != undefined){
            countryFilter = tmp['cowCode'];
            addBoxes();
          } else {
            countryFilter = 0;
          }
          return;
        });

      // Add dots for inCCodeents
      // g.selectAll(".circ")
      //   .data(mid)
      //   .enter()
      //   .append("circle")
      //   .style("fill", "red")
      //   .attr("class", "circ")
      //   .attr('d', path)
      //   .attr("cx", function(d) {
      //     return projection([d.longitude, d.latitude])[0];
      //   })
      //   .attr("cy", function(d) {
      //     return projection([d.longitude, d.latitude])[1];
      //   })
      //   .attr("r", 0.5);

     

      // Show axis
      function buildBrush(){
        navWidth = width * 3/4;
        navHeight = 80;

        dateRange = cow.map(function(d) { return d.StDateP });
        dateRange = dateRange.concat(cow.map(function(d) { return d.EndDateP }));
        dateRange = d3.extent(dateRange);

        navX = d3.time.scale()
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

          addBoxes();
        }   
        

        // Bottom nav
        rounded = [new Date(1900, 11, 31), new Date(1950, 11, 31)];
        var brush = d3.svg.brush()
          .x(navX)
          .extent(rounded)
          .on("brushend", brushfn);

        navg.append("g")
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
       var gBrush = navg.append("g")
          .attr('class', 'brush')
          .attr("transform", "translate(160," + (height - navHeight - 50) + ")")
          .call(brush);

        gBrush.selectAll('rect')
          .attr('height', navHeight);

        d3.select('svg')
          .append('g')
          .attr('id', 'xAxis')
          .attr("transform", "translate(160," + (height - 50) + ")")
          .call(xAxis);
      }
      buildBrush();

      // Add dots
      var domY = d3.extent(cow.map(function(d) {
        return Number(d.BatDeath);
      }));
      domY[0] = 1;
      domY[1] = Number(domY[1]);

      navY = d3.scale.log().base(Math.E)
        .domain(domY)
        .range([navHeight-1, 0]);

      var tickctr=0;
      var yAxis = d3.svg.axis()
        .scale(navY)
        .orient("left")
        .ticks(0)
        .tickFormat(function (d) {
          tickctr++;
          if(tickctr%3==1){
            return d.toFixed(0);
          } else {
            return ''
          }
        });

      d3.select('svg')
        .append('g')
        .attr('id', 'yAxis')
        .attr("transform", "translate(160," + (height - navHeight- 50) + ")")
        .call(yAxis);

      navg.append('g')
        .attr("id", "scatterlabel")
        .attr("transform", "translate(120," + (height- 60) + ")")
        .append('text')
        .attr("class", "label2")
        .style("text-anchor", "center")
        .attr("transform", "rotate(-90)")
        .text("Fatalities by country");
      navg.select('#scatterlabel')
        .append('text')
        .attr("class", "label1")
        .style("text-anchor", "center")
        .attr("transform", "rotate(-90)")
        .attr("dx", "2em")
        .attr("dy", "1em")
        .text("log scale");

      navg.append('g')
        .selectAll(".tlcirc")
        .data(cow)
        .enter()
        .append("circle")
        .attr("transform", "translate(160," + (height - navHeight- 50) + ")")
        .attr("class", "tlcirc")
        .attr('d', path)
        .attr("cx", function(d) {
          return navX(d.StDateP.getTime());
        })
        .attr("cy", function(d) {
          if(Number(d['BatDeath']) > 0){
            return navY(Number(d['BatDeath']));
          } else {
            return 0;
          }
        })
        .attr("r", 0.5);

      addBoxes();
  });          
  });
  });
  });
}
drawMap();

function accordChange(){
  var warNum = $(this).find(">:first-child").attr('id');
  var warData = warhash[warNum];
  recolor(warData);
}

function accordClose(){
  g.selectAll("path")
    .style("fill", "#222");
}

$( document ).ready(function() {
  $('.ui.accordion').accordion();

  function warheight(){
    $('#warBox').css('height', window.innerHeight);
  }
  warheight();

  window.onresize = warheight;
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





