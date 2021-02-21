var airport_layer = L.layerGroup();
var runways_layer = L.layerGroup();
var runways_marker = L.layerGroup();
var runways_guides = L.layerGroup();
var ils_layer = L.layerGroup();
var ils_marker = L.layerGroup();
var vor_marker = L.layerGroup();
var ndb_marker = L.layerGroup();
var plane_layer = L.layerGroup();
var track_layer = L.layerGroup();
var route_layer = L.layerGroup();
var route_marker = L.layerGroup();
var fixes_layer = L.layerGroup();

var airportRadius = 1000;

var planeAngle = 0;
var planeIcon;
var plane;
var planeAlwaysNorth = false;
var planeAlwaysCenter = false;
var planeInitBearing = true;
var planeRefreshInterval = 250;

//var windMarker;
//var windIcon;

var oldLat;
var oldLon;
var planeLat;
var planeLon;

var prevLat;
var prevLon;
var prevHdg;
var acuh;

var routeMinDrawDistance = 200; //200
var routeMaxDrawDistance = 10000; //200
var zoomInitial = 10;

var followPlane = true;

var pointerMode = 0;

var last_polyline;

var dest_polyline;

var basemap;
var baseMaps;
var overlayMaps;
var controlLayers;

var _map_last_point;

var _last_MapBounds;

//var _minimap_threshold = 400;

var map_wind_arrows = 10; //22
var map_wind_prevDir;
var map_wind_acuh;

var map = L.map('map', { maxBoundsViscosity: 1.0, rotate: true }).setView([0, 0], zoomInitial); //[39.49635201, -0.50011091] //, pan: false, animate: false

/*map.scrollWheelZoom.disable()
map.dragging.disable()
map.touchZoom.disable()
map.doubleClickZoom.disable()
map.boxZoom.disable()
map.keyboard.disable()
if map.tap map.tap.disable()*/

var ils_list = [];
var runway_list = [];

// Force zIndex of Leaflet
(function (global) {
    var MarkerMixin = {
        _updateZIndex: function (offset) {
            this._icon.style.zIndex = this.options.forceZIndex ? (this.options.forceZIndex + (this.options.zIndexOffset || 0)) : (this._zIndex + offset);
        },
        setForceZIndex: function (forceZIndex) {
            this.options.forceZIndex = forceZIndex ? forceZIndex : null;
        }
    };
    if (global) global.include(MarkerMixin);
})(L.Marker);
//


//carousel has not to move automatically
$('.carousel').each(function () {
    $(this).carousel({
        interval: false
    });
})

function smoothPlaneTransitionOFF() {
    $('.leaflet-marker-pane > *').css('-webkit-transition', '');
    $('.leaflet-marker-pane > *').css('-moz-transition', '');
    $('.leaflet-marker-pane > *').css('transition', '');
}

function smoothPlaneTransitionON() {
    $('.leaflet-marker-pane > *').css('-webkit-transition', 'all .5s linear'); //transform
    $('.leaflet-marker-pane > *').css('-moz-transition', 'all .5s linear');
    $('.leaflet-marker-pane > *').css('transition', 'all .5s linear');
}

function resetMapBounds() {
    //var z = map.getZoom() 
    var newLatLng = new L.LatLng(planeLat, planeLon);

    //map.setZoom(z - 1);
    map.invalidateSize();
    map._resetView(newLatLng, map.getZoom()); //zoomInitial
    //map.setZoom(z);   
}

function toggleAlwaysCenter() {
    planeAlwaysCenter = !planeAlwaysCenter;

    resetMapBounds();

    planeInitBearing = true;
    setMapWindRotation();
    initPlane();
    centerPlane();
    
    followPlane = true;

    refreshMultiplayerPlanes(); 
}


function toggleAlwaysNorth() {   
    planeAlwaysNorth = !planeAlwaysNorth;    
    
    resetMapBounds();

    if (planeAlwaysNorth) {
        plane.setRotationAngle(0);
    }
    else {
        map.setBearing(0);
    }

    planeInitBearing = true;
    setMapWindRotation();    
    initPlane();    
    centerPlane();    

    followPlane = true;

    refreshMultiplayerPlanes(); 
}

function setMapWindRotation() {       
    var hdg = 0;

    if (planeAlwaysNorth) hdg = parseFloat(stored_data["indicators/heading"]);

    //var rm = 90  + parseFloat(stored_data["wind/direction"]);    
    var rm = 90 - hdg + parseFloat(stored_data["wind/direction"]);

    var d = AngleDifference(map_wind_prevDir, rm);

    if (!map_wind_acuh) {
        map_wind_acuh = rm;
    } else {
        map_wind_acuh = map_wind_acuh + d;
    }        
    
    $("#map_wind").css({ 'transform': 'translate(-50.5%, -50%) rotateZ(' + map_wind_acuh + 'deg)' });
    //$("#map_wind").css({ '-webkit-transform': 'rotate(' + rm + 'deg)' });

    map_wind_prevDir = rm;
};

function setMapWindInfo() {   
    if (planeLat && planeLon) {
        var wp = Math.round(parseFloat(stored_data["wind/speed"]));
        var wd = Math.round(parseFloat(stored_data["wind/direction"]));
        var mwi = wd + "&deg;&nbsp;" + wp + "<small>KT</small>&nbsp;" + "&#8649; ".repeat(map_wind_arrows) + "&nbsp;" + wp + "<small>KT</small>&nbsp;" + wd + "&deg;"; // &#8694; 
        $("#map_wind").html(mwi);     

        var newLatLng = new L.LatLng(planeLat, planeLon);
        var planePos = map.latLngToContainerPoint(newLatLng);

        //$("#map_wind").css("top", planePos.y - 20 + 'px');
        //$("#map_wind").css("left", planePos.x - ($("#map_wind").width() / 2) + 'px');

        $("#map_wind").css("top", planePos.y + 'px');
        $("#map_wind").css("left", planePos.x + 'px');

        //setMapWindRotation();

        /*var mappos = $("#map").offset();
        var positio90 + parseFloat(stored_data["wind/direction"]);n = $(plane._icon).offset();
        $("#map_wind").css("top", position.top - mappos.top - 0 + 'px');
        $("#map_wind").css("left", position.left - mappos.left - ($("#map_wind").width() / 2) + 'px');*/
    }     
}

