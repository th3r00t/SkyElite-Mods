var _last_active_waypoint = -1;
var _route_loading = false;
var _calculation_time = 3000;
var _last_fpl_name = "";
var _route_fix_list = [];
var _route_FMSChange = -1;

var mapPointActive = false;
var mapPointLat;
var mapPointLon;
var mapPointInfo;

//Keeps calculating route metadata every 2 sec
$(window).on('load', function () {
    //if (isMFD)
    setTimeout("route_CalculateRouteMetadata()", _calculation_time);    
       

    /*$('#fpl_name_keyboard').keyboard({
        layout: 'qwerty',
        css: {
            buttonAction: 'ui-state-active'
        },
        stayOpen: false,
        usePreview: true,
        accepted: function (e, keyboard, el) {
            console.log("fpl_name_keyboard accepted");
            //$('.ui-keyboard').attr('style', 'width: 40vw !important; left: 30vw !important;');

            _last_fpl_name = $('#fpl_name_keyboard').val();

            $.ajax({
                url: '/Fpl/SaveFPLTo/',
                data: { id: _last_fpl_name, route_ActiveRoute_str: JSON.stringify(route_ActiveRoute) },
                type: "POST",
                dataType: "json",
                success: function (data) {
                    console.log("route_SaveFPLTo", data);

                    $.get('/Fpl/Scan4Fpl/0', function (data) {
                        $("#fplTabs").dxTabPanel("instance").option("selectedIndex", 1);
                        $("#FplGrid").dxDataGrid("instance").refresh()

                        Swal.fire({
                            title: `FMS file saved as ${_last_fpl_name}`,                            
                        })
                    });
                },
            });
        },
        canceled: function (e, keyboard, el) {        
            console.log("fpl_name_keyboard canceled");
            //$('.ui-keyboard').attr('style', 'width: 40vw !important; left: 30vw !important;');

            Swal.fire({
                title: "Save FPL canceled!",
            })
        },
        position: {
            of: $(document),
            my: 'center bottom',
            at: 'center bottom'
        },
        visible: function (e, keyboard, el) {
            //$('.ui-keyboard').attr('style', 'width: 90vw !important; left: 5vw !important;');
            keyboard.$preview[0].select();
        }
    });
    //// activate the typing extension
    //.addTyping({
    //    showTyping: true,
    //    delay: 50
    //});*/
})


function routeSetAlt(action, key) {
    var data;
    if (key) data = route_getWaypointData(key); else data = getActiveWaypointData();

    if (data) {
        console.log("routeSetAlt", data);

        sendFunction("autopilot/altitude_selected", "set", data.altitude);  

        if (action == 3) sendFunction("autopilot/vs", "toggle");
    }
    else {
        Swal.fire("Select waypoint first!");
    }
}


function routeSetHdg(key) {
    var data;
    if (key) data = route_getWaypointData(key); else data = getActiveWaypointData();

    if (data) {
        var heading = route_getWaypointHeading(data.latitude, data.longitude);

        sendFunction("autopilot/heading_selected", "set", heading);  
    }
    else {
        Swal.fire("Select waypoint first!");
    }
}

function routeSetCrs(action, key) {
    var data;
    if (key) data = route_getWaypointData(key); else data = getActiveWaypointData();

    if (data) {
        var heading = route_getWaypointHeading(data.latitude, data.longitude);

        sendFunction("indicators/obs", "set", heading);  
    }
    else {
        Swal.fire("Select waypoint first!");
    }
}

function routeShowAPT(action, key) {
    var data;
    if (key) data = route_getWaypointData(key); else data = getActiveWaypointData();

    if (data) {        
        showAirportFormEX(data.identifier);
    }
    else {
        Swal.fire("Select waypoint first!");
    }
}



