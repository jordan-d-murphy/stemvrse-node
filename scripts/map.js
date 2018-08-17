$(document).ready(function(){
    console.log("\n\nTHE SCRIPT WAS LOADED!!!!   (map.js)\n\n")
    $(document).arrive("#email", {onceOnly: true}, function() {
        console.log("\n\n#email has arrived!!!!\n\n")
        // 'this' refers to the newly created element
        var email = $(this).val();

        var socket = io();
        socket.emit('room', email);
    

        const svg = d3.select("svg")
        const myProjection = d3.geoNaturalEarth1()
        const path = d3.geoPath().projection(myProjection)
        const graticule = d3.geoGraticule()
       
       
   
        queue()
            .defer(d3.json, "https://unpkg.com/world-atlas@1.1.4/world/110m.json")
            .defer(d3.json, "../assets/videoCoords.json")
            .await(drawMap);


        function drawMap(err, world, videoCoord) {
            if (err) throw err

            
           
            svg.append("path")
                .datum(graticule.outline)
                .attr("class", "foreground")
                .attr("d", path);

            svg.append("g")
                .selectAll("path")
                .data(topojson.feature(world, world.objects.countries).features)
                .enter().append("path")
                .attr("d", path);

            svg.selectAll(".symbol")
                .data(videoCoord.features)
                .enter().append("path")
                .attr("class", "symbol")
                .attr("d", path.pointRadius(function(d) { return 20; }))
                .on("mouseover", function(d) {
                    
                    d3.select(this).style("fill", "#00d8ff");
                    d3.select(this).attr("d", path.pointRadius(function(d) { return 23; }));
                    var nearby = [];
                    var center = d.geometry.coordinates;
                
                    svg.selectAll(".symbol").each(function (c) {
                        neighborCenter = c.geometry.coordinates;
                        // console.log("clicked center: " + center + "    neighbor center: " + neighborCenter);
                        xDiff = Math.abs(center[0] - neighborCenter[0]);
                        yDiff = Math.abs(center[1] - neighborCenter[1]);
                
                        
                        if (xDiff < 10 && yDiff < 10) {
                            // console.log("Distance apart for closest neighbors  x: " + xDiff + "   y: " + yDiff);
                            nearby.push({"name": c.properties.name, "displayName": c.properties.displayName })
                        }
                
                
                    }); 
                    console.log("nearby")
                    console.log(nearby)
                    nearbyLI = ""
                    for (result in nearby) {
                        var li = '<div class="nearbyLI" id="' + nearby[result].name + '"><strong>' + nearby[result].displayName + '</strong></div>'
                        nearbyLI += li;
                    }
                    var popup = '<div id="popup"><ul style="list-style: none; padding-left: 0;">' + nearbyLI + '</ul></div>'
                    
                    $(d).append(popup);
                    // $("#popup").css({ top: d.clientY, left: d.clientX});

                    // console.log("here's the d");
                    // console.log(d);
                })
                .on("mouseout", function() {
                    d3.select(this).style("fill", "#16d7f9");
                    d3.select(this).attr("d", path.pointRadius(function(d) { return 20; }));
                    var element = $("#popup");
                    element.parentNode.removeChild(element);


                })
                .on("click", function(d) {
                    var nearby = [];
                    var center = d.geometry.coordinates;
                
                    svg.selectAll(".symbol").each(function (c) {
                        neighborCenter = c.geometry.coordinates;
                        // console.log("clicked center: " + center + "    neighbor center: " + neighborCenter);
                        xDiff = Math.abs(center[0] - neighborCenter[0]);
                        yDiff = Math.abs(center[1] - neighborCenter[1]);
                
                        
                        if (xDiff < 10 && yDiff < 10) {
                            // console.log("Distance apart for closest neighbors  x: " + xDiff + "   y: " + yDiff);
                            nearby.push({"name": c.properties.name, "displayName": c.properties.displayName })
                        }
                
                
                    }); 
                    console.log("nearby")
                    console.log(nearby)
                    
                    $("#results div").remove();
                    for (result in nearby) {
                        $("#results").append('<div class="nearbyResults" id="' + nearby[result].name + '"><strong>' + nearby[result].displayName + '</strong></div>')
                    }
                    
                    
                    
                });

           

          }
       

       
        //   d3.json("https://unpkg.com/world-atlas@1.1.4/world/110m.json", drawMap)
       
            

            
    
        
        
    

       
    }); 
   
});