$(document).ready(function () {
    //initPlane();
    //compass();    

    map.doubleClickZoom.disable() //This fixed zoom issue in bad touch screen 

    //L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map); //Create this layer just in case
    //L.tileLayer.provider(mapProvider).addTo(map);

    //var mapURL = 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png';
    //var mapURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    //var mapURL = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    //var mapURL = 'https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png'; //?apikey={apikey}'
    //var mapURL2 = 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png';
    //mapURL comes from config, above just examples or overrrides.    
    //var basemap = L.tileLayer(mapURL, { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
    //var basemap2 = L.tileLayer(mapURL2, { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);    

    basemap = L.tileLayer(loadedMaps[selectedMap].mapURL, { attribution: loadedMaps[selectedMap].attribution, noWrap: true }).addTo(map);

    checkZooms();

    centerPlane();

    smoothPlaneTransitionON();

    baseMaps = {
        //"Map": basemap,
        //"Mop": basemap2,
    };
   
    /*$.each(loadedMaps, function (index, item) {       
            baseMaps[item.name] = L.tileLayer(item.mapURL, { attribution: item.attribution }).addTo(map);;
    });*/

    /*var baseMaps = {};
    loadedMaps.slice().reverse().forEach(function (item) {
        baseMaps[item.name] = L.tileLayer(item.mapURL, { attribution: item.attribution}).addTo(map);;
    })*/

    overlayMaps = {
        "Airports": airport_layer,
        "Runways": runways_layer,
        "Runway Guides": runways_guides,
        "Runway Marker": runways_marker,
        "ILS Feathers": ils_layer,
        "ILS Markers": ils_marker,
        "VOR/DME Markers": vor_marker,
        "NDB Markers": ndb_marker,
        "FIX Markers": fixes_layer,
        "Plane": plane_layer,
        "Track": track_layer,
        "Route": route_layer,
        "Route Markers": route_marker,
    };


    if ($("#map").is(":visible")) {
        getElements();
    }

    /*map.addLayer(airport_layer);
    map.addLayer(runways_layer);
    map.addLayer(runways_marker);
    map.addLayer(runways_guides);
    map.addLayer(ils_layer);
    map.addLayer(ils_marker);
    map.addLayer(vor_marker);
    map.addLayer(fixes_layer);
    map.addLayer(plane_layer);
    map.addLayer(track_layer);
    map.addLayer(route_layer);
    map.addLayer(route_marker);*/

    controlLayers = L.control.layers(baseMaps, overlayMaps).addTo(map);    
    setLayers();

    if (mapMode != 0) {
        $("#basemaps-wrapper").hide();
    }    

    /*if (mapMode == 0) {
        L.control.layers(baseMaps, overlayMaps).addTo(map);
    }
    else {
        $("#basemaps-wrapper").hide();
    }*/

    map.on('mouseup', function (e) {
        //console.log(e);
        if (e.originalEvent.target.id == "map")
            pausePlaneTracking();
    });

    /*map.on('map-container-resize', function () {
        //map.invalidateSize(); // doesn't seem to do anything

        setTimeout(function () { map.invalidateSize() }, 500);
    });*/


    //Tablet support
    $("#map").on("touchmove", function (e) {
        pausePlaneTracking();     
    });

    function pausePlaneTracking() {
        //if (mapMode == 0) {
            if (followPlane) {
                console.log("followPlane off");
                followPlane = false;
                mapShowMessage('Plane follow paused until manually resumed', 3000);
            }
        //}
    }

    map.on('click', function (e) {
        console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)

        if (e.latlng) _map_last_point = e.latlng;

        switch (pointerMode) {
            case 1:
                showgotoXYForm(e.latlng.lat, e.latlng.lng);
                break;
            case 2:
                route_AddPOS(e.latlng);

                break;
        }        
    });

    map.on("moveend", function (e) {
        //checkZooms();

        //console.log("moveend", e);

        if (!_last_MapBounds) _last_MapBounds = map.getBounds();

        var _diff_northEast = obj_subtract(_last_MapBounds._northEast, map.getBounds()._northEast);
        var _diff_southWest = obj_subtract(_last_MapBounds._southWest, map.getBounds()._southWest);       

        //var _areEqual = (_last_MapBounds === map.getBounds());

        var _areEqual = (Math.abs(_diff_northEast.lat) < 0.01 && Math.abs(_diff_northEast.lng) < 0.01 && Math.abs(_diff_southWest.lat) < 0.01 && Math.abs(_diff_southWest.lng) < 0.01);
      
        if (!_areEqual) {        
            _last_MapBounds = map.getBounds();

            if (softkeys_menu_enabled && $("#map").is(":visible")) {
                console.log("getElements");
                getElements();
            }
        }
    });  

    map.on('zoomstart', function () {
        //console.log('zoomstart', map.getZoom())

        smoothPlaneTransitionOFF();

    });

    map.on('zoomend', function () {
        //console.log('zoomend', map.getZoom())

        smoothPlaneTransitionON();

        layersZoomCheck();
    });

    $(document).on('change', '.leaflet-control-layers-selector', function () {
        /*$checkbox = $(this);
        if ($checkbox.is(':checked')) {
            console.log("layer checked", this);
        }
        else {
            console.log("layer UNchecked", this);
        }*/

        storeLayers();
    });

    //<span class="target">&target;</span>
    L.easyButton('<div style="font-size: 22px; margin-left: -2px;">&target;</div>', function () {
        
        followPlane = !followPlane; // true;        

        if (followPlane) {
            console.log("followPlane on");
            //map.setZoom(zoomInitial);
            //map.flyTo(new L.LatLng(planeLat, planeLon));
            centerPlane();
            mapShowMessage('Plane follow resumed', 3000);
        }
        else {
            console.log("followPlane off");
            followPlane = false;
            mapShowMessage('Plane follow paused until manually resumed', 3000);
        }

    }, 'Follow the plane').addTo(map);

    if (mapMode == 0) {               
        //'<span class="target">&starf;</span>'
        L.easyButton('<div style="font-size: 22px; margin-left: -2px;">&starf;</div>', function () {
            console.log("Save this position");

            showPositionForm();
        }, 'Save this position').addTo(map);

        L.easyButton('fa-plus-circle', function () {
            if (pointerMode != 1) {
                pointerMode = 1;
                $('.leaflet-container').css('cursor', 'crosshair');

                mapShowMessage('Select position to start', 3000);
            }
            else {
                pointerMode = 0;
                $('.leaflet-container').css('cursor', '');

                mapShowMessage('Select position cancelled', 3000);
            }

            console.log("Select start position ", pointerMode);

        }, 'Select start position').addTo(map);


        L.easyButton('fa-circle-o', function () {
            if (plane._shadow.src.includes("plane_shadow")) {
                plane._shadow.src = "/img/plane_noshadow.png?" + Math.floor(Math.random() * Number.MAX_VALUE);;
            }
            else {
                plane._shadow.src = "/img/plane_shadow.png?" + Math.floor(Math.random() * Number.MAX_VALUE);
            }


            console.log("Toggle plane shadow ", plane._shadow.src);

        }, 'Toggle plane shadow').addTo(map);                    
    }

    if (isMFD) {
        L.easyButton('fa-columns', function () {
            console.log("dual view");

            if (_lastMFDSMode == 1) {
                dualContainerOption("DUAL", true);
            }
            else {
                dualContainerOption("MAP", true);
            }

        }, 'Toggle dual view').addTo(map);

        L.easyButton('fa-list-alt', function () {
            console.log("showInsetMapSource");

            showInsetMapSource();

        }, 'Select map source').addTo(map);

        L.easyButton('fa-pause', function () {
            console.log("musicTogglePause");

            musicTogglePause();

        }, 'Pause music').addTo(map);
    }

    drawRoute();

    //Trace plane 5 times per second. //setInterval
    setTimered(function () {
        try {           
            refreshPlane(); //if (softkeys_menu_enabled)
        }
        catch (e) {            
            throw e.toString();
        }
    }, planeRefreshInterval);

    //Multi_player_support >> //setInterval
    if (multiplayerIsEnabled) {
        setTimered(function () {
            try {
                refreshMultiplayerPlanes(); 
            }
            catch (e) {                
                throw e.toString();
            }
        }, multiplayerInterval);
    }
    //<<
    
    //setTimeout(function () {
        //sessionStorage.setItem("SKSC_MAPLAYER_FIX Markers" + mapSufix, false);
        map.removeLayer(fixes_layer); //at the starting.
    //}, 100);
});

function storeLayers() {
    for (var overlayName in overlayMaps) {
        console.log(overlayName, map.hasLayer(overlayMaps[overlayName]));

        sessionStorage.setItem("SKSC_MAPLAYER_" + overlayName + mapSufix, map.hasLayer(overlayMaps[overlayName]));
    }    
}