/*function route_FMSChange() {
    _route_FMSChange = parseInt(stored_data["Aviator4FWL/FMS/Interface/FMSChanged"]) + 1;

    sendXPSetValue("Aviator4FWL/FMS/Interface/FMSChanged", _route_FMSChange);
}

//Loads FMS file from output after confirmation
function loadFPL(id, mode, name) {
    console.log("loadFPL", id, mode, name);

    var t = mode == 1 ? "start" : "activate";

    Swal.fire({
        title: 'Are you sure?',
        text: "You want to " + t + " route " + name + "?",
        type: 'question',
        showCancelButton: true,
    }).then((result) => {
        if (result.value) {
            _route_loading = true;


            $("#fplTabs").dxTabPanel("instance").option("selectedIndex", 0);
            getLoadPanelInstance().show();

            if ($("#FplGrid").dxDataGrid("instance").option("focusedRowIndex") >= 0) {
                _last_fpl_name = $("#FplGrid").dxDataGrid("instance").getDataSource().items()[$("#FplGrid").dxDataGrid("instance").option("focusedRowIndex")].Filename.split('.').slice(0, -1).join('.');
            }

            route_FullClear();
             
            $.get('/Fpl/ActivateFPL/' + id + " ? mode =" + mode, function (data) {
                route_LoadRoute();                
            });
        }
    })
}

//Loads FMC generated FMS file after confirmation
function loadFPLfromFMC(id, mode) {
    console.log("setFPLfromFMC", id, mode);

    Swal.fire({
        title: 'Are you sure?',
        text: "You want to retrieve FPL from the AIRCRAF FMC/G1000/...?",
        type: 'question',
        showCancelButton: true,
    }).then((result) => {
        if (result.value) {
            _route_loading = true;


            $("#fplTabs").dxTabPanel("instance").option("selectedIndex", 0);
            getLoadPanelInstance().show();

            route_LocalClear();

            $.get('/Fpl/GetFPLfromFMC/0', function (data) {                       
                route_FMSChange();
                route_DrawRoute();
            });
        }
    })    
}


function saveFPLas() {
    if (!_last_fpl_name || _last_fpl_name == "") _last_fpl_name = routeGetFilename();

    $('#fpl_name_keyboard').val(_last_fpl_name);
    
    $('#fpl_name_keyboard').getkeyboard().reveal();

 
    /*Swal.fire({
        title: 'Save current FPL as:',
        input: 'text',
        inputValue: _last_fpl_name,
        inputAttributes: {
            autocapitalize: 'off'
        },        
        onRender: (toast) => {
            console.log("onRender");
            $('.ui-keyboard').attr('style', 'width: 90vw !important; left: 5vw !important;');
        },
        onOpen: (toast) => {
            console.log("onOpen");
            $('.ui-keyboard').attr('style', 'width: 90vw !important; left: 5vw !important;');
        },
        onClose: (toast) => {
            console.log("onOpen");
            $('.ui-keyboard').attr('style', 'width: 40vw !important; left: 30vw !important;');
        },
        showCancelButton: true,
        confirmButtonText: 'Save',
        showLoaderOnConfirm: true,
        position: 'top',
        preConfirm: (login) => {

        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.value) {
            $.ajax({
                url: '/Fpl/SaveFPLTo/',
                data: { id: `${result.value}`, route_ActiveRoute_str: JSON.stringify(route_ActiveRoute) },
                type: "POST",
                dataType: "json",
                success: function (data) {
                    console.log("route_SaveFPLTo", data);

                    _last_fpl_name = `${result.value}`;

                    $.get('/Fpl/Scan4Fpl/0', function (data) {
                        $("#fplTabs").dxTabPanel("instance").option("selectedIndex", 1);
                        $("#FplGrid").dxDataGrid("instance").refresh()

                        Swal.fire({
                            title: `FMS file saved as ${result.value}`,
                            //imageUrl: result.value.avatar_url
                        })
                    });
                },
            });
        }
    });/            
};*/

//Sends all waypoints to the FMC after confirmation
/*function sendFPLtoFMC(id, mode) {
    console.log("setFPLfromFMC", id, mode);

    Swal.fire({
        title: 'Are you sure?',
        text: "You want to SEND this FPL to the AIRCRAF FMC/G1000/...?",
        type: 'question',
        showCancelButton: true,
    }).then((result) => {
        if (result.value) {
            route_sendWaypointsToFMC();

            $.ajax({
                url: '/Fpl/SaveActiveRoute/',
                data: { route_ActiveRoute_str: JSON.stringify(route_ActiveRoute) },
                type: "POST",
                dataType: "json",
                success: function (data) {
                    console.log("SaveActiveRoute", data);  

                    route_FMSChange();
                },
            });
        }
    })
}*/

//Gets all waypoints from current route.fms
function route_GetRouteWaypoints(do_Callback) {
    console.log("GetRouteWaypoints > ", do_Callback);

    $.ajax({
        url: url_GetRouteWaypoints,
        type: "GET",
        dataType: "json",
        success: function (data) {
            console.log("GetRouteWaypoints", data);

            if (data) {
                route_ActiveRoute = data;
                route_CalculateRouteLegs();
            }
            else {
                route_ActiveRoute = [];
            }
            
            if (typeof do_Callback === "function") {
                do_Callback(data);
            }            
        },
    });
}

//Send all data to the FMC
function route_getIdentFilter() {
    var idents = [];

    if (route_ActiveRoute && route_ActiveRoute.length > 0) {

        $.each(route_ActiveRoute, function (index, element) {
            idents.push(element.identifier);
        });
    }

    return idents;
}

//Get currentwaypoints and fully activates route sending to FMC too
/*function route_LoadRoute() {
    route_GetRouteWaypoints(function (data) {
        route_ActivateRoute();
    });
}*/

//Get currentwaypoints and redraws map and table only !!NO FMC update
function route_DrawRoute() {    
    route_GetRouteWaypoints(function (data) {
        route_BuildWaypointTable();

        console.log("restartMap @ route_DrawRoute");
        restartMap();

        setTimeout(function () {
            //map.setZoom(zoomInitial - 1);
            centerPlane();
            map.setZoom(zoomInitial);
        }, 1000);

        setFocusedRouteRow();

        _route_loading = false;
    });    
}

