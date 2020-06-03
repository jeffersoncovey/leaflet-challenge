function createFeatures(earthquakeData, faultData) {

    function onEachQuakeLayer(feature, layer) {
        return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
          fillOpacity: 1,
          color: markerColor(feature.properties.mag),
          fillColor: markerColor(feature.properties.mag),
          radius:  markerSize(feature.properties.mag)
        });
    }
    
    // Give each feature a popup describing the place and time of the earthquake
    function onEachEarthquake(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    const earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachEarthquake,
        pointToLayer: onEachQuakeLayer
    });

    function onEachFaultLine(feature, layer) {
        L.polyline(feature.geometry.coordinates);
    }

    const faultLines = L.geoJSON(faultData, {
        onEachFeature: onEachFaultLine,
        style: {
          weight: 2,
          color: 'orange'
        }
    });

    // Sending our earthquakes and faultLines layer to the createMap function
    createMap(earthquakes, faultLines);
}


function markerColor(magnitude) {
    var color = "";

    if (magnitude > 5) {
        color = "#581845";
    }
    else if (magnitude > 4) {
        color = "#900C3F";
    }
    else if (magnitude > 3) {
        color = "#C70039";
    }
    else if (magnitude > 2) {
        color = "#FF5733";
    }
    else if (magnitude > 1) {
        color = "#FFC300";
    }
    else {
        color = "#DAF7A6";
    }

    return color
}

function markerSize(magnitude) {
    return magnitude * 5;
}

function createLegend(earthquakes){
    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
    
        var legendInfo = "<h3>Earthquake Magnitude</h3>";

        div.innerHTML = legendInfo;

        for (let i = 0; i < grades.length; i++) {
            div.innerHTML += '<li style="background-color:' + markerColor(grades[i] + 1) + '">' + labels[i] + '</li>';
        }

        
        return div;
    };  
    return legend;
}




  

function createMap(earthquakes, faultLines) {

    // Define satellite, grayscale and outdoor map layers
    const satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.satellite",
            accessToken: API_KEY
    });

    const grayscaleMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.light",
            accessToken: API_KEY
    });

    const outdoorMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    // Define a baseMaps object
    const baseMaps = {
            "Satellite Map": satelliteMap,
            "Grayscale": grayscaleMap,
            "Outdoors": outdoorMap
    };

    // Define an overlay object
    const overlayMaps = {
            Earthquakes: earthquakes,
            "Fault Lines": faultLines
    };

    // Define a map object
    const myMap = L.map("map", {
            center: [34.05, -118.24],
            zoom: 4,
            layers: [satelliteMap, earthquakes, faultLines]
    });

    // Pass our map layers into our layer control
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
    }).addTo(myMap);

    // Create legend and adds to the map
    const legend = createLegend(earthquakes)
    legend.addTo(myMap);

}

(async function(){
    const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
    const faultUrl =  "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
    const earthquakeData = await d3.json(earthquakeUrl);
    const faultData = await d3.json(faultUrl);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(earthquakeData.features, faultData.features);
})()