function setLayers() {
    for (var overlayName in overlayMaps) {              

        console.log("Layer ", overlayName, StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_" + overlayName + mapSufix)));

        if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_" + overlayName + mapSufix))) {
            map.addLayer(overlayMaps[overlayName]);
            console.log("Layer added " + overlayName);
        }
        else {
            map.removeLayer(overlayMaps[overlayName]);            
            console.log("Layer removed " + overlayName);
        }
    }
}

function layersZoomCheck() {

    return false; //Zoom not affecting elements

    /*if (map.getZoom() < 10) {
        map.removeLayer(airport_layer);
        map.removeLayer(ils_marker);
        map.removeLayer(vor_marker);
        map.removeLayer(route_marker);
        //map.removeLayer(runways_marker);
        //map.removeLayer(fixes_layer);  
    }
    else {
        if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_Airports" + mapSufix))) map.addLayer(airport_layer);
        if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_ILS Markers" + mapSufix))) map.addLayer(ils_marker);
        if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_VOR/DME Markers" + mapSufix))) map.addLayer(vor_marker);
        if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_Route Markers" + mapSufix))) map.addLayer(route_marker);
        //if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_Runway Marker" + mapSufix))) map.addLayer(runways_marker);
        //if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_FIX Markers" + mapSufix))) map.addLayer(fixes_layer);

    }

    if (map.getZoom() < 10) {
        //map.removeLayer(runways_guides);  
        map.removeLayer(runways_marker);
    }
    else {        
        if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_Runway Marker" + mapSufix)))
            map.addLayer(runways_marker);
    }

    //if (map.getZoom() >= 10 && (pointerMode == 2 || (route_ActiveRoute && route_ActiveRoute.length > 0))) {
    //    /*if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_FIX Markers" + mapSufix)))*/
    //    map.addLayer(fixes_layer);
    //}
    //else {
    //    map.removeLayer(fixes_layer);
    //}*/    
}

function restartMap() {
    map.removeLayer(route_marker);
    map.removeLayer(route_layer);
    map.removeLayer(track_layer);

    route_layer = L.layerGroup();
    track_layer = L.layerGroup();
    route_marker = L.layerGroup();

    track_layer.setZIndex(18);
    if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_Track" + mapSufix))) map.addLayer(track_layer);

    route_layer.setZIndex(999);
    if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_SKSC_Route" + mapSufix))) map.addLayer(route_layer);

    route_marker.setZIndex(999);
    if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_Route Markers" + mapSufix))) map.addLayer(route_marker);

    overlayMaps = {
        "Airports": airport_layer,
        "Runways": runways_layer,
        "Runway Guides": runways_guides,
        "Runway Marker": runways_marker,
        "ILS Feathers": ils_layer,
        "ILS Markers": ils_marker,
        "VOR/DME Markers": vor_marker,
        "NDB Markers": ndb_marker,
        "FIX Markers": fixes_layer,
        "Plane": plane_layer,
        "Track": track_layer,
        "Route": route_layer,
        "Route Markers": route_marker,
    };

    controlLayers.remove();
    controlLayers = L.control.layers(baseMaps, overlayMaps).addTo(map);

    layersZoomCheck();

    drawRoute();

    drawRouteNavAids();
}

function initPlane() {
    //console.log("initPlane");

    if (typeof L != "undefined") {
        var LeafIcon = L.Icon.extend({
            options: {
                shadowUrl: '/img/plane_noshadow.png?' + Math.floor(Math.random() * Number.MAX_VALUE),                
                iconSize: [40, 40],
                shadowSize:   [ 50 , 50],
                iconAnchor: [20, 20],
                shadowAnchor: [25, 25],
            }
        });
        
        /*plane_layer.setStyle({
            color: 'white',
            fillColor: 'yellow'
        });*/

        if (plane) map.removeLayer(plane);

        planeIcon = new LeafIcon({ iconUrl: '/img/plane.png?' + Math.floor(Math.random() * Number.MAX_VALUE)   });
        plane = L.marker([planeLat, planeLon], { icon: planeIcon, rotationAngle: planeAngle, forceZIndex: 1000 })/*.bindPopup("")*/.addTo(plane_layer);               

        //plane._shadow.src = "";

        /*plane.on('popupclose', function (e) {
            console.log("popupclose", e);
    
            this._popup.setContent(""); //clear content
        });    
    
        plane.on('click', function (e) {
            console.log("click", e);
    
            var cmd = JSON.stringify(map.getBounds());        
    
            $.ajax({
                url: url_GetAirports,
                type: "POST",
                dataType: "json",
                //traditional: true,
                data: { dato: cmd },
                success: function (data) {
                    console.log("GetAirports", data.length);
    
                    var cnt = "";
                    
                    $.each(data, function (index, element) {
                        cnt += element.Icao + "<br />"
    
                        console.log("element ", element);
                    });
    
                    plane._popup.setContent("<p>" + cnt + "</p>");
                    plane._popup.update();
                },
            });                    
        });*/

        map.setView([planeLat, planeLon], map.getZoom());        

        refreshMapIn(100);       
    }
}

function centerPlane()
{
    if (typeof L != "undefined") {
        if (planeLat && planeLon) {
            //console.log(planeLat, planeLon);

            //map.panTo(new L.LatLng(planeLat, planeLon));    
            //map.setView([planeLat, planeLon], map.getZoom(), { animation: true });

            map.flyTo(new L.LatLng(planeLat, planeLon));

            checkZooms();
        }
    }
}

function refreshMapIn(time) {
    if (typeof L != "undefined") {
        setTimeout(function () {
            map._onResize();
            centerPlane();
            checkZooms();

            //console.log("map refresed");
        }, time);
    }
}

function refreshPlane() {
    if (typeof L != "undefined") {
        var lat = parseFloat(stored_data["position/latitude"]);
        var lon = parseFloat(stored_data["position/longitude"]);
        //var hdg = stored_data["indicators/heading_mag"]
        var hdg = parseFloat(stored_data["indicators/heading"]);
        

        if (lat && lon) {
            if (lat != prevLat && lon != prevLon) {
                movePlane(lat, lon);

                //Moved to movePlane to be sure is moved by distance
                //prevLat = lat;
                //prevLon = lon;
            }

            if (planeInitBearing || hdg && hdg != prevHdg) {       
                planeSetRotationAngleEx(hdg);
            } 
        }    
    }
}

function AngleDifference(angle1, angle2)
{
    var diff = (angle2 - angle1 + 180) % 360 - 180;
    return diff < -180 ? diff + 360 : diff;
}

function planeSetRotationAngleEx(hdg)
{
    var d = AngleDifference(prevHdg, hdg);

    //console.log(d);

    if (!acuh) {
        acuh = hdg;
    }
    else {        
        acuh = acuh + d;
    }

    //console.log("planeSetRotationAngleEx", hdg, prevHdg, d, acuh);    
    prevHdg = hdg;

    if (planeAlwaysNorth) {
        //plane.setRotationAngle(0);

        if (planeInitBearing || Math.abs(d) >= 0) { //0.1
            map.setBearing(-acuh);
        }
    }
    else {
        //map.setBearing(0);

        if (planeInitBearing || Math.abs(d) >= 0) { //0.05
            plane.setRotationAngle(acuh);
        }
    }

    planeInitBearing = false;
}

//This is to fix the rotation map issue
function limitBoundsContains(xLatLng) {
    var bounds = map.getBounds().pad(-0.20);

    var maxLat = Math.max(bounds._northEast.lat, bounds._southWest.lat);
    var minLat = Math.min(bounds._northEast.lat, bounds._southWest.lat);

    var maxLng = Math.max(bounds._northEast.lng, bounds._southWest.lng);
    var minLng = Math.min(bounds._northEast.lng, bounds._southWest.lng);

    return xLatLng.lat >= minLat && xLatLng.lat <= maxLat && xLatLng.lng >= minLng && xLatLng.lng <= maxLng;
}