//OLDONE delete soon
/*function route_LoadRoute(onlyDraw) {
    $.ajax({
        url: url_GetRouteWaypoints,
        type: "GET",
        dataType: "json",
        success: function (data) {
            console.log("GetRouteWaypoints", data);

            if (data) {
                route_ActiveRoute = data;
                route_CalculateRouteLegs();

                if (onlyDraw) {
                    route_BuildWaypointTable();
                    restartMap();
                    drawRoute();
                    setFocusedRouteRow();

                    getLoadPanelInstance().hide();
                }
                else {
                    route_ActivateRoute();
                }
            }
        },
    });
}*/

//Fully clears route even in FMC after confirmation
/*function route_ClearRoute() {    
    console.log("route_ClearRoute");

    Swal.fire({
        title: 'Are you sure?',
        text: "You want to CLEAR active route?",
        type: 'question',
        showCancelButton: true,
    }).then((result) => {
        if (result.value) {                                  
            $.get('/Fpl/ClearRoute/0', function (data) {
                route_FullClear();                                
                $("#fplTabs").dxTabPanel("instance").option("selectedIndex", 0);
            });
        }
    }) 
}*/

//Re-scan Output FMS plans for new files
/*function route_Scan4Fpl() {
    console.log("route_Scan4Fpl");

    Swal.fire({
        title: 'Are you sure?',
        text: "You want to Re-scan for new FMS files?",
        type: 'question',
        showCancelButton: true,
    }).then((result) => {
        if (result.value) {
            $.get('/Fpl/Scan4Fpl/0', function (data) {
                $("#fplTabs").dxTabPanel("instance").option("selectedIndex", 1);
                $("#FplGrid").dxDataGrid("instance").refresh()
            });
        }
    }) 
}

//Wait for some time... this blocks script but is ok
function route_sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

//Send entry ID to FWL
/*function route_SendEntryID(entryId) {
    for (var i = 0; i < entryId.length; i++) {
        sendXPSetValue("Aviator4FWL/FMS/Interface/EntryId[" + i + "]", parseFloat(entryId.charCodeAt(i)));
    }

    if (entryId.length < 10) {
        for (var i = entryId.length; i < 10; i++) {
            sendXPSetValue("Aviator4FWL/FMS/Interface/EntryId[" + i + "]", 32);
        }
    }
}

//Send all data to the FMC
function route_sendWaypointsToFMC() { 
    if (route_ActiveRoute && route_ActiveRoute.length > 0) {

        sendXPCommand("Aviator4FWL/FMS/clearAllFmsEntries");

        route_sleep(2000);

        $.each(route_ActiveRoute, function (index, element) {
            console.log("route_sendWaypointsToFMC ", index, element);

            sendXPSetValue("Aviator4FWL/FMS/Interface/EntryIdx", index);

            if (element.type != 28) {
                route_SendEntryID(element.identifier);
            }
            else {
                sendXPSetValue("Aviator4FWL/FMS/Interface/EntryLat", element.latitude);
                sendXPSetValue("Aviator4FWL/FMS/Interface/EntryLon", element.longitude);
            }
            
            switch (element.type) {
                case 1: sendXPSetValue("Aviator4FWL/FMS/Interface/EntryTyp", 1); break;
                case 2: sendXPSetValue("Aviator4FWL/FMS/Interface/EntryTyp", 2); break;
                case 3: sendXPSetValue("Aviator4FWL/FMS/Interface/EntryTyp", 4); break;
                case 12: sendXPSetValue("Aviator4FWL/FMS/Interface/EntryTyp", 1024); break;
                case 13: sendXPSetValue("Aviator4FWL/FMS/Interface/EntryTyp", 1024); break;
                case 11: sendXPSetValue("Aviator4FWL/FMS/Interface/EntryTyp", 512); break;
                case 28: sendXPSetValue("Aviator4FWL/FMS/Interface/EntryTyp", 2048); break;
                default: sendXPSetValue("Aviator4FWL/FMS/Interface/EntryTyp", 0); break;
            }

            sendXPSetValue("Aviator4FWL/FMS/Interface/EntryAlt", element.altitude);

            //So far there is this wait... is not the best system but until I know what to do
            route_sleep(100); //Could produce problems for large FPL during this long waut.

            switch (element.type) {
                case 28:
                    sendXPCommand("Aviator4FWL/FMS/AddFmsEntryByLatLon");
                    break;

                default:
                    sendXPCommand("Aviator4FWL/FMS/AddFmsEntryByID");
                    break;
            }

            console.log("route_sendWaypointsToFMC end ", index);            
        });                     
    }
}

//Fully activates route sending to FMC
function route_ActivateRoute() {
    if (route_ActiveRoute && route_ActiveRoute.length > 0) {

        route_sendWaypointsToFMC();

        route_BuildWaypointTable();

        _route_loading = false;

        getLoadPanelInstance().hide();

        route_FMSChange();

        restartMap();
        drawRoute();
    }
}

//Calls to creating DIRECTO route in FMC after confirmation
function route_DirectToId(icao) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You want to go DIRECT TO: " + icao,
        type: 'question',
        showCancelButton: true,
    }).then((result) => {
        if (result.value) {
            $.ajax({
                url: url_GetFullAirportData,
                type: "POST",
                dataType: "json",
                //traditional: true,
                data: { id: icao }, //last_selected_airport
                success: function (data) {
                    console.log("data", data);
                    route_DirectTo(data.airport);
                },
            });
        }
    })  
};

//Creates directo route into the FMC 
function route_DirectTo(airportData) {
    _route_loading = true;
    getLoadPanelInstance().show();

    route_FullClear();

    route_sleep(2000);

    sendXPCommand("Aviator4FWL/FMS/AddFmsThisAirport");
    route_sleep(100);

    sendXPSetValue("Aviator4FWL/FMS/Interface/EntryIdx", 1);
    route_SendEntryID(airportData.Icao);
    sendXPSetValue("Aviator4FWL/FMS/Interface/EntryLat", airportData.Latitude);
    sendXPSetValue("Aviator4FWL/FMS/Interface/EntryLon", airportData.Longitude);
    sendXPSetValue("Aviator4FWL/FMS/Interface/EntryTyp", 1);
    sendXPSetValue("Aviator4FWL/FMS/Interface/EntryAlt", airportData.Elevation);
    route_sleep(100);
    sendXPCommand("Aviator4FWL/FMS/AddFmsEntryByID");

    route_sleep(1000);
  
    $.get('/Fpl/GetFPLfromFMC/0', function (data) {
        route_DrawRoute(); 
        route_FMSChange(); //This no longer draws route unless its different browser session
    });
}*/

