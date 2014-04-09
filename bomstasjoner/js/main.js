/**
* RASK DEMONSTRASJON PÅ HVORDAN LEGGE MARKØRER I FORSKJELLIGE LAG BASERT PÅ 
* VERDIER I HVER FEATURE FRA GEOJSON
* MERK: IKKE OPTIMAL LØSNING, MEN FUNGERENDE OG ENKEL FOR OPPLÆRING
*/
//vi gjør "map" tilgjengelig i console
var map;

$(document).ready(function() {
    //starter kartmotoren og putter det i div med id="map"
    map = new WebatlasMap('map', {customer: 'WA_JS_V3_Coursework'});

    //endrer senterpunkt til koordinatene og setter zoomnivå
    map.setView(new L.LatLng(63.37183,10.37943), 11)

    //Sett opp default stil til de nye sirkelmarkørene
    var geojsonMarkerOptions = {
        radius: 4,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //definerer en punktliste som vi trenger til heatmap mm
    var pointList = [];

    
    //definer en funksjon som vi skal kalle for hver feature som leses i L.geoJson()
    function visPopup(feature, layer) {
        
        //legg til et punkt i punktliste, som trengs for heat map mm. Punktet er en liste med "lat, lng"
        pointList.push([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);

        //midlertidig variabel for å bygge strengen til popup'en
        var string = "";
        //looper igjennom alle _egenskapene_ til JSON-objektet
        for (var k in feature.properties) {
            //bygger strengen basert på egenskapsnavnet (k) og verdien til egenskapen feature.properties[k]
            string += k + " : " + feature.properties[k] + "<br>"
        }
        //knytter en popup til hver feature med strengen vi nettopp bygde
        layer.bindPopup(string);
        
        /*
        LAGER NYE LAG OG LEGGER TIL EGNE LAYERGROUPS BASERT PÅ ATTRIBUTTER I HVER FEATURE
        */
        console.log(feature);
        console.log(feature.properties);
        console.log(feature.properties.takst_liten_bil);
        
        var circleMarker;
        var latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
        
        if(feature.properties.takst_liten_bil === "5.0") {
            //endre på stilen - merk denne må resettes etterpå.
            geojsonMarkerOptions.fillColor = "#00ff00";
            geojsonMarkerOptions.radius = "8";
            //lag ny sirkelmarkør
            circleMarker = L.circleMarker(latlng, geojsonMarkerOptions);
            //bind en popup til markøren
            circleMarker.bindPopup(string);
            //legg til takst1-laget
            takst1.addLayer(circleMarker);
        } else if (feature.properties.takst_liten_bil === "10.0") {
            geojsonMarkerOptions.fillColor = "#ff0000";
            geojsonMarkerOptions.radius = "8";
            circleMarker = L.circleMarker(latlng, geojsonMarkerOptions);
            
            circleMarker.bindPopup(string);

            takst2.addLayer(circleMarker);
        } else {
            //default, don't change the styling
        }
        //reset default value
        geojsonMarkerOptions.fillColor = "#ff7800";
        geojsonMarkerOptions.radius = "4";

    };

    var takst1 = new L.LayerGroup().addTo(map);
    map.LayerControl.addOverlay(takst1, "Takst liten bil = 5");

    var takst2 = new L.LayerGroup().addTo(map);
    map.LayerControl.addOverlay(takst2, "Takst liten bil = 10");

    
    //Start "geoJson"-motoren til Leaflet. Den tar inn et JSON-objekt i en variabel. Denne har vi definert i JSON-filen i index.html
    var bomstasjoner = L.geoJson(bomstasjonerGeoJSON, {
        onEachFeature: visPopup,//vi refererer til funksjonen vi skal kalle. Husk at funksjonen også er et objekt
        pointToLayer: function(feature, latlng) {
            circleMarker = L.circleMarker(latlng, geojsonMarkerOptions);
            //add to "bomstasjoner" layer. 
            return circleMarker;
        }
    }).addTo(map);

    //legg til punktene til "layer control"
    map.LayerControl.addOverlay(bomstasjoner, "Bomstasjoner i Trondheim");

    
    
    // ---------------- Fancy tilleggsfunksjoner fra eksempel 7
    
    // --- Lager heatmap ---
    //start opp heatmap-motoren - vi bruker punktlisten vi lagde ovenfor og setter parametere
    var heatmapLayer = L.heatLayer(pointList, {
        radius: 80
    });
    
    //Legg til heatmap til layer control
    map.LayerControl.addOverlay(heatmapLayer, "Heatmap");

    
    // --- Dekning, maskeringsmotor

    //start opp maskeringsmotoren og sett nødvendige parametere
    var coverageLayer = new L.TileLayer.MaskCanvas({
        'opacity': 0.8,
        radius: 500,
        useAbsoluteRadius: true,
        'attribution': ''
    });
    
    //knytt punktlisten vår til maskeringsmotoren
    coverageLayer.setData(pointList);
    //legg til maskering som eget lag i layer control
    map.LayerControl.addOverlay(coverageLayer, "Dekning");

    // --- Clustermotor
    //start clustermotoren
    var markers = new L.MarkerClusterGroup();

    //legg til eiendommer-laget til clustermotoren og legg til kartet
    markers.addLayer(dataLayer).addTo(map);
    //legg også til som eget lag i layer control
    map.LayerControl.addOverlay(markers, "Datalag (cluster)");    

    
});