function limitClientRectContains(xPoint) {
    var bounds = $("#map")[0].getBoundingClientRect();

    var hmin = bounds.height * .15;
    var hmax = bounds.height * .85;

    var wmin = bounds.width * .15;
    var wmax = bounds.width * .85;


    return xPoint.x >= wmin && xPoint.x <= wmax && xPoint.y >= hmin && xPoint.y <= hmax;
}

function movePlane(newLat, newLon)
{
    if (typeof L != "undefined") {
        if (newLat) planeLat = newLat;
        if (newLon) planeLon = newLon;

        if (oldLat == null) oldLat = planeLat;
        if (oldLon == null) oldLon = planeLon;               

        if (newLat && newLon) {
            if (!plane) initPlane();

            var oldLatLng = new L.LatLng(oldLat, oldLon);            
            var newLatLng = new L.LatLng(planeLat, planeLon);

            var distance = L.GeometryUtil.length([oldLatLng, newLatLng]);                
            //console.log("distance ", planeLat, planeLon, distance)

            if (distance <= routeMaxDrawDistance || (distance > routeMaxDrawDistance && (Math.abs(planeLat) > 0.1 || Math.abs(planeLon) > 0.1))) {

                //var isPlaneInRange = limitBoundsContains(newLatLng);

                var isPlaneInRange = limitClientRectContains(map.latLngToContainerPoint(new L.LatLng(planeLat, planeLon)));

                if (followPlane && (planeAlwaysCenter || !isPlaneInRange)) { //!limitBounds.contains(newLatLng)
                    
                    //if (!planeAlwaysCenter && !isPlaneInRange) 
                    smoothPlaneTransitionOFF();

                    //map.setView(newLatLng); //, map.getZoom(), { reset: true }); //Keep alwasy in the center //, map.getZoom(), { animation: true }
                    map.panTo(newLatLng);
                    
                    /*if (!planeAlwaysCenter && !isPlaneInRange) {
                        console.log("here!");
                        resetMapBounds();
                        //centerPlane();
                        //map.panTo(newLatLng);
                        followPlane = true;
                    }*/

                    //if (!planeAlwaysCenter && !isPlaneInRange)
                    smoothPlaneTransitionON();

                    //map.flyTo(newLatLng);
                    //console.log("flyTo/panTo ", planeLat, planeLon);
                }

                plane.setLatLng(newLatLng);

                setMapWindInfo();

                prevLat = planeLat;
                prevLon = planeLon;

            }

            if (distance <= routeMaxDrawDistance) {
                if (distance >= routeMinDrawDistance) {

                    var tracelinePoints = [
                        [oldLat, oldLon],
                        [planeLat, planeLon]
                    ];

                    var polyline = L.polyline(tracelinePoints, {
                        color: 'Crimson', //DarkGreen
                        weight: 4,
                        opacity: 1,
                        smoothFactor: 10,
                        //dashArray: "5 5"
                    }).addTo(track_layer);

                    oldLat = planeLat;
                    oldLon = planeLon;
                }
            }
            else {
                oldLat = planeLat;
                oldLon = planeLon;
            }

            if (dest_polyline) {
                dest_polyline.remove();
            };

            if (route_ActiveRoute && route_ActiveRoute.length > 0) {
                //var curr = parseInt(stored_data["gps/wp_index"]); "gps/wp_index" is sometimes worng
                var curr = route_ActiveRoute.findIndex(x => x.identifier == stored_data["gps/wp_next_id"]);

                if (curr >=0 ) {
                    var tracelinePoints = [
                        [route_ActiveRoute[curr].latitude, route_ActiveRoute[curr].longitude],
                        [planeLat, planeLon]
                    ];

                    dest_polyline = L.polyline(tracelinePoints, {
                        color: 'DeepPink', //DarkGreen
                        weight: 3,
                        opacity: 1,
                        smoothFactor: 10,
                        dashArray: "15 5"
                    }).addTo(route_layer);                       
                };
            }
            else
                if (mapPointActive && planeLat && planeLon && mapPointLat && mapPointLon) {
                    var tracelinePoints = [
                        [mapPointLat, mapPointLon],
                        [planeLat, planeLon]
                    ];

                    dest_polyline = L.polyline(tracelinePoints, {
                        color: 'DeepPink', //DarkGreen
                        weight: 3,
                        opacity: 1,
                        smoothFactor: 10,
                        dashArray: "15 5"
                    }).addTo(route_layer);

                    
                };

            if (elite_target_info == 3) showTargetInfo(elite_target_info);
        }      
    }
}