//Rebuilds the waypoint table
function route_BuildWaypointTable() {
    if ($("#routeTableBody").length) {
        $("#routeTableBody").empty();       

        if (route_ActiveRoute && route_ActiveRoute.length > 0) {
            for (var index = 0, len = route_ActiveRoute.length; index < len; index++) {
                element = route_ActiveRoute[index];
                element.current = "";

                var rw = $('<tr>').html("<td class='rtcol1'>" + element.identifier + "</td><td class='rtcol2'>" + route_getWaypointType(element.type) + "</td><td class='rtcol3' id='routeCurr" + index + "'>" + element.current + "</td><td class='rtcol4'>" + element.identifier + "</td><td class='rtcol5'>" + element.via + "</td><td class='alr rtcol6'>" +
                    + Math.round(element.altitude) + "</td><td class='alr rtcol7' id='routeHead" + index + "'>" + element.heading + "</td><td class='alr rtcol8' id='routeLeg" + index + "'>" + element.leg.toFixed(2) + "</td><td class='alr rtcol9' id='routeDist" + index + "'>" + element.distance.toFixed(2) + "</td><td class='alr rtcol10' id='routeEta" + index + "'>" + element.eta + "</td>");

                $(rw).appendTo('#routeTableBody');
            }

            $("#routeTable tr").unbind("click");

            $("#routeTable tr").click(function (e) {
                //console.log("#activeRoute tr", $(this));           

                $(this).addClass('selected').siblings().removeClass('selected');
                var idx = $(this).index(); // + 1;

                //console.log(route_ActiveRoute[idx].identifier)

                var delay = 0;
                /*if (isPFD) {
                    if (showinsetWpInfo()) delay = 500;
                };*/

                /*setTimeout(function () {
                    showWaypoint(route_ActiveRoute[idx].identifier);
                }, delay);*/

                e.preventDefault();
                e.stopImmediatePropagation();
            });

            /*if (isPFD) {
                $(".rtcol2").hide();
                $(".rtcol3").hide();
                $(".rtcol5").hide();
                $(".rtcol8").hide();
            }*/

            $(".rtcol5").hide();
        }
    }
}

//Waypoint types
function route_getWaypointType(type) {
    switch (type) {
        case 1: return "APT";
        case 2: return "NDB";
        case 3: return "VOR";
        case 12: return "DME";
        case 13: return "DME";
        case 11: return "FIX";
        case 28: return "POS";
    }
}

//Needed for map waypoints. Dont disable.
//Gets data from waypoint given a key ID
function route_getWaypointData(key) {
    var data = null;

    var datas = $.grep(route_ActiveRoute, function (element, index) {
        return element.identifier == key;
    });

    if (datas.length > 0) {
        data = datas[0];
    }

    return data;
}

//Returns table active row index (black background)
function route_GetActiveTableIndex() {
    return $("#routeTableBody .selected").first().index();
}

//Required do not disable in 2020
//returns active point data
function getActiveWaypointData() {
    var data = null;
    
    data = route_ActiveRoute[route_GetActiveTableIndex()];

    return data;
}

