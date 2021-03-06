var colorVar, xVar, yVar, colDom, xDom, yDom;

var width = 800,
    height = 730;

var projection = d3.geo.mercator()
    .scale(120)
    .translate([width / 2, height / 2 + 100])
    .clipExtent([[0, 100], [800, 600]]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select(".svgcontainer")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
var g = svg.append("g")
    .attr("id", "mapSVG");
var navg = svg.append('g')
    .attr('id', 'timeline');
var lineg = svg.append('g')
    .attr('id', 'lineg');

// Set up textures
var t = textures.lines()
  .thicker(10)
  .thinner(4);
svg.call(t);

var countryhashMap = new Object();
var countryhashCOW = new Object();
var nmchash = [];
var mphash = new Object();
var warhash = new Object();
var codehash = [];
var nmchashkey = new Object();

var warOpen;
var lineVar = 'milex'; 

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
function types2(d) {
  d.StDateP = dateFormat(zeropad(d.stmonth)+'/'+
    zeropad(d.stday)+'/'+d.styear);
  d.EndDateP = dateFormat(zeropad(d.endmonth)+'/'+
    zeropad(d.endday)+'/'+d.endyear);
  return d;
}
function types3(d) {
  d.date = dateFormat(zeropad('01')+'/'+
    zeropad('01')+'/'+d.year);
  return d;
}

function zeropad(x){
  var val = String(x);
  var zeros = '00'
  return zeros.substring(0, (zeros.length - val.length)) + val;
}

function recolorCirc(){
  navg.selectAll(".tlcirc")
    .style("fill", function(d){
      if(d['StDateP'] != undefined && 
        d['StDateP'].getTime() > rounded[0] 
        && d['StDateP'].getTime() < rounded[1]
        && (clicked == 0 || countryhashMap[clicked]['cowCode'] == d['ccode'])){
        if(d['Outcome'] == 1){
          return '#3C9EB4';
        } else if(d['Outcome'] == 2){
          return '#AC394B';
        }
        return "#111";
      } else {
        return "#aaa";
      }
    })
    .attr("r", function(d){
      if(d['StDateP'] != undefined && 
        d['StDateP'].getTime() > rounded[0] 
        && d['StDateP'].getTime() < rounded[1]){

        if (countryhashMap[clicked]['cowCode'] == d['ccode']){
          return 3;
        }
        if(d['Outcome'] == 1 || d['Outcome'] == 2){
            return 1;
        }
      }
      return 0.5;
    });
}

function addBoxes(){
  var tmpHTML = '', itemHTML = '', allHTML = '',
      hasCtry = 0;
  for (d in warhash) {
    hasCtry = 0;
    tmpHTML = '<div id="' + warhash[d]['name'] +
      '" class="ui styled accordion"><div class="title';
    if(warhash[d]['name'] == warOpen){
      tmpHTML += ' active"><i class="dropdown icon"></i>'+
        warhash[d]['min'].getFullYear() + '-' + warhash[d]['max'].getFullYear() + 
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 
        warhash[d]['name'] + '</div><div class="active content">';
    } else {
      tmpHTML += '"><i class="dropdown icon"></i>'+
        warhash[d]['min'].getFullYear() + '-' + warhash[d]['max'].getFullYear() + 
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 
        warhash[d]['name'] + '</div><div class="content">';
    }
    if (warhash[d]['min'] > rounded[0].getTime() && 
      warhash[d]['max'] < rounded[1].getTime()){
      for(e in warhash[d]){
        if(warhash[d][e]['txt'] != undefined){
          if(countryFilter==0 || (countryFilter!=0 && warhash[d][e]['ccode'] == countryFilter)){
            hasCtry = 1;
          }
          tmpHTML += warhash[d][e]['txt'];
        }
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
  recolor(warhash);
  d3.select("#warBox")
    .html(allHTML);
  $('.ui.accordion').accordion('refresh');
  recolorCirc();
}

function recolor(warData){
  g.selectAll("path")
    .style("fill", function(d) {
      var tmpID = countryhashMap[d.id];
      if(tmpID != undefined){
        var cName = Number(tmpID['cowCode']);
        for (i in warData){
          if(warData[i]['ccode'] != undefined){
            if (cName == Number(warData[i]['ccode'])){
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
        var tmpMP = mphash[Number(tmpID['cowCode'])];
        if(tmpMP != undefined &&
          (tmpMP['StDateP'] < rounded[1] && 
          tmpMP['EndDateP'] > rounded[0])){
          return t.url();
        }
      }
      return '#222';
    });
}

function allblack(){
  g.selectAll("path")
    .style("stroke-width", '0px');
}

// Draw line
function lineplot(lc2, lv){
  var lc = nmchashkey[lc2];
  lineg.selectAll('.lines').remove();
  lineg.selectAll('g').remove();
  // X
  var navXline = d3.time.scale()
    .domain(dateRange)
    .range([0, navWidth-30]);
  // Y
  var domYline = d3.extent(nmchash[lc].map(function(d) {
    return Number(d[lv]);
  }));
  domYline[0] = 0;
  domYline[1] = Number(domYline[1]);
  var navYline = d3.scale.linear()
    .domain(domYline)
    .range([navHeight-1, 0]);
  var line = d3.svg.line()
    .x(function(d) { 
      return navXline(d['date']); 
    })
    .y(function(d) { 
      return navYline(d[lv]) || 0; 
    });
  lineg
    .append("path")
    .attr("transform", "translate(180," + (height - (2 * navHeight)- 50) + ")")
    .attr('class', 'linegraph')
    .attr('class', 'lines')
    .attr("d", line(nmchash[lc]));

  // Y axis
  var tickctr=0;
  var yAxisline = d3.svg.axis()
    .scale(navYline)
    .orient("left")
    .ticks(5, "s");
  lineg.append('g')
    .attr('id', 'yAxis')
    .attr("transform", "translate(160," + (height - (2 * navHeight)- 50) + ")")
    .call(yAxisline);
  lineg.append('g')
    .attr("id", "scatterlabel")
    .attr("transform", "translate(120," + (height- (2 * navHeight) - 10) + ")")
    .append('text')
    .attr("class", "label2")
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text(codehash[lv]);
}

function nmcSelect(){
  lineVar = $("#cVar").val();
  if(clicked){
    var tmp = countryhashMap[clicked];
    if(tmp != undefined){
      countryFilter = tmp['cowCode'];
      lineplot(countryFilter, lineVar);
    }
  }
}

function setupKeys(){
  var keySquare1 = svg
    .append('rect')
    .attr('x', 640)
    .attr('y', 0)
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", function(d) {
      return t.url();
    });
  var keySquare2 = svg
    .append('rect')
    .attr('x', 640)
    .attr('y', 20)
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", function(d) {
      return '#3C9EB4';
    });
  var keySquare3 = svg
    .append('rect')
    .attr('x', 640)
    .attr('y', 40)
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", function(d) {
      return '#AC394B';
    });
}
setupKeys();

// Create the map
function drawMap(){
  // Load data
  d3.json("../data/maps/final/world.json",function(error,geodata) {
  d3.csv("../data/other/CCFin.csv",function(error2,cCode) {
  d3.csv("../data/COW/Inter-StateWarData_v4.0.csv", types, function(error4, cow) {
  d3.csv("../data/SystemMembership_MajorPower/majors2011.csv", types2, function(error5, mp) {
  d3.csv("../data/NationalMaterialCapabilities/NMC_v4_0.csv", types3, function(error6, nmc) {
      if (error) return console.log(error);
      if (error2) return console.log(error2);
      if (error4) return console.log(error4);
      if (error5) return console.log(error5);
      if (error6) return console.log(error6);

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
        codehash['irst'] = "Iron + steel production";
        codehash['milex'] = "Military Expenditures";
        codehash['milper'] = "Military Personnel";
        codehash['pec'] = "Energy Consumption";
        codehash['tpop'] = "Total Population";
        codehash['upop'] = "Urban Population";
      }
      buildCodes();

      // Set up hashes
      cCode.forEach(function(d, i) {
          countryhashCOW[d.cowCode] = d;
          countryhashMap[d.CId] = d;
      });
      mp.forEach(function(d, i) {
          mphash[d.ccode] = d;
      });
      var tmpCTRY = '', tmpi=-1, tmpj=0;
      nmc.forEach(function(d, i) {
          if(tmpCTRY != d.ccode){
            tmpCTRY = d.ccode;
            tmpi++;
            tmpj=0;
            nmchashkey[d.ccode] = tmpi;
            nmchash[tmpi] = [];
          }
          nmchash[tmpi][tmpj] = d;
          tmpj++;
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
        .attr("transform", "translate(120," + (height - navHeight - 5) + ")")
        .append('text')
        .attr("class", "label2")
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Fatalities by country");
      navg.select('#scatterlabel')
        .append('text')
        .attr("class", "label1")
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("dy", "1.5em")
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

      // Draw map
      g.selectAll("path")
        .data(topojson.feature(geodata,geodata.objects.countries).features) 
        .enter()
        .append("path")
        .attr("transform", "translate(0," + -85 + ")")
        .attr("class", "countries")
        .attr("d",path)
        .attr("id", function(d) {
          return d.id;
        })
        .style("fill", function(d){
          var tmpID = countryhashMap[d.id];
          if(tmpID != undefined){
            var tmpMP = mphash[Number(tmpID['cowCode'])];
            if(tmpMP != undefined &&
              (tmpMP['StDateP'] < rounded[1] && 
              tmpMP['EndDateP'] > rounded[0])){
              return t.url();
            }
          }
          return '#222';
        })
        .on("mouseover", function(d) {
          d3.select(this)
            .style("fill", function(){
              currCol = $(this).attr('style');
              currCol = currCol.match(/fill: ([^;]*);/)[1];
              return "#fafafa";
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
            });
        })
        .on("click", function(d) {
          var tmp = countryhashMap[d.id];
          if(clicked == 0 || clicked != d.id){
            console.log(d.id);
            clicked = d.id;
            allblack();
            d3.select(this)
              .style({
                stroke: '#fff',
                'stroke-width': '3px'
              });
          } else {
            clicked = 0;
            $('.sLine').addClass('hidden');
            lineg.selectAll('.lines').remove();
            lineg.selectAll('g').remove();
            d3.select(this)
              .style('stroke-width', '0px');
          }
          if(tmp != undefined){
            countryFilter = tmp['cowCode'];
            addBoxes();
            lineplot(countryFilter, lineVar);
            d3.select("#splotTitleLine")
              .select("#cName")
              .text(function(){
                if(countryhashCOW[countryFilter]){
                  $('.sLine').removeClass('hidden');
                  return countryhashCOW[countryFilter]['StateName'];
                } else {
                  $('.sLine').addClass('hidden');
                  lineg.selectAll('.lines').remove();
                  lineg.selectAll('g').remove();
                  return '';
                }
              });
          } else {
            countryFilter = 0;
            clicked = 0;
            $('.sLine').addClass('hidden');
            lineg.selectAll('.lines').remove();
            lineg.selectAll('g').remove();
            recolorCirc();
          }
        });
      addBoxes();
  });          
  });
  });
  });
  });
}
drawMap();

function accordChange(){
  var warNum = $(this).find(">:first-child").attr('id');
  var warData = warhash[warNum];
  warOpen = warhash[warNum]['name'];
  recolor(warData);
}

function accordClose(){
  g.selectAll("path")
    .style("fill", function(d){
      var tmpID = countryhashMap[d.id];
      if(tmpID != undefined){
        var tmpMP = mphash[Number(tmpID['cowCode'])];
        if(tmpMP != undefined &&
          (tmpMP['StDateP'] < rounded[1] && 
          tmpMP['EndDateP'] > rounded[0])){
          return t.url();
        }
      }
      return '#222';
    });
}

$( document ).ready(function() {
  $('.ui.accordion').accordion();

  function warheight(){
    $('#warBox').css('height', window.innerHeight);
  }
  warheight();
  window.onresize = warheight;
});