function getElements()
{
    if (map.getZoom() >= 6) //Dont refresh the entire world
    {
        var cmd = JSON.stringify(map.getBounds());
        //console.log("getElements ", cmd);
        if (map.getZoom() >= 7) {

            if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_Airports" + mapSufix))) {
                $.ajax({
                    url: url_GetAirports,
                    type: "POST",
                    dataType: "json",
                    //traditional: true,
                    data: { dato: cmd },
                    success: function (data) {
                        console.log("GetAirports", data.length);

                        //Airport circle drawing
                        $.each(data, function (index, element) {
                            //var a = L.circle([element.Latitude, element.Longitude], airportRadius).addTo(map);

                            /*var a = new L.Circle([element.Latitude, element.Longitude], airportRadius, {
                                color: 'Coral', //DodgerBlue
                                //fillColor: '#bbf',
                                fillOpacity: 0,
                                opacity: 0.7
                            }).addTo(airport_layer); //airport_layer*/


                            var airpicon = L.icon({
                                iconUrl: '/img/mapicons/airport/airport.png',
                                iconSize: [32, 37],
                                iconAnchor: [16, 37]
                            });

                            var airpmarker = L.marker([element.Latitude, element.Longitude], { icon: airpicon, forceZIndex: 600 }).bindPopup().addTo(airport_layer);

                            //$("#airportPopupTemplate").render(element)

                            airpmarker.on('popupclose', function (e) {
                                //console.log(" airpmarker popupclose", e);
                                airpmarker._popup.setContent(""); //clear content
                            });

                            airpmarker.on('click', function (e) {
                                //console.log(" airpmarker click", element);                        

                                SetPopUpScale();

                                /*if ($("#map-container").width() < _minimap_threshold) {
                                    map.closePopup();
                                    return false;
                                }*/

                                $.ajax({
                                    url: url_GetFullAirportData,
                                    type: "POST",
                                    dataType: "json",
                                    //traditional: true,
                                    data: { id: element.Icao },
                                    success: function (data) {

                                        console.log(" airpmarker url_GetFullAirportData", data);

                                        var dato = $("#airportPopupTemplate").render(data);

                                        //console.log(" airpmarker airportPopupTemplate", dato);

                                        airpmarker._popup.setContent(dato);
                                        airpmarker._popup.update();

                                        data.runways.forEach(function (runway) {
                                            if (!runway_list.includes(runway.Id)) {
                                                checkIfNoILS(runway);
                                                runway_list.push(runway.Id);
                                            }
                                        });

                                        data.ils.forEach(function (ils) {
                                            if (!ils_list.includes(ils.Id)) {
                                                drawILS(ils);
                                                ils_list.push(ils.Id);
                                            }
                                        });                                        

                                        if (pointerMode == 2) {
                                            map.closePopup();
                                            //airpmarker._popup._close();
                                            route_AddAPT(data);
                                        }
                                    },
                                });
                            });
                        });
                    },
                    //error: function (xhr, textStatus, errorThrown) {
                    //    alert('Request Status: ' + xhr.status + '; Status Text: ' + textStatus + '; Error: ' + errorThrown);
                    //}
                });
            }

            if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_Runways" + mapSufix))) {
                $.ajax({
                    url: url_GetRunways,
                    type: "POST",
                    dataType: "json",
                    //traditional: true,
                    data: { dato: cmd },
                    success: function (data) {
                        console.log("GetRunways", data.length);

                        //Runway drawing
                        $.each(data, function (index, element) {
                            //console.log("each Runways", index);

                            var polylinePoints = [
                                [element.LatitudeA, element.LongitudeA],
                                [element.LatitudeB, element.LongitudeB]
                            ];

                            var polyline = L.polyline(polylinePoints, {
                                color: 'blue',
                                weight: 4,
                                opacity: 0.7,
                                smoothFactor: 1,
                                dashArray: "5 5"
                            }).addTo(runways_layer); //runways_layer

                            var runmarker = polyline.bindPopup();

                            //$("#runwayPopupTemplate").render(element)

                            runmarker.on('popupclose', function (e) {
                                //console.log(" runmarkerX popupclose", e);
                                runmarker._popup.setContent(""); //clear content
                            });

                            runmarker.on('click', function (e) {
                                console.log(" runmarkerX click", e);

                                SetPopUpScale();

                                /*if ($("#map-container").width() < _minimap_threshold) {
                                    map.closePopup();
                                    return false;
                                }*/

                                if (e.latlng) _map_last_point = e.latlng;

                                $.ajax({
                                    url: url_GetFullAirportData,
                                    type: "POST",
                                    dataType: "json",
                                    //traditional: true,
                                    data: { id: element.Airport },
                                    success: function (data) {

                                        //var currentIls = jQuery.grep(data.ils, function (a) {
                                        //    return a.Runway == element.Runway;
                                        //});

                                        var currentRunway = jQuery.grep(data.runways, function (a) {
                                            return a.Id == element.Id;
                                        });

                                        //data.currentIls = currentIls[0];
                                        data.currentRunway = currentRunway[0];

                                        //console.log(" runmarkerX url_GetFullAirportData", data);

                                        var dato = $("#runwayPopupTemplate").render(data);

                                        //console.log(" airpmarker airportPopupTemplate", dato);

                                        runmarker._popup.setContent(dato);
                                        runmarker._popup.update();

                                        if (pointerMode == 2) {
                                            console.log(" RUNWAY click", element, data);
                                            map.closePopup();
                                            route_AddRunway(element, data);
                                        }
                                    },
                                });
                            });                            
                        });
                    },
                });
            }           

            if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_VOR/DME Markers" + mapSufix))) {
                $.ajax({
                    url: url_GetVorDme,
                    type: "POST",
                    dataType: "json",
                    //traditional: true,
                    data: { dato: cmd },
                    success: function (data) {
                        console.log("GetVorDme", data.length);

                        //Ils drawing
                        $.each(data, function (index, element) {
                            //var pointA = L.latLng(element.Latitude, element.Longitude);                    

                            var voricon = L.icon({
                                iconUrl: '/img/mapicons/airport/vordme.white.png',
                                iconSize: [32, 37],
                                iconAnchor: [16, 37]
                            });

                            var runmarker = L.marker([element.Latitude, element.Longitude], { icon: voricon, forceZIndex: 550 }).bindPopup($("#vordmePopupTemplate").render(element)).addTo(vor_marker);

                            runmarker.on('click', function (e) {
                                //console.log(" runmarker click", e);

                                SetPopUpScale();

                                /*if ($("#map-container").width() < _minimap_threshold) {
                                    map.closePopup();
                                    return false;
                                }*/

                                if (pointerMode == 2) {
                                    console.log(" VORDME click", element);
                                    map.closePopup();
                                    route_AddVORDME(element);
                                }

                            });
                        });
                    },
                    //error: function (xhr, textStatus, errorThrown) {
                    //    alert('Request Status: ' + xhr.status + '; Status Text: ' + textStatus + '; Error: ' + errorThrown);
                    //}
                });
            }

            //New NDB for 2020
            if (StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_VOR/DME Markers" + mapSufix))) {
                $.ajax({
                    url: url_GetNdb,
                    type: "POST",
                    dataType: "json",
                    //traditional: true,
                    data: { dato: cmd },
                    success: function (data) {
                        console.log("GetNdb", data.length);

                        //Ils drawing
                        $.each(data, function (index, element) {
                            //var pointA = L.latLng(element.Latitude, element.Longitude);                    

                            var voricon = L.icon({
                                iconUrl: '/img/mapicons/airport/ndb.purple.png',
                                iconSize: [32, 37],
                                iconAnchor: [16, 37]
                            });

                            var runmarker = L.marker([element.Latitude, element.Longitude], { icon: voricon, forceZIndex: 550 }).bindPopup($("#NdbPopupTemplate").render(element)).addTo(ndb_marker);

                            runmarker.on('click', function (e) {
                                //console.log(" runmarker click", e);

                                SetPopUpScale();

                                /*if ($("#map-container").width() < _minimap_threshold) {
                                    map.closePopup();
                                    return false;
                                }*/

                                if (pointerMode == 2) {
                                    console.log(" NDB click", element);
                                    map.closePopup();
                                    //route_AddVORDME(element);
                                }

                            });
                        });
                    },
                });
            }

            if (map.getZoom() >= 10 /*&& StringIsBoolean(sessionStorage.getItem("SKSC_MAPLAYER_FIX Markers" + mapSufix))*/) {
                $.ajax({
                    url: url_GetFixes,
                    type: "POST",
                    dataType: "json",
                    //traditional: true,
                    data: { dato: cmd },
                    success: function (data) {
                        console.log("GetFixes", data.length);

                        //Ils drawing
                        $.each(data, function (index, element) {
                            //console.log("GetFixes ", index, element);

                            drawFIX(element, fixes_layer);
                        });
                    },
                    //error: function (xhr, textStatus, errorThrown) {
                    //    alert('Request Status: ' + xhr.status + '; Status Text: ' + textStatus + '; Error: ' + errorThrown);
                    //}
                });
            }
        }
    }
}

function drawFIX(element, in_layer) {
    console.log("drawFIX ",  element);

    var fixicon = L.divIcon({
        iconSize: new L.Point(5, 5),
        html: '<div style ="font-size: 12px;">' + element.Identifier + '</div>',
        className: 'fix-icon'
    });

    var fixmarker = L.marker([element.Latitude, element.Longitude], { icon: fixicon, forceZIndex: 550 }).addTo(in_layer);

    var fixcircle = L.circle([element.Latitude, element.Longitude], 200, { color: 'FireBrick', opacity: 1, fillColor: 'MediumVioletRed', fillOpacity: .5 }).addTo(in_layer);

    fixmarker.on('click', function (e) {

        SetPopUpScale();

        /*if ($("#map-container").width() < _minimap_threshold) {
            map.closePopup();
            return false;
        }*/

        if (pointerMode == 2) {
            console.log(" FIX  click", element);
            map.closePopup();
            route_AddFIXMarker(element);
        }
    });

    fixcircle.on('click', function (e) {

        SetPopUpScale();

        /*if ($("#map-container").width() < _minimap_threshold) {
            map.closePopup();
            return false;
        }*/

        if (pointerMode == 2) {
            console.log(" FIX  click", element);
            map.closePopup();
            route_AddFIXMarker(element);
        }
    });
}
    