//Calculates all legs distance after loading a route
function route_CalculateRouteLegs() {   
    var preLatLng;

    if (route_ActiveRoute && route_ActiveRoute.length > 0) {        

        for (var index = 0; index < route_ActiveRoute.length; index++) {            
            element = route_ActiveRoute[index];

            var newLatLng = new L.LatLng(element.latitude, element.longitude);

            if (index > 0 && element.leg == 0 && preLatLng) {
                var dist2prev = L.GeometryUtil.length([preLatLng, newLatLng]);
                element.leg = dist2prev * 0.000539957;
            }

            element.distance = 0;
            element.heading = 0;
            element.current = "";
            element.eta = "00:00:00";

            preLatLng = newLatLng;           
        }
    }    
}

//Sumarizes leg distance from a to b
function route_CalculateLegsSum(a, b) {
    var legsSum = 0;

    if (route_ActiveRoute && route_ActiveRoute.length > 0) {
        for (i = a; i <= b; i++) {
            legsSum += route_ActiveRoute[i].leg;
        }
    }

    return legsSum;
}

//Calculates route metadata, this is called every 2 secs
function route_CalculateRouteMetadata() {  
    //$("#routeTable").is(":visible") &&  Calculate even if not visible... needed for autoland and more...

    try {
        var planeLat = parseFloat(stored_data["position/latitude"]);
        var planeLon = parseFloat(stored_data["position/longitude"]);

        if (!_route_loading && route_ActiveRoute && route_ActiveRoute.length > 0 && planeLat && planeLon) {
            
            //var curIndex = route_ActiveRoute.findIndex(x => x.identifier == stored_data["gps/wp_next_id"]);
           
            var xspd = parseFloat(stored_data["indicators/airspeed_true"]);
            var planeLatLng = new L.LatLng(planeLat, planeLon);

            /*var distanceToP = 0;
            var distanceToN = 0;

            if (curIndex > 0) {
                var xLatLng = new L.LatLng(route_ActiveRoute[curIndex].latitude, route_ActiveRoute[curIndex].longitude);
                distanceToP = L.GeometryUtil.length([planeLatLng, xLatLng]) * 0.000539957;
            }
            else {
                var xLatLng = new L.LatLng(route_ActiveRoute[0].latitude, route_ActiveRoute[0].longitude);
                distanceToP = L.GeometryUtil.length([planeLatLng, xLatLng]) * 0.000539957;
            }

            if (curIndex >= 0 && curIndex < route_ActiveRoute.length) {
                xLatLng = new L.LatLng(route_ActiveRoute[curIndex].latitude, route_ActiveRoute[curIndex].longitude);
                distanceToN = L.GeometryUtil.length([planeLatLng, xLatLng]) * 0.000539957;
            }*/

            for (var index = 0; index < route_ActiveRoute.length; index++) {
                element = route_ActiveRoute[index];

                $("#routeLeg" + index).html(parseFloat(element.leg).toFixed(2));

                var xLatLng = new L.LatLng(element.latitude, element.longitude);                
                element.distance = L.GeometryUtil.length([planeLatLng, xLatLng]) * 0.000539957;

                /*if (index < curIndex) {
                    element.distance = route_CalculateLegsSum(index, curIndex) + distanceToP;
                }
                else if (index > curIndex) {
                    element.distance = distanceToN + route_CalculateLegsSum(curIndex + 1, index);
                }
                else {
                    element.distance = distanceToP;
                };*/

                $("#routeDist" + index).html(parseFloat(element.distance).toFixed(2));

                if (element.distance > 0 && xspd >= 10) {
                    var tvalue = 60 * (element.distance / xspd);
                    var minutes = Math.floor(tvalue);
                    var seconds = 60 * (tvalue - minutes);

                    var date = new Date(null);

                    date.setMinutes(minutes);
                    date.setSeconds(seconds);

                    element.eta = date.toISOString().substr(11, 8);

                    $("#routeEta" + index).html(element.eta);
                }
                else {
                    element.eta = "00:00:00";

                    $("#routeEta" + index).html(element.eta);
                }

                element.heading = Math.round(route_getWaypointHeading(element.latitude, element.longitude));
                $("#routeHead" + index).html(element.heading);
            }

            if (_last_active_waypoint < 0) {
                setFocusedRouteRow();
            }
        }
    }
    catch (e) {
        console.error("route_CalculateRouteMetadata()", e);         
    }

    //if (isMFD)
    setTimeout("route_CalculateRouteMetadata()", _calculation_time);
}

//Calculate heading given to coordinates
function route_getWaypointHeading(latitude, longitude) {
    var planeLat = parseFloat(stored_data["position/latitude"]);
    var planeLon = parseFloat(stored_data["position/longitude"]);

    var true_psi = parseFloat(stored_data["indicators/heading"]);
    var mag_psi = parseFloat(stored_data["indicators/heading_mag"]); 
    var psi_diff = true_psi - mag_psi; 

    var planeLatLng = new L.LatLng(planeLat, planeLon);
    var wpLatLng = new L.LatLng(latitude, longitude);

    //psi_diff calculates de difference to get the magnetic, sice this GeometryUtil is always giving true... instruments uses mag, map uses true.
    var bearing = L.GeometryUtil.bearing(planeLatLng, wpLatLng) - psi_diff;

    var heading = 0;

    if (bearing > 0) heading = bearing;
    if (bearing < 0) heading = 360 + bearing;


    //console.log("getWaypointHeading", bearing, heading);

    return heading;
}

//ties to populate the airport data grids
/*function try2PopulateGrids(airport_data) {   
    if (airport_data) {
        if ($("#routeFormAirport").is(":visible") && airport_data.airport) $("#routeFormAirport").dxForm("instance").option("formData", airport_data.airport);

        if ($("#RadioGrid").is(":visible") && airport_data.airport) $("#RadioGrid").dxDataGrid("instance").option("dataSource", JSON.parse(airport_data.airport.Frequencies));

        if ($("#IlsGrid").is(":visible") && airport_data.ils) $("#IlsGrid").dxDataGrid("instance").option("dataSource", airport_data.ils);

        if ($("#RunwayGrid").is(":visible") && airport_data.runways) $("#RunwayGrid").dxDataGrid("instance").option("dataSource", airport_data.runways);

        //VOR not linked to airports so far... will reserach this for future use
        if ($("#VorGrid").is(":visible") && airport_data.runways) $("#VorGrid").dxDataGrid("instance").option("dataSource", airport_data.vordme);

        if ($("#routeFormWeather").is(":visible")) getMetar(airport_data.airport.Icao)
    }
}*/

//Show waipoing data in the forms given an ID
/*function showWaypoint(id) {
    if ($("#waypointTabs").is(":visible")) {
        data = route_getWaypointData(id);

        console.log("showWaypoint", id, data);

        switch (data.type) {
            case 1:
                $("#waypointTabs").dxTabPanel("instance").option("selectedIndex", 1);
                $("#routeFormAirport").dxForm("instance").option("formData", data.metadata.airport);

                try2PopulateGrids(data.metadata);

                break;
            case 2:
                $("#waypointTabs").dxTabPanel("instance").option("selectedIndex", 3);
                $("#routeFormNdb").dxForm("instance").option("formData", data.metadata);
                break;
            case 3:
            case 12:
            case 13:
                $("#waypointTabs").dxTabPanel("instance").option("selectedIndex", 2);
                $("#routeFormVor").dxForm("instance").option("formData", data.metadata);
                break;
            default:
                $("#waypointTabs").dxTabPanel("instance").option("selectedIndex", 0);
                break;
        }
    }
}*/

//Sets the focused waypoint table row based on FMC current active index
function setFocusedRouteRow() {
    if (route_ActiveRoute && route_ActiveRoute.length > 0) {
        //var curr = parseInt(stored_data["gps/wp_index"]); "gps/wp_index" is sometimes worng
        var curr = route_ActiveRoute.findIndex(x => x.identifier == stored_data["gps/wp_next_id"]); 
        

        //if (isMFD &&
        if ($("#routeTable").is(":visible")) {

            if (_last_active_waypoint && _last_active_waypoint >= 0) {
                route_ActiveRoute[_last_active_waypoint].current = "";
                $("#routeCurr" + _last_active_waypoint).html("");
            }

            if (curr >= 0) {
                _last_active_waypoint = curr;

                $('tr:eq(' + (_last_active_waypoint+1) + ')', '#routeTable').addClass('selected').siblings().removeClass('selected');

                route_ActiveRoute[_last_active_waypoint].current = "&rArr;";
                $("#routeCurr" + _last_active_waypoint).html("&rArr;");

                //No waypoint info. disabled in this version
                //showWaypoint(route_ActiveRoute[_last_active_waypoint].identifier);
            }
            else {
                _last_active_waypoint = - 1;
            }
        }
    }
}

//Dont set altitude automatically, this messes up some GPS plans
/*function setRouteAltitude() {
    if (route_ActiveRoute && route_ActiveRoute.length > 0) {
        var curr = parseInt(stored_data["Aviator4FWL/FMS/Interface/EntryCur"]);
        var altitude = route_ActiveRoute[curr].altitude;

        sendXPSetValue("sim/cockpit/autopilot/altitude", altitude);
    }
}*/

/*function routeGetFilename() {
    if (route_ActiveRoute && route_ActiveRoute.length > 0) {
        var dep = route_ActiveRoute[0].identifier;
        var des = route_ActiveRoute[route_ActiveRoute.length - 1].identifier;
        var wp = route_ActiveRoute.length;
        

        route_CalculateRouteLegs();
        var len = Math.round(route_CalculateLegsSum(0, wp - 1));

        return `${dep}_${des}_${len}NM_${wp}WP`;
    }

    return "";
}*/

//Shows a waypoint on the map
function routeShowWpOnMap() {
    var data = getActiveWaypointData();

    if (data) {
        console.log("showWpOnMap", data.latitude, data.longitude);

        $("#status_box_table").detach().appendTo("#map_status_box_container");
        $("#map-container").detach().appendTo("#right_panel_container");
        $("#inset_left").hide();
        $("#background_map").show();
        refreshMapIn(0);

        $('#main_carousel').carousel(2);

        setTimeout(function () {           

            //map.flyTo(new L.LatLng(data.latitude, data.longitude));
            map.setView([data.latitude, data.longitude], 12); //was 15
        }, 100);
    }
    else {
        Swal.fire("Select waypoint first!");
    }
}

//Sends new destination point to the FMC
/*function routeSetDestination(key) {
    var data;
    if (key) data = getWaypointData(key); else data = getActiveWaypointData();

    if (data) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to set " + data.identifier + " as next destination?",
            type: 'question',
            showCancelButton: true,
        }).then((result) => {
            if (result.value) {
                sendXPSetValue("Aviator4FWL/FMS/Interface/EntrySet", parseFloat(data.id - 1));

                setTimeout(function () { sendXPCommand("Aviator4FWL/FMS/FMSSetDestination"); }, 500);
            }
        })
    }
    else {
        Swal.fire("Select waypoint first!");
    }
}


//asks for confirmation to go to a specific waypoint, this RE-STARTS flight
function routeGoTo(key) {
    var data;
    if (key) data = getWaypointData(key); else data = getActiveWaypointData();

    if (data) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to go to waypoint " + data.identifier,
            type: 'question',
            showCancelButton: true,
        }).then((result) => {
            if (result.value) {

                sendXPSetValue("Aviator4FWL/FMS/Interface/EntrySet", parseFloat(data.id - 1));

                setTimeout(function () {
                    sendXPCommand("Aviator4FWL/FMS/FMSSetDestination");
                    DOrouteGoTo(key);
                }, 500);
                
            }
        })
    }
    else {
        Swal.fire("Select waypoint first!");
    }
}

//Perform previous function action
function DOrouteGoTo(key) {
    var data;
    if (key) data = getWaypointData(key); else data = getActiveWaypointData();

    if (data) {
        console.log("routeGoTo", data.identifier);

        switch (data.type) {
            case 1:
                performPRELAPT(data.identifier);
                break;
            default:

                var data_p = route_getWaypointData(data.id + 1);

                var mspd = stored_data["sim/cockpit2/gauges/indicators/max_mach_number_or_speed_kias"] * .45;
                var cspd = stored_data["sim/flightmodel/position/true_airspeed"];
                var spd = Math.max(mspd, cspd);

                var wpLatLng_p = new L.LatLng(data_p.latitude, data_p.longitude);
                var wpLatLng = new L.LatLng(data.latitude, data.longitude);
                var bearing = L.GeometryUtil.bearing(wpLatLng, wpLatLng_p);

                var heading = 0;

                if (bearing > 0) heading = bearing;
                if (bearing < 0) heading = 360 + bearing;

                //Set AP heading and altitude to when the new position.
                autopilotSetHeading(heading, 0, false);
                autopilotSetAltitude(data.altitude, 0);

                sendXP_PRELXY(data.latitude, data.longitude, heading, data.altitude, spd);

                break;
        }
    }
    else {
        Swal.fire("Select waypoint first!");
    }
}*/

//Fully clears route even in FMC.
/*function route_FullClear() {
    //sendXPCommand("Aviator4FWL/FMS/clearAllFmsEntries");

    route_ActiveRoute = [];
    _last_fpl_name = "";
    if (dest_polyline) dest_polyline.remove();
    $("#routeTableBody").empty();
    restartMap();  
    
    setFocusedRouteRow();

    setTimeout(function () {
        route_FMSChange();
    }, 500);
};*/

//Locally clears route,. not touching FMC
function route_LocalClear() {    
    route_ActiveRoute = [];
    _last_fpl_name = "";
    if (dest_polyline) dest_polyline.remove();
    $("#routeTableBody").empty();

    console.log("restartMap 4");
    restartMap();
    
    setFocusedRouteRow();  
};

//Sets MAP in route edit mode
function route_EditRoute() {
    console.log("route_EditRoute");
    pointerMode = 2;
    $('.leaflet-container').css('cursor', 'cell');
    $("#fplTabs").dxTabPanel("instance").option("selectedIndex", 0);


    sessionStorage.setItem("SKSC_MAPLAYER_FIX Markers"  + mapSufix, true);
    map.addLayer(fixes_layer);

    layersZoomCheck();

    showRouteEditorPopup();    

    //Add current airport if route is empty.

    mapShowMessage('Route in EDIT mode', 3000);
};

//Sets MAP back in normal mode
function route_EditRouteEnd() {
    console.log("route_EditRouteEnd");
    pointerMode = 0;
    $('.leaflet-container').css('cursor', '');

    sessionStorage.setItem("SKSC_MAPLAYER_FIX Markers" + mapSufix, false);
    map.removeLayer(fixes_layer);

    mapShowMessage('Route edition finished', 3000);    
};

//Initializes new node
function route_NewNode() {
    return { id: -1, altitude: 0, current: "", distance: 0, eta: "00:00:00", heading: 0, identifier: "", latitude: 0, longitude: 0, leg: 0, type: 0, via: "DRCT" };
}

//Adds a POS LAT LON node
function route_AddPOS(latlng) {
    if (!route_ActiveRoute) route_ActiveRoute = [];

    var idf = Math.round(parseFloat(latlng.lat)) + "_" + Math.round(parseFloat(latlng.lng));
    var node = route_NewNode();

    node.identifier = idf;
    node.latitude = latlng.lat;
    node.longitude = latlng.lng;
    node.type = 28;    

    routeEditorSetNode(node);
}

//Adds an APT node
function route_AddAPT(data) {
    if (!route_ActiveRoute) route_ActiveRoute = [];

    console.log("route_AddAPT", data);
    
    var node = route_NewNode();

    node.identifier = data.airport.Icao;
    node.latitude = data.airport.Latitude;
    node.longitude = data.airport.Longitude;
    node.altitude = data.airport.Elevation || 0;
    node.type = 1;
    node.metadata = data;    

    routeEditorSetNode(node); 
}

//Adds a VORDME node
function route_AddVORDME(data) {
    if (!route_ActiveRoute) route_ActiveRoute = [];

    console.log("route_AddVORDME", data);

    var node = route_NewNode();

    node.identifier = data.Identifier;
    node.latitude = data.Latitude;
    node.longitude = data.Longitude;
    node.altitude = 0; //data.Elevation;
    node.type = 3;
    node.metadata = data;

    routeEditorSetNode(node);
}

//Adds an ILS marker as node
function route_AddILSMarker(data) {
    if (!route_ActiveRoute) route_ActiveRoute = [];

    console.log("route_AddILSMarker", data);

    var node = route_NewNode();

    //var idf = parseFloat(data.ILSPoint.lat).toFixed(2) + "_" + parseFloat(data.ILSPoint.lng).toFixed(2);
    var idf = Math.round(parseFloat(data.ILSPoint.lat)) + "_" + Math.round(parseFloat(data.ILSPoint.lng));

    node.identifier = idf;
    node.latitude = data.ILSPoint.lat;
    node.longitude = data.ILSPoint.lng;
    node.altitude = 0; //data.Elevation;
    node.type = 28;
    node.metadata = data;

    routeEditorSetNode(node);
}

//Adds an FIX marker as node
function route_AddFIXMarker(data) {
    if (!route_ActiveRoute) route_ActiveRoute = [];

    console.log("route_AddFIXMarker", data);

    var node = route_NewNode();    

    node.identifier = data.Identifier;
    node.latitude = data.Latitude
    node.longitude = data.Longitude;
    node.altitude = 0; //data.Elevation;
    node.type = 11;
    node.metadata = data;

    routeEditorSetNode(node);
}

//Adds a VORDME node
function route_AddRunway(data, dato) {
    if (!route_ActiveRoute) route_ActiveRoute = [];    

    console.log("route_AddRunway", data, dato);

    var distA = 0;
    var distB = 0;

    if (_map_last_point) {
        var llA = new L.LatLng(data.LatitudeA, data.LongitudeA);
        var llB = new L.LatLng(data.LatitudeB, data.LongitudeB);

        distA = L.GeometryUtil.length([_map_last_point, llA]);
        distB = L.GeometryUtil.length([_map_last_point, llB]);
    }


    var node = route_NewNode();    

    if (distA < distB) {
        node.latitude = data.LatitudeA;
        node.longitude = data.LongitudeA;
        node.identifier = "RWY" + data.RunwayA;
    } else {
        node.latitude = data.LatitudeB;
        node.longitude = data.LongitudeB;
        node.identifier = "RWY" + data.RunwayB;
    }

    node.altitude = dato.airport.Elevation || 0; //data.Elevation;
    node.type = 28;
    node.metadata = data;

    routeEditorSetNode(node);
}

//----------------------------------------------------------------------------------------------------------
//Adds an APT node as MapPoint
function mapPoint_AddAPT(icao) {    
    console.log("mapPoint_AddAPT", icao);

    $.ajax({
        url: url_GetFullAirportData,
        type: "POST",
        dataType: "json",
        data: { id: icao },
        success: function (data) {
            console.log("data", data);

            var name = data.airport.Name;
            if (name.length > 20) name = name.substring(0, 20) + "...";

            mapPointLat = data.airport.Latitude;
            mapPointLon = data.airport.Longitude;
            mapPointInfo = data.airport.Icao + " - <small>" + name + "</small>"
            mapPointActive = true;

            //if (elite_target_info == 3) showTargetInfo(elite_target_info);

            //If MPT is activated then show MPT info now.            
            elite_target_info = 3;
            showTargetInfo(elite_target_info);
        },
    });
}

//Adds an ILS node as MapPoint
function mapPoint_AddGenericPoint(lat, lon, info) {    
    console.log("mapPoint_AddGenericPoint", lat, lon, info);

    mapPointLat = lat;
    mapPointLon = lon;
    mapPointInfo = info;
    mapPointActive = true;

    //if (elite_target_info == 3) showTargetInfo(elite_target_info);
    elite_target_info = 3;
    showTargetInfo(elite_target_info);
}