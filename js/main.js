function test(graphicID, dataFile){
  function drawGraphic(container_width) {
    if (container_width>750){
      container_width  = 750;
    } 
    console.log(container_width)
    
    var $graphic = $("#" + graphicID)
    if(typeof($graphic[0]) == "undefined"){
      return
    }
    $graphic.empty()
    var mobileThreshold = 653;
    var bottomPadding, aspectHeight;
    if(container_width < mobileThreshold){
      aspectHeight = .7;
      bottomPadding = 150

    }
    else{
      aspectHeight = .7;
      bottomPadding = 100
    }
    var margin = {top: 30, right: 30, bottom: 50, left: 120},
        aspectWidth = 1,
        width = container_width - margin.left - margin.right
        var height = Math.ceil((width * aspectWidth) / aspectHeight) - margin.top - margin.bottom;
    var y = d3.scale.ordinal()
        .rangeRoundBands([0, height], .1);

    var x = d3.scale.linear()
        .rangeRound([0,width]);


    var color = d3.scale.ordinal()
        .range(["#fcb918", "#1696d2", "#8A181A", "#838689"]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var xBreaks = [0,.25,.5,.75,1]

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickValues(xBreaks)
        .tickFormat(d3.format("%"));


    var svg = d3.select("#" + graphicID).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + bottomPadding)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    xBreaks.forEach(function(d){
      svg.append("line")
         .attr("class","grid-line")
         .attr("x1",x(d))
         .attr("x2",x(d))
         .attr("y1",y(0))
         .attr("y2",height);
    })

    d3.csv("data/" + dataFile, function(error, data) {
      color.domain(d3.keys(data[0]).filter(function(key) { return key !== "country"; }));

      data.forEach(function(d) {
        var x0 = 0;
        d.indicators = color.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += +d[name]}; });
        d.total = d.indicators[d.indicators.length - 1].x1;
      });

      // data.sort(function(a, b) { return parseFloat(b.indicator1) - parseFloat(a.indicator1); });
      y.domain(data.map(function(d) { return d.country; }));
      x.domain([0, d3.max(data, function(d) { return d.total; })]); 

      var legend = d3.select("#" + graphicID)
          .selectAll(".legend")
            .data(color.domain().slice())
          .enter().insert("button","svg")
            .attr("class", "legend")
            .style("background", color)
            .text(function(d){return d})
            .on("click", function(d){ sortBars(d, false) });


            d3.select("#" + graphicID)
            .insert("button","svg")
              .attr("class", "legend reverse")
              .style("background","#000")
              .text("All Decentralized")
              .on("click", function(){
                // console.log(this)
                sortBars("Strictly Central", true)
              })

      svg.append("g")
          .attr("class", "y axis")
          // .attr("transform", "translate(" + width + ",0)")
          .call(yAxis);

      svg.append("g")
          .attr("class", "x axis")
          .call(xAxis)
          .attr('transform','translate(0,'+ height +')')
        .append("text")
          .attr("class","axis-label")
          .attr("y", 6)
          .attr("dy", "2.5em")
          .attr("dx","30%")
          .text("Percentage");

        var country = svg.selectAll(".country")
          .data(data)
        .enter().append("g")
          .attr("class", "g")
          .attr("transform", function(d) { return "translate(0," + y(d.country) + ")"; });


        country.selectAll("rect")
          .data(function(d) { return d.indicators })
        .enter().append("rect")
          .attr("class","bar")
          .attr("height", y.rangeBand())
          .attr("x", function(d) { return x(d.x0); })
          .attr("width", function(d) { return x(d.x1) - x(d.x0); })
          .style("fill", function(d) { return color(d.name); });

        d3.select("#clickTap").text("Click on")


        // legend.append("div")
        //     .attr("x", width - 100)
        //     .attr("width", 100)
        //     .attr("height", 30)
        //     .style("fill", color);

        // legend.append("text")
        //     .attr("class","legend-text")
        //     // .attr("x", width - 15)
        //     // .attr("y", 14)
        //     // .attr("dy", ".35em")
        //     // .style("text-anchor", "end")
        //     .text(function(d) { return d; });

      // else{
      //   d3.select("#clickTap").text("Tap")
      //   var legend = svg.selectAll(".legend")
      //       .data(color.domain().slice())
      //     .enter().append("g")
      //       .attr("class", "legend")
      //       .attr("transform", function(d, i) {
      //         // console.log(i, (Math.floor(i/3)+parseFloat(0))*i)
      //         var base;
      //         if (i > 2){ base = 260}
      //         else{ base = -10}
      //         return "translate(-"+ (base-50+width - i*105) + ','
      //          + (parseFloat(Math.floor(i/3)*40)+parseFloat(height+60)) + ")"; })
      //       .on("click", function(d){ sortBars(d) });

      //   legend.append("rect")
      //       .attr("x", width - 100)
      //       .attr("width", 100)
      //       .attr("height", 30)
      //       .style("fill", color);

      //   legend.append("text")
      //       .attr("class","legend-text")
      //       .attr("x", width - 15)
      //       .attr("y", 14)
      //       .attr("dy", ".35em")
      //       .style("text-anchor", "end")
      //       .text(function(d) { return d; });

      // }


      var falseAxis = svg.append("line")
         .attr("class","false-axis")
         .attr("x1",x(0))
         .attr("x2",x(0))
         .attr("y1",y(0))
         .attr("y2",height);

      function sortBars(indicator, reverse){
        data.forEach(function(d) {
          var x0 = 0;
          var loc = color.domain().indexOf(indicator)
          color.domain().splice(loc,1)
          if(!reverse){color.domain().unshift(indicator)}
          else{color.domain().push(indicator)}
          d.indicators = color.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += +d[name]}; });
          d.total = d.indicators[d.indicators.length - 1].x1;
        });
        var transition = svg.transition().duration(750),
          delay = function(d, i) { return i * 50; };

        data.sort(function(a, b) { return parseFloat(b[indicator]) - parseFloat(a[indicator]); });

        if(reverse){ data.reverse()}

        y.domain(data.map(function(d) { return d.country; }));
        x.domain([0, d3.max(data, function(d) { return d.total; })]);


        country.selectAll("rect")
          .data(function(d) { return d.indicators })
        .transition()
          .delay(delay)
          .duration(250)
          .attr("x", function(d) { return x(d.x0); })
          .attr("width", function(d) { return x(d.x1) - x(d.x0); })
          .style("fill", function(d) { return color(d.name); })
          .style("opacity",function(d,i){
            if(!reverse){
              if (i != 0){ return .2}
              else{return 1}
            }
            else{
              if( i == 3){return .2}
              else{ return 1}
            }
          });

        if (!reverse){
          d3.selectAll("button")
          .style("opacity",function(d){
            if(d == indicator) { return 1}
            else{ return .35}
          })
        }
        else{ d3.selectAll("button").style("opacity",.35)
              d3.select("button.reverse").style("opacity",1)
            }

        country
            .transition()
            .duration(750)
            .delay(delay)
            .attr("transform", function(d) { return "translate(0," + y(d.country) + ")"; });

        transition.select(".y.axis")
            .call(yAxis)
          .selectAll("g")
            .delay(delay);

        svg.append(falseAxis)

      }

    });
  }
  pymChild = new pym.Child({ renderCallback: drawGraphic });
}

test("healthGraphic","health.csv")
test("educationGraphic","education.csv")