function drawILS(element) {

    console.log("drawILS element", element);

    var pointA = L.latLng(element.Latitude, element.Longitude);

    var km = element.Range / 0.62137;

    var oppositeAngle = (element.Bearing + 180) % 360;

    var B = L.GeometryUtil.destination(pointA, oppositeAngle, km * 1000);

    //console.log("Bearing", element.Bearing, oppositeAngle);

    var polylinePoints = [
        [element.Latitude, element.Longitude],
        [B.lat, B.lng]
    ];

    element.ILSPoint = B;

    var polyline = L.polyline(polylinePoints, {
        color: 'tomato', //tomato BurlyWood
        weight: 4,
        opacity: 0.5,
        smoothFactor: 1
    }).addTo(ils_layer); //ils_layer


    var runnum = parseInt(element.Runway.replace(/[^0-9]/g, ''));

    var runicon = L.icon({
        iconUrl: '/img/mapicons/numbers/number_' + runnum + '.png',
        iconSize: [32, 37],
        iconAnchor: [16, 37]
    });

    var runmarker = L.marker([B.lat, B.lng], { icon: runicon, forceZIndex: 550 }).bindPopup().addTo(ils_marker);

    //$("#ilsPopupTemplate").render(element)


    runmarker.on('popupclose', function (e) {
        //console.log(" runmarker popupclose", e);
        runmarker._popup.setContent(""); //clear content
    });

    runmarker.on('click', function (e) {

        SetPopUpScale();

        /*if ($("#map-container").width() < _minimap_threshold) {
            map.closePopup();
            return false;
        }*/

        $.ajax({
            url: url_GetFullAirportData,
            type: "POST",
            dataType: "json",
            //traditional: true,
            data: { id: element.Airport },
            success: function (data) {

                var currentIls = jQuery.grep(data.ils, function (a) {
                    return a.Runway == element.Runway;
                });

                var currentRunway = jQuery.grep(data.runways, function (a) {
                    return a.RunwayA == element.Runway || a.RunwayB == element.Runway;
                });

                data.currentIls = currentIls[0];
                data.currentRunway = currentRunway[0];
                data.element = element;

                //console.log(" airpmarker url_GetFullAirportData", data);                         

                var dato = $("#ilsPopupTemplate").render(data);

                //console.log(" airpmarker airportPopupTemplate", dato);

                runmarker._popup.setContent(dato);
                runmarker._popup.update();

                if (pointerMode == 2) {
                    console.log(" ILS  click", element);
                    map.closePopup();
                    route_AddILSMarker(element);
                }
            },
        });
    });
}


function checkIfNoILS(element) {
    console.log("checkIfNoILS element", element);

    //Normal runway markers
    if (!element.rwyA_hasILS || !element.rwyB_hasILS) {
        var aLatLng = new L.LatLng(element.LatitudeA, element.LongitudeA);
        var bLatLng = new L.LatLng(element.LatitudeB, element.LongitudeB);
        var bearing = L.GeometryUtil.bearing(aLatLng, bLatLng);
        var oppositeAngle = (bearing + 180) % 360;

        var km = 10 / 0.62137; //was 18, 10 milles is ok

        if (!element.rwyA_hasILS) {
            var elementA = Object.assign({}, element); 

            var A = L.GeometryUtil.destination(aLatLng, oppositeAngle, km * 1000);

            var polylinePoints = [aLatLng, A];

            var polyline = L.polyline(polylinePoints, {
                color: 'orange', //tomato BurlyWood
                weight: 4,
                opacity: 0.5,
                smoothFactor: 1
            }).addTo(runways_guides);

            var runnum = parseInt(elementA.RunwayA.replace(/[^0-9]/g, ''));
            elementA.rwy_Id = "RWY " + elementA.RunwayA;

            var runicon = L.icon({
                iconUrl: '/img/mapicons/numbers_rw/number_' + runnum + '.png',
                iconSize: [32, 37],
                iconAnchor: [16, 37]
            });

            elementA.ILSPoint = A;

            var runmarkerA = L.marker([A.lat, A.lng], { icon: runicon, forceZIndex: 550 }).bindPopup().addTo(runways_marker);

            runmarkerA.on('popupclose', function (e) {
                //console.log(" runmarkerX popupclose", e);
                runmarkerA._popup.setContent(""); //clear content
            });

            runmarkerA.on('click', function (e) {
                //console.log(" runmarkerX click", e);

                SetPopUpScale();

                /*if ($("#map-container").width() < _minimap_threshold) {
                    map.closePopup();
                    return false;
                }*/

                $.ajax({
                    url: url_GetFullAirportData,
                    type: "POST",
                    dataType: "json",
                    //traditional: true,
                    data: { id: elementA.Airport },
                    success: function (data) {

                        //var currentIls = jQuery.grep(data.ils, function (a) {
                        //    return a.Runway == elementA.Runway;
                        //});

                        var currentRunway = jQuery.grep(data.runways, function (a) {
                            return a.Id == elementA.Id;
                        });

                        //data.currentIls = currentIls[0];
                        data.currentRunway = currentRunway[0];
                        data.element = elementA;

                        //console.log(" runmarkerX url_GetFullAirportData", data);

                        var dato = $("#runwayPopupTemplate").render(data);

                        //console.log(" airpmarker airportPopupTemplate", dato);

                        runmarkerA._popup.setContent(dato);
                        runmarkerA._popup.update();

                        if (pointerMode == 2) {
                            console.log(" RWA  click", elementA);
                            map.closePopup();
                            route_AddILSMarker(elementA);
                        }
                    },
                });
            });
        }

        if (!element.rwyB_hasILS) {
            var B = L.GeometryUtil.destination(bLatLng, bearing, km * 1000);
            var elementB = Object.assign({}, element); 

            var polylinePoints = [bLatLng, B];

            var polyline = L.polyline(polylinePoints, {
                color: 'orange', //tomato BurlyWood
                weight: 4,
                opacity: 0.5,
                smoothFactor: 1
            }).addTo(runways_guides);

            var runnum = parseInt(elementB.RunwayB.replace(/[^0-9]/g, ''));
            elementB.rwy_Id = "RWY " + elementB.RunwayB;

            var runicon = L.icon({
                iconUrl: '/img/mapicons/numbers_rw/number_' + runnum + '.png',
                iconSize: [32, 37],
                iconAnchor: [16, 37]
            });

            elementB.ILSPoint = B;

            var runmarkerB = L.marker([B.lat, B.lng], { icon: runicon, forceZIndex: 550 }).bindPopup().addTo(runways_marker);

            runmarkerB.on('popupclose', function (e) {
                //console.log(" runmarkerX popupclose", e);
                runmarkerA._popup.setContent(""); //clear content
            });

            runmarkerB.on('click', function (e) {
                //console.log(" runmarkerX click", e);

                SetPopUpScale();

                /*if ($("#map-container").width() < _minimap_threshold) {
                    map.closePopup();
                    return false;
                }*/

                $.ajax({
                    url: url_GetFullAirportData,
                    type: "POST",
                    dataType: "json",
                    //traditional: true,
                    data: { id: elementB.Airport },
                    success: function (data) {

                        //var currentIls = jQuery.grep(data.ils, function (a) {
                        //    return a.Runway == elementB.Runway;
                        //});

                        var currentRunway = jQuery.grep(data.runways, function (a) {
                            return a.Id == elementB.Id;
                        });

                        //data.currentIls = currentIls[0];
                        data.currentRunway = currentRunway[0];
                        data.element = elementB;

                        //console.log(" runmarkerX url_GetFullAirportData", data);

                        var dato = $("#runwayPopupTemplate").render(data);

                        //console.log(" airpmarker airportPopupTemplate", dato);

                        runmarkerB._popup.setContent(dato);
                        runmarkerB._popup.update();

                        if (pointerMode == 2) {
                            console.log(" RWB  click", data);
                            map.closePopup();
                            route_AddILSMarker(elementB);
                        }
                    },
                });
            });
        }
    }
}

function drawRouteNavAids() {
    if (route_ActiveRoute && route_ActiveRoute.length > 0) {
        for (var index = 0; index < route_ActiveRoute.length; index++) {

            switch (route_ActiveRoute[index].type) {
                case 1:
                    if (route_ActiveRoute[index].metadata) {
                        route_ActiveRoute[index].metadata.runways.forEach(function (runway) {
                            if (!runway_list.includes(runway.Id)) {
                                checkIfNoILS(runway);
                                runway_list.push(runway.Id);
                            }
                        });

                        route_ActiveRoute[index].metadata.ils.forEach(function (ils) {
                            if (!ils_list.includes(ils.Id)) {
                                drawILS(ils);
                                ils_list.push(ils.Id);
                            }
                        });
                    }

                    break;
                case 11:
                    $.ajax({
                        url: '/Map/GetFixByID/',
                        type: "POST",
                        dataType: "json",
                        //traditional: true,
                        data: { dato: JSON.stringify(route_ActiveRoute[index]) },
                        success: function (data) {
                            console.log("GetFixByID", data);

                            //Ils drawing
                            $.each(data, function (index, element) {
                                //console.log("GetFixes ", index, element);

                                drawFIX(element, route_layer);
                            });
                        },
                    });


                    //drawFIX(route_ActiveRoute[index].metadata, route_layer);
                    break;
            }
        }
    }      
}

function drawRoute() {
    if (route_ActiveRoute && route_ActiveRoute.length > 0) {
        var polylinePoints = [];

        $.each(route_ActiveRoute, function (index, element) {
            //console.log("each WP", element);
            polylinePoints.push([element.latitude, element.longitude]);

            var wpicon = L.icon({
                iconUrl: '/img/mapicons/numbers_wp/number_' + (index + 1) + '.png',
                iconSize: [32, 37],
                iconAnchor: [16, 37]
            });

            L.circle([element.latitude, element.longitude], 200, { color: 'black', opacity: 1, fillColor: 'black', fillOpacity: .4 }).bindPopup().addTo(route_layer);
            //dodgerblue

            var wpmarker = L.marker([element.latitude, element.longitude], { icon: wpicon, forceZIndex: 750 }).bindPopup().addTo(route_marker); //$("#waypointPopupTemplate").render(element)

            wpmarker.on('popupclose', function (e) {
                //console.log(" runmarker popupclose", e);
                wpmarker._popup.setContent(""); //clear content
            });

            //This will not work since we dont have getWaypointData in SkyElite so far
            wpmarker.on('click', function (e) {
                //console.log(" runmarker click", e);

                SetPopUpScale();

                /*if ($("#map-container").width() < _minimap_threshold) {
                    map.closePopup();
                    return false;
                }*/

                if (typeof route_getWaypointData === "function") {
                    var elemento = route_getWaypointData(element.identifier);

                    var dato = $("#waypointPopupTemplate").render(elemento);
                    wpmarker._popup.setContent(dato);
                    wpmarker._popup.update();
                }
            });

        });

        //console.log("polylinePoints", polylinePoints);

        var polyline = L.polyline(polylinePoints, {
            color: 'black',
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1,
            //dashArray: "5 5"
        }).addTo(route_layer);
    }
}

function boundaryGet(id)
{
    $.ajax({
        url: url_GetBoundary + "/"+ id,
        type: "POST",
        dataType: "json",
        //traditional: true,
        //data: { dato: cmd },
        success: function (data) {
            console.log("boundaryGet", data.length);
            if (data.length > 0) {
                var polylinePoints = [];

                $.each(data, function (index, element) {
                    //console.log(element.Item1, element.Item2);

                    var point = L.latLng(element.Item1, element.Item2);
                    polylinePoints.push(point);                    
                });

                //Close the area to the first point.
                polylinePoints.push(L.latLng(data[0].Item1, data[0].Item2));

                var polyline = L.polyline(polylinePoints);
                last_polyline = polyline;

                /*var polyline = L.polyline(polylinePoints, {
                    color: 'red', //tomato BurlyWood
                    weight: 4,
                    opacity: 0.5,
                    smoothFactor: 1
                }).addTo(map); //map_layer*/

                //var z = map.getZoom();// + 1;
                //map.setZoom(0);

                map.fitBounds(polyline.getBounds());                

                map._onResize();
                map.setZoom(16);

                map.fitBounds(polyline.getBounds());   

                //checkZooms(); 
                

                //console.log("fitBounds", polyline.getBounds());
                //console.log("Zoom ", map.getZoom().toString());

               
            }
        },
        //error: function (xhr, textStatus, errorThrown) {
        //    alert('Request Status: ' + xhr.status + '; Status Text: ' + textStatus + '; Error: ' + errorThrown);
        //}
    });
}

function checkZooms() {
    return false; //Disabled so far

    if (mapMode == 0) {
        var minZoom = loadedMaps[selectedMap].minZoom;
        var maxZoom = loadedMaps[selectedMap].maxZoom;

        console.log("checkZooms ", minZoom, maxZoom, map.getZoom());

        if (minZoom && map.getZoom() < minZoom) {
            map.setZoom(minZoom);

            console.log("checkZooms min ", minZoom);
        };

        if (maxZoom && map.getZoom() > maxZoom) {
            map.setZoom(maxZoom);

            console.log("checkZooms max ", maxZoom);
        };
    }
}

//function compass() {
//    console.log("compass");

//    var LeafIcon = L.Icon.extend({
//        options: {
//            //shadowUrl: 'leaf-shadow.png',
//            iconSize: [100, 100],
//            //shadowSize:   [50, 64],
//            //iconAnchor: [22, 94],
//            //shadowAnchor: [4, 62],
//            //popupAnchor: [-3, -76]
//        }
//    });


//    planeIcon = new LeafIcon({ iconUrl: '/img/compass.png' });
//    plane = L.marker([39.49635201, -0.50011091], { icon: planeIcon, rotationAngle: planeAngle }).bindPopup("I am a plane leaf.").addTo(map);
//}

var shownPopup;

function mapShowMessage(message, time = 3000) {
    shownPopup = L.popup({
        closeButton: false,
        autoClose: false
    })
        .setLatLng(map.getCenter())
        .setContent('<p>' + message + '</p>')
        .openOn(map);

    setTimeout(function () {
        map.closePopup(); //Closes all
        //shownPopup._close(); //Closes this
    }, time);
}

jQuery.fn.rotate = function (degrees) {
    $(this).css({
        '-webkit-transform': 'rotate(' + degrees + 'deg)',
        '-moz-transform': 'rotate(' + degrees + 'deg)',
        '-ms-transform': 'rotate(' + degrees + 'deg)',
        'transform': 'rotate(' + degrees + 'deg)'
    });
    return $(this);
};

function SetPopUpScale() {
    switch (true) {
        case $("#map-container").width() < 250:
            $(".leaflet-popup-content-wrapper").css("transform", "scale(.5)");
            break;

        case $("#map-container").width() < 400:
            $(".leaflet-popup-content-wrapper").css("transform", "scale(.7)");
            break;

        default:
            $(".leaflet-popup-content-wrapper").css("transform", "");
            break;
    }    
}

//Multi-player support
//------------------------------------------------------------------------------------------
var stored_multiplayers = {};

function refreshMultiplayerPlanes(removeall) {
    if (planeLat && planeLon) {
        if (removeall) {
            for (var player in stored_multiplayers) {
                var _playerId = stored_multiplayers[player].playerId;
                map.removeLayer(stored_multiplayers[_playerId].plane);
                delete stored_multiplayers[_playerId];
            }
        }

        $.ajax({
            url: '/Data/GetMultiplayerData',
            type: "POST",
            dataType: "json",
            //data: { dato: cmd },
            success: function (data) {
                //console.log("refreshMultiplayerPlanes ", data.length, data);

                if (data.length && data.length > 0) {
                    //Update player data
                    $.each(data, function (index, element) {
                        if (element.playerId) {
                            var planeLatLng = new L.LatLng(planeLat, planeLon);
                            var elementLatLng = new L.LatLng(element.latitude, element.longitude);

                            if (stored_multiplayers[element.playerId]) {
                                //Player ID exist, update it
                                var dato = stored_multiplayers[element.playerId];

                                dato = update(dato, element);

                                var newLatLng = new L.LatLng(element.latitude, element.longitude);
                                dato.plane.setLatLng(newLatLng);
                                //dato.plane.setRotationAngle(element.heading);

                                playerSetRotationAngleEx(dato);

                                dato.bearing = route_getWaypointHeading(element.latitude, element.longitude);
                                dato.distance = L.GeometryUtil.length([planeLatLng, elementLatLng]) * 0.000539957;
                                dato.alt_diff = Math.round(parseFloat(stored_data["indicators/altitude"]) - element.altitude);
                                dato.spd_diff = Math.round(parseFloat(stored_data["indicators/airspeed"]) - element.airspeed);

                                //Refresh the template
                                if (dato.plane && dato.plane._popup && dato.plane._popup.isOpen()) {
                                    var content = $("#multiplayerPlaneTemplate").render(dato);
                                    dato.plane._popup.setContent(content);
                                    dato.plane._popup.update();

                                    SetPopUpScale();
                                }

                                stored_multiplayers[element.playerId] = dato;
                            }
                            else {
                                //Player ID is new create plane
                                if (typeof L != "undefined") {
                                    element.bearing = route_getWaypointHeading(element.latitude, element.longitude);
                                    element.distance = L.GeometryUtil.length([planeLatLng, elementLatLng]) * 0.000539957;
                                    element.alt_diff = Math.round(parseFloat(stored_data["indicators/altitude"]) - element.altitude);
                                    element.spd_diff = Math.round(parseFloat(stored_data["indicators/airspeed"]) - element.airspeed);

                                    var planeIconM = new L.divIcon({
                                        iconSize: [40, 40],
                                        //iconAnchor: [20, 20], //DONT USE ANCHOR OR NORTH MAP ORIENTATION WILL NOT WORK, INSTEAD THERE IS A TICK BELOW CENTER CENTER WITH MINIMUM INITIAL ROTATION ANGLE, THEN UPDATE TO THE ANGLE
                                        html: '<img  src="/img/plane.png" width="40" /><span>' + element.playerId + '</span>',
                                        className: 'multiplayer_icon'
                                    })

                                    /*var LeafIconM = L.Icon.extend({
                                        options: {
                                            shadowUrl: '/img/plane_noshadow.png?' + Math.floor(Math.random() * Number.MAX_VALUE),
                                            iconSize: [40, 40],
                                            shadowSize: [50, 50],
                                            iconAnchor: [20, 20],
                                            shadowAnchor: [25, 25],
                                        }
                                    });                                
    
                                    var planeIconM = new LeafIconM({ iconUrl: '/img/plane.png?' + Math.floor(Math.random() * Number.MAX_VALUE) });*/

                                    if (planeAlwaysNorth) element.heading = element.heading - prevHdg;

                                    element.plane = L.marker([element.latitude, element.longitude], { icon: planeIconM, rotationOrigin: "center center", rotationAngle: 0.1, forceZIndex: 1000 }).bindPopup().addTo(plane_layer);

                                    element.plane.setRotationAngle(element.heading);

                                    element.plane.on('popupclose', function (e) {
                                        //console.log(" runmarker popupclose", e);
                                        element.plane._popup.setContent(""); //clear content
                                    });

                                    //This will not work since we dont have getWaypointData in SkyElite so far
                                    element.plane.on('click', function (e) {
                                        //console.log(" runmarker click", e);

                                        var dato = $("#multiplayerPlaneTemplate").render(element);
                                        element.plane._popup.setContent(dato);
                                        element.plane._popup.update();

                                        SetPopUpScale();
                                    });

                                    stored_multiplayers[element.playerId] = element;
                                }
                            }
                        }
                    });
                }

                //Check if player is still there or remove it.
                for (var player in stored_multiplayers) {
                    var _playerId = stored_multiplayers[player].playerId;

                    var idx = data.findIndex(x => x.playerId == _playerId);
                    if (idx < 0) {
                        map.removeLayer(stored_multiplayers[_playerId].plane);

                        delete stored_multiplayers[_playerId];
                    }
                }
            },
            //error: function (xhr, textStatus, errorThrown) {
            //    alert('Request Status: ' + xhr.status + '; Status Text: ' + textStatus + '; Error: ' + errorThrown);
            //}
        });
    }
}

function playerSetRotationAngleEx(element) {
    var nd = 0;

    //Subtract main plane heading from the player heading if in north position
    if (planeAlwaysNorth) { nd = prevHdg };


    if (!element.acuh) {
        element.acuh = element.heading - nd;        
    }
    else {
        var d = AngleDifference(element.prevHdg, (element.heading - nd));
        element.acuh = element.acuh + d;
    }    

    element.prevHdg = (element.heading - nd);
    
    element.plane.setRotationAngle(element.acuh);
}

function update(obj/*, …*/) {
    for (var i = 1; i < arguments.length; i++) {
        for (var prop in arguments[i]) {
            var val = arguments[i][prop];
            if (typeof val == "object") // this also applies to arrays or null!
                update(obj[prop], val);
            else
                obj[prop] = val;
        }
    }
    return obj;
}

function setDefaultMap() {
    var zoom = zoon_on_air || map.getZoom();

    var data = { value: loadedMaps[selectedMap].name };
    basemap_valueChanged(data);
    map.setZoom(zoom);
    centerPlane();
    followPlane = true;
    landed_map_active = false;
}

function setLandedMap() {
    zoon_on_air = map.getZoom(); //Store current zoom to recover later.

    var data = { value: loadedMaps[0].name };
    basemap_valueChanged(data, true); //Dont save settings
    map.setZoom(zoon_on_ground);
    centerPlane();
    followPlane = true;
    landed_map_active = true;
}

function toggleLandeddMap() {
    if (!landed_map_active) {
        setLandedMap();
    }
    else {
        setDefaultMap();
    }
}

//------------------------------------------------------------------------------------------

/*var plane2;

function createTestPlane(origin) {
    var LeafIcon = L.Icon.extend({
        options: {
            //shadowUrl: '/img/plane_noshadow.png?' + Math.floor(Math.random() * Number.MAX_VALUE),
            //iconSize: [40, 40],
            //shadowSize: [50, 50],
            //iconAnchor: [20, 20],
            //shadowAnchor: [25, 25],
        }
    });

    var planeIcon2 = new LeafIcon({ iconUrl: '/img/plane.png?' + Math.floor(Math.random() * Number.MAX_VALUE) });

    plane2 = L.marker([39.56641632630244, 2.751330817536071], { icon: planeIcon2, rotationOrigin: origin, rotationAngle: 0, forceZIndex: 1000 }).addTo(plane_layer); 
}

function removeTestPlane() {
    map.removeLayer(plane2);
}*/