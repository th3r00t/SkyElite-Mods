var softkeys_menu_enabled = false;

let softkeys_ALLOFF = [null, null, null, null, null, null, null, null, null, null, null, null];

let softkeys_PFD = ["INMAP", "TRMAP", "WIND", "REFSPD",  null, "CDIINF", "CDI", "ADF", "ELEVAT", "ENGINE", "CTRLS", "INFO"];
let softkeys_PFD_TRMAP = ["TR1", "TR2", "TR3", "TR4", "TR5", "TR6", "TR7", "TR8", "TR9", null, null, "BACK2MAIN"];
let softkeys_PFD_ADF = ["STBSET", null, "ADFTRF", null, "BEARNG", null, "HDGSET", null, null, "ADFINF", null, "BACK2MAIN"];

let softkeys_MAP = ["MAPSR", "CLEAR", "DATA", "NORTH", "CENTR", "CDIINF", "MPT", "STATUS", "ELEVAT", "MPWIN", "LANDZ" , "SHDOW"]; //"MCRTLS"
let softkeys_MAP_DATA = ["APT", "RWY", "VOR", "NDB", "ILS", "FIX", "ROUTE", "WAYPT", "PLANE", "TRACK", null, "BACK2MAP"];

let softkeys_ACFT = ["LIGHTS", "FUEL", "CONTRL", "TRIMS", "ASKID", "PITOT", "ANTICE", null, "STRSTP", "BATT", null, "BACK2MAIN"];

let softkeys_ACFT_LIGHTS = ["LAND", "TAXI", "RECOG", "NAV", "BCN", "STROBE", "LOGO", "WING", "PANEL", "CABIN", "ALL", "BACK2ACFT"];

let softkeys_ACFT_FUEL = ["+25%", "FULL", null, "LEFT", "CENTER", "RIGHT", null, "ALL", null, "OFF", null, "BACK2ACFT"];

let softkeys_ACFT_CONTROLS = ["LG-UP", "LG-DN", null, "FL-UP", "FL-DN", null, null, "SPOILR", null, "PBRAKE", null, "BACK2ACFT"];

let softkeys_ACFT_TRIMS = ["ELVCTR", "AILCTR", "RUDCTR", null, "ELV-UP", "ELV-DN", "AIL-L", "AIL-R", "RUD-L", "RUD-R", null, "BACK2ACFT"];

//let softkeys_MENU = ["ON/OFF", "TIME", "MUSIC", "MUTE", "PAUON", "PAUOFF", null, "FULLSCR", "RESET", null, "SETTNG" , "BACK2MAIN"];

let softkeys_MENU = ["ON/OFF", "TIME", "PAUON", "PAUOFF",null, "GRDSRV",, null, "FULLSCR", "RESET", null, "SETTNG", "BACK2MAIN"];
let softkeys_MENU_TIME = ["HOUR+", "HOUR-", null, "MIN+", "MIN-", null, "NOW", null, null, null, null, "BACK2MENU"];
let softkeys_MENU_GROUND = ["PUSHBK", null, "PBACKL", "PBACKS", "PBACKR",  null, "RQFUEL", null, "JETWAY", null, null, "BACK2MENU"];

let softkeys_MENU_SETTINGS = ["ABOUT", null, "ELVDAT", null, null, null, null, null, null, null, null, "BACK2MENU"];

let softkeys_APT = ["NEAR", "W-ILS", "LIGHT", null, null, "FPLAPT", null, null, null, null, null, "ONMAP"];

//let softkeys_SETTINGS = ["RESET", null, null, null, null, "FULLSCR", null, null, null, null, null, "BACK2MAIN"];

let softkeys_FPL = ["WPMAP", null, "SETALT", "SETALV", null, "SETHDG", null, "SETCRS", null, "BGMAP", null, "APTINF"];

let softkeys_MUSIC = ["MUTE", null, null, null, null, null, null, null, null, null, null, null];

//-------------------------------------------------------------------------------------------------------------------

function softkey_menu_ALLOFF() {
    softkey_menu_set(softkeys_ALLOFF);
}

function softkey_menu_PFD() {
    setPFDMode(1);

    softkey_menu_set(softkeys_PFD);    

    if (softkeys_menu_enabled) {
        $("#menuPFD").addClass("funct_on");
        $("#menuMAP").removeClass("funct_on");
        $("#menuAPT").removeClass("funct_on");
        $("#menuFPL").removeClass("funct_on");
        $("#menuMUSIC").removeClass("funct_on");
    }
}

function softkey_menu_PFD_TRMAP() {    
    softkey_menu_set(softkeys_PFD_TRMAP);
}

function softkey_menu_PFD_ADF() {
    softkey_menu_set(softkeys_PFD_ADF);
}

function softkey_menu_MAP() {
    setPFDMode(3);
    softkey_menu_set(softkeys_MAP);

    if (softkeys_menu_enabled) {
        $("#menuMAP").addClass("funct_on");
        $("#menuPFD").removeClass("funct_on");
        $("#menuAPT").removeClass("funct_on");
        $("#menuFPL").removeClass("funct_on");
        $("#menuMUSIC").removeClass("funct_on");
    }
}

function softkey_menu_MAP_MAPSRC() {
    softkeys_clear();

    var i;
    for (i = 1; i <= 11; i++) {
        var sId = "MAPSR" + i;
        var skt = loadedMaps[i-1].short_name;

        if (!skt) skt = sId;

        if (sId) {
            $("#softkey" + i).text(skt);
            $("#softkey" + i).data('option', sId);            
        }
    }

    $("#softkey12").text("BACK");
    $("#softkey12").data('option', "BACK2MAP");

    softkey_check_optionsareon();
}

function softkey_menu_MAP_MAPDATA() {
    softkey_menu_set(softkeys_MAP_DATA);    
}

function softkey_menu_APT() {
    setPFDMode(4);
    softkey_menu_set(softkeys_APT);

    if (softkeys_menu_enabled) {
        $("#menuAPT").addClass("funct_on");
        $("#menuPFD").removeClass("funct_on");
        $("#menuMAP").removeClass("funct_on");
        $("#menuFPL").removeClass("funct_on");
        $("#menuMUSIC").removeClass("funct_on");
    }
}


function softkey_menu_MUSIC_setLabel() {
    if (parseInt(stored_data["sim/music_status"]) >= 3 && $("#musicStation").length == 0) {
        $("#menuMUSIC").html("MUTE");
    }
    else {
        $("#menuMUSIC").html("MUSIC");
    }
}

function softkey_menu_MUSIC() {
    //https://docs.microsoft.com/en-us/windows/win32/wmp/player-playstate
    if (parseInt(stored_data["sim/music_status"]) >= 3) {
        musicTogglePause();
    }
    else {
        setPFDMode(5);
        softkey_menu_set(softkeys_MUSIC);

        if (softkeys_menu_enabled) {
            $("#menuMUSIC").addClass("funct_on");
            $("#menuPFD").removeClass("funct_on");
            $("#menuMAP").removeClass("funct_on");
            $("#menuFPL").removeClass("funct_on");
            $("#menuAPT").removeClass("funct_on");
        }
    }
}

function softkey_menu_ACFT() {
    softkey_menu_set(softkeys_ACFT);

    if (softkeys_menu_enabled) $("#menuACFT").addClass("funct_on");
}

function softkey_menu_ACFT_LIGHTS() {
    softkey_menu_set(softkeys_ACFT_LIGHTS);

    if (softkeys_menu_enabled) $("#menuACFT").addClass("funct_on");
}

function softkey_menu_ACFT_FUEL() {
    softkey_menu_set(softkeys_ACFT_FUEL);
    if (softkeys_menu_enabled) $("#menuACFT").addClass("funct_on");
}

function softkey_menu_ACFT_CONTROLS() {
    softkey_menu_set(softkeys_ACFT_CONTROLS);
    if (softkeys_menu_enabled) $("#menuACFT").addClass("funct_on");
}

function softkey_menu_ACFT_TRIMS() {
    softkey_menu_set(softkeys_ACFT_TRIMS);
    if (softkeys_menu_enabled) $("#menuACFT").addClass("funct_on");
}

function softkey_menu_MENU() {
    softkey_menu_set(softkeys_MENU);
    if (softkeys_menu_enabled) $("#menuMENU").addClass("funct_on");
}

function softkey_menu_MENU_TIME() {
    softkey_menu_set(softkeys_MENU_TIME);
    if (softkeys_menu_enabled) $("#menuMENU").addClass("funct_on");
}

function softkey_menu_MENU_SETTINGS() {
    softkey_menu_set(softkeys_MENU_SETTINGS);
    if (softkeys_menu_enabled) $("#menuMENU").addClass("funct_on");
}

function softkey_menu_MENU_GROUND() {
    softkey_menu_set(softkeys_MENU_GROUND);
    if (softkeys_menu_enabled) $("#menuMENU").addClass("funct_on");
}

//function softkey_menu_SETTINGS() {    
//    softkey_menu_set(softkeys_SETTINGS);
//    //if (softkeys_menu_enabled) $("#menuSET").addClass("funct_on");
//}

function softkey_menu_FPL() {
    setPFDMode(6);
    softkey_menu_set(softkeys_FPL);

    if (softkeys_menu_enabled) {
        $("#menuFPL").addClass("funct_on");
        $("#menuAPT").removeClass("funct_on");
        $("#menuPFD").removeClass("funct_on");
        $("#menuMAP").removeClass("funct_on");
        $("#menuMUSIC").removeClass("funct_on");
    }
}

//-------------------------------------------------------------------------------------------------------------------
var optionsareon_interval;

$(document).ready(function () {
    $(".softkey").click(function () {

        var option = $(this).data('option');
        var keyno = $(this).data('keyno');

        console.log("softkey click ", option);

        softkey_click(option, keyno);
    });

    optionsareon_interval = setTimered(function () { //setInterval
        softkey_check_optionsareon();
    }, 1000);  
});

function menu_interval_on() {
    softkeys_menu_enabled = true;
}

function menu_interval_off() {
    softkeys_menu_enabled = false;
    //clearInterval(optionsareon_interval);    
    //optionsareon_interval = null;
}

function softkeys_clear() {
    $(".softkey").removeClass("funct_on");
    $(".softkey").text("");
    $(".softkey").data('option', '');

    $("#menuACFT").removeClass("funct_on");
    $("#menuMENU").removeClass("funct_on");    
    //$("#menuSET").removeClass("funct_on");        
}

//$('#main_carousel div.active').index() == 1) has a delayed effect during transitions
//function menukeys_setlights() {
//    $(".menukey").removeClass("funct_on");

//    console.log("menukeys_setlights", $('#main_carousel div.active').index());

//    if ($('#main_carousel div.active').index() == 1) $("#menuPFD").addClass("funct_on");
//    if ($('#main_carousel div.active').index() == 2) $("#menuMAP").addClass("funct_on");
//}    

function softkey_menu_set(softkeys_PFD) {
    softkeys_clear();

    var i;
    for (i = 1; i <= 12; i++) {
        var sId = softkeys_PFD[i - 1];

        var skt = softkey_caption(sId);

        if (!skt) skt = sId;
        
        if (sId) {
            $("#softkey" + i).html(skt);
            $("#softkey" + i).data('option', sId);
        }        
    }

    softkey_check_optionsareon();
}

function softkey_click(option, keyno) {
    switch (option) {
        //PFD
        case "INMAP":
            elite_pfd_mode == 0 ? setPFDMode(1) : setPFDMode(0);
            break;

        case "TRMAP":
            if (elite_pfd_mode != 2) setPFDMode(2);
            softkey_menu_PFD_TRMAP();
            break;

        case "ADF":
            softkey_menu_PFD_ADF();
            break;

        case "ADFTRF":
            sendFunction("radio/adf1_stby", "toggle");
            break;

        case "STBSET":
            edit_selected_adf();
            break;

        case "BEARNG":
            radio_show_adf_bearing = !radio_show_adf_bearing;
            updateCRS();
            break;

        case "ADFINF":
            $("#inset_adf").toggle(!$("#inset_adf").is(":visible"));
            break;

        case "HDGSET":
            sendFunction("autopilot/heading_selected", "set", Number(stored_data["indicators/hsi_bearing"]));
            break;

        case "WIND":
            $("#inset_wind").toggle();
            break;

        case "REFSPD":
            $("#vspeeds_info_table").toggle();
            indicator.resize();
            break;

        case "TR1":
        case "TR2":
        case "TR3":
        case "TR4":
        case "TR5":
        case "TR6":
        case "TR7":
        case "TR8":
        case "TR9":
            if (elite_pfd_mode != 2) setPFDMode(2);

            var transparency = keyno / 10;

            $.post("/Data/SetSettingInt/" + transparency * 10 + "/?group=settings-pfd&setting=efis-transparency");
            indicator.updateOpacity(transparency);

            break;

        /*case "NAV1":
            sendFunction("autopilot/navsrc1", "toggle");

            break;
        case "NAV2":
            sendFunction("autopilot/navsrc2", "toggle");
            
            break;
        case "GPS":
            sendFunction("autopilot/navgps", "toggle");            
            break;*/

        case "CDI":
            if (parseInt(stored_data["autopilot/navgps"]) == 1) {
                sendFunction("autopilot/navgps", "toggle");
                sendFunction("autopilot/navsrc1", "set", 1);
            }
            else {
                if (parseInt(stored_data["autopilot/navsrc1"]) == 1) {
                    sendFunction("autopilot/navsrc1", "set", 2);
                }
                else {
                    sendFunction("autopilot/navgps", "toggle");
                    sendFunction("autopilot/navsrc1", "set", 1);
                }
            }

            break;

        case "CDIINF":
            toggleTargetInfo();
            break;

        case "MPT":
            mapPointActive = !mapPointActive;

            //If MPT is activated then show MPT info now.
            if (mapPointActive) {
                elite_target_info = 3;
                showTargetInfo(elite_target_info);
            }

            break;

        case "ELEVAT":
            if (isEGPWSActive) {
                switch ($('#main_carousel div.active').index()) {
                    case 1:
                        $("#inset_elevation").toggle(!$("#inset_elevation").is(":visible"));
                        break;
                    case 2:
                        $("#map_inset_elevation").toggle(!$("#map_inset_elevation").is(":visible"));
                        break;
                }

                flot_resetElevation();
            }
            else {
                //Swal.fire("Elevation database not installed. Please, read manual.");

                Swal.fire({
                    title: 'Elevation database is not installed',
                    text: "You want to install it now?",
                    type: 'question',
                    showCancelButton: true,
                }).then((result) => {
                    if (result.value) {
                        setPFDMode(102);
                    }
                })     
            }

            break;

        case "ENGINE":
            $("#inset_engine").toggle(!$("#inset_engine").is(":visible"));
            break;

        case "CTRLS":
            $("#inset_controls").toggle(!$("#inset_controls").is(":visible"));
            break;

        case "INFO":
            $("#lower_box_container").toggle(!$("#lower_box_container").is(":visible"));
            break;

        //MAP
        case "CLEAR":
            restartMap();
            centerPlane();
            map.setZoom(zoomInitial);

            break;

        case "STATUS":       
            $("#map_status_box_container").toggle(!$("#map_status_box_container").is(":visible"));

            //if ($('#map_status_box_container').is(':empty')) {
            //    $("#status_box_table").detach().appendTo("#map_status_box_container");
            //}
            //else
            //    $("#status_box_table").detach().appendTo("#status_box_container");

            break;

        case "MCRTLS":
            $(".leaflet-control-container").toggle(!$(".leaflet-control-container").is(":visible"));
            break;
        case "MAPSR":
            //showInsetMapSource();
            softkey_menu_MAP_MAPSRC();
            break;

        case "MPWIN":
            $("#map_wind").toggle(!$("#map_wind").is(":visible"));
            break;

        case "LANDZ":
            toggleLandeddMap();
            break;

        case "MAPSR1":
        case "MAPSR2":
        case "MAPSR3":
        case "MAPSR4":
        case "MAPSR5":
        case "MAPSR6":
        case "MAPSR7":
        case "MAPSR8":
        case "MAPSR9":
        case "MAPSR10":
        case "MAPSR11":
            var data = { value: loadedMaps[keyno-1].name };            

            basemap_valueChanged(data);

            break;

        case "DATA":
            softkey_menu_MAP_MAPDATA();
            break;

        case "APT":
            map_layer_toggle(airport_layer);
            break;

        case "RWY":
            map_layer_toggle(runways_layer);
            map_layer_toggle(runways_guides);
            map_layer_toggle(runways_marker);
            break;

        case "VOR":
            map_layer_toggle(vor_marker);
            break;

        case "NDB":
            map_layer_toggle(ndb_marker);
            break;


        case "ILS":
            map_layer_toggle(ils_layer);
            map_layer_toggle(ils_marker);
            break;

        case "FIX":
            map_layer_toggle(fixes_layer);
            break;

        case "ROUTE":
            map_layer_toggle(route_layer);
            break;

        case "WAYPT":
            map_layer_toggle(route_marker);
            break;

        case "PLANE":
            map_layer_toggle(plane_layer);
            break;

        case "TRACK":
            map_layer_toggle(track_layer);
            break;       

        case "SHDOW":
            if (plane) {
                if (plane._shadow.src.includes("plane_shadow")) {
                    plane._shadow.src = "/img/plane_noshadow.png?" + Math.floor(Math.random() * Number.MAX_VALUE);;
                }
                else {
                    plane._shadow.src = "/img/plane_shadow.png?" + Math.floor(Math.random() * Number.MAX_VALUE);
                }
            }

            break;
        case "NORTH":
            toggleAlwaysNorth();
            break;

        case "CENTR":
            toggleAlwaysCenter();
            break;

        //ACFT
        case "RESET":
            window.location = "/";
            break;

        case "FULLSCR":
            document.documentElement.requestFullscreen();
            break;

        //ACFT       
        case "START":
            sendFunction("engine/running", "on", "");
            break;

        case "STOP":
            sendFunction("engine/running", "off", "");            
            break;

        case "STRSTP":
            if (parseInt(stored_data["engine/running"]) == 1) sendFunction("engine/running", "off", ""); else sendFunction("engine/running", "on", "");
            
            break;


        case "BATT":
            sendFunction("systems/battery", "toggle");
            break;


        case "PITOT":
            sendFunction("systems/pitot", "toggle");
            break;


        case "ANTICE":
            sendFunction("systems/ice", "toggle");
            break;

        //ACFT - LIGHTS
        case "LIGHTS":
            softkey_menu_ACFT_LIGHTS();
            break;
        
        case "LAND":
            sendFunction("lights/landing", "toggle", "");
            break;

        case "TAXI":
            sendFunction("lights/taxi", "toggle", "");
            break;

        case "RECOG":
            sendFunction("lights/recog", "toggle", "");
            break;

        case "NAV":
            sendFunction("lights/nav", "toggle", "");
            break;

        case "BCN":
            sendFunction("lights/beacon", "toggle", "");
            break;

        case "STROBE":
            sendFunction("lights/strobe", "toggle", "");
            break;

        case "LOGO":
            sendFunction("lights/logo", "toggle", "");
            break;

        case "WING":
            sendFunction("lights/wing", "toggle", "");
            break;

        case "PANEL":
            sendFunction("lights/panel", "toggle", "");
            break;

        case "CABIN":
            sendFunction("lights/cabin", "toggle", "");
            break;

        case "ALL":
            sendFunction("lights/all", "toggle", "");
            break;

        //-------------
        case "FUEL":
            softkey_menu_ACFT_FUEL();
            break;
        
        case "+25%":
            sendFunction("fuel/total", "up", "");
            break;

        case "FULL":
            sendFunction("fuel/total", "toggle", "");
            break;

        case "ALL":
            sendFunction("fuel/selector1", "set", 1);
            break;

        case "LEFT":
            sendFunction("fuel/selector1", "set", 2);
            break;

        case "RIGHT":
            sendFunction("fuel/selector1", "set", 3);
            break;

        case "CENTER":
            sendFunction("fuel/selector1", "set", 6);
            break;

        case "OFF":
            sendFunction("fuel/selector1", "set", 0);
            break;

        //-------------
        
        case "CONTRL":
            softkey_menu_ACFT_CONTROLS();
            break;

        case "LG-UP":
            sendFunction("controls/gear", "up");
            break;

        case "LG-DN":
            sendFunction("controls/gear", "down");
            break;

        case "FL-UP":
            sendFunction("controls/flaps", "up");
            break;

        case "FL-DN":
            sendFunction("controls/flaps", "down");
            break;

        case "SPOILR":
            sendFunction("controls/spoilers", "toggle");
            break;

        case "PBRAKE":
            sendFunction("controls/parking_brake", "toggle");
            break;

        case "ASKID":
            sendFunction("controls/antiskid", "toggle");
            break;

        //-------------

        //let softkeys_ACFT_TRIMS = ["ELVCTR", "AILCTR", "RUDCTR", null, "ELV-UP", "ELV-DN", "AIL-L", "AIL-R", "RUD-L", "RUD-F", null, "BACK2ACFT"];

        case "TRIMS":
            softkey_menu_ACFT_TRIMS();
            break;

        case "ELVCTR":
            sendFunction("controls/elevator_trim", "set", 0);
            break;

        case "AILCTR":
            sendFunction("controls/aileron_trim_pct", "set", 0);
            break;

        case "RUDCTR":
            sendFunction("controls/rudder_trim_pct", "set", 0);
            break;

        case "ELV-UP":
            sendFunction("controls/elevator_trim", "down");
            break;

        case "ELV-DN":
            sendFunction("controls/elevator_trim", "up");
            break;

        case "AIL-L":
            sendFunction("controls/aileron_trim", "up");
            break;

        case "AIL-R":
            sendFunction("controls/aileron_trim", "down");
            break;

        case "RUD-L":
            sendFunction("controls/rudder_trim", "up");
            break;

        case "RUD-R":
            sendFunction("controls/rudder_trim", "down");
            break;

        //-------------

        //FUNC-TIME
        case "TIME":
            softkey_menu_MENU_TIME();
            break;
        case "HOUR+":
            sendFunction("sim/zulu_time", "up", "");
            break;
        case "HOUR-":
            sendFunction("sim/zulu_time", "down", "");
            break;
        case "MIN+":
            sendFunction("sim/local_time", "up", "");
            break;
        case "MIN-":
            sendFunction("sim/local_time", "down", "");
            break;
        case "NOW":
            var date = new Date; //new Date();
            var minutes = date.getMinutes();
            var hour = date.getHours();

            sendEvent("CLOCK_HOURS_SET", hour);
            sendEvent("CLOCK_MINUTES_SET", minutes);
            break;

        //-------------

        //MENU
        case "PAUON":
            sendEvent("PAUSE_ON");
            break;

        case "PAUOFF":
            sendEvent("PAUSE_OFF");
            break;

        //case "MUSIC":
        //    setPFDMode(5);
        //    break;

        case "MUTE":
            musicTogglePause();
            break;

        //case "ON":
        //    setPFDOn();
        //    break;

        //case "OFF":
        //    setPFDOff();
        //    break;

        case "ON/OFF":
            setPFDToggle();
            break;

        case "RESET":
            window.location = "/";
            break;

        case "FULLSCR":
            document.documentElement.requestFullscreen();
            break;

        case "SETTNG":
            softkey_menu_MENU_SETTINGS();
            break;

        case "GRDSRV":
            softkey_menu_MENU_GROUND();
            break;

        //SETTINGS

        case "ABOUT":
            setPFDMode(101);
            break;

        case "ELVDAT":
            setPFDMode(102);
            break;


        //-------------
        //GROUND

        case "PUSHBK":
            sendEvent("TOGGLE_PUSHBACK");            
            break;

        case "PBACKL":
            sendEvent("KEY_TUG_HEADING", tugHeading(45));

            break;

        case "PBACKS":            
            sendEvent("KEY_TUG_HEADING", tugHeading(0));

            break;

        case "PBACKR":            
            sendEvent("KEY_TUG_HEADING", tugHeading(-45));

            break;

        case "RQFUEL":
            sendEvent("REQUEST_FUEL_KEY");
            break;

        case "JETWAY":
            sendEvent("TOGGLE_JETWAY");
            break;

        //-------------

        //FPL
        case "WPMAP":
            routeShowWpOnMap();
            break;

        case "SETALT":
            routeSetAlt(0);
            break;

        case "SETALV":
            routeSetAlt(3);
            break;

        case "SETHDG":
            routeSetHdg();
            break;

        case "SETCRS":
            routeSetCrs(0);
            break;

        case "APTINF":
            routeShowAPT();
            break;

        case "BGMAP":
            $('#left_panel_container').css('opacity', '.7');
            break;
         //-------------

        //APT
        case "NEAR":
            $("#airportsGrid").dxDataGrid("instance").filter([['Latitude', ">=", planeLat - 1.5], "and", ['Latitude', "<=", planeLat + 1.5], "and", ['Longitude', ">=", planeLon - 1.5], "and", ['Longitude', "<=", planeLon + 1.5]]);

            break;

        case "W-ILS":
            $("#airportsGrid").dxDataGrid("instance").filter([['Latitude', ">=", planeLat - 1.5], "and", ['Latitude', "<=", planeLat + 1.5], "and", ['Longitude', ">=", planeLon - 1.5], "and", ['Longitude', "<=", planeLon + 1.5], "and", ["HasIls", "=", 1]]);

            break;

        case "LIGHT":
            $("#airportsGrid").dxDataGrid("instance").filter([['Latitude', ">=", planeLat - 1.5], "and", ['Latitude', "<=", planeLat + 1.5], "and", ['Longitude', ">=", planeLon - 1.5], "and", ['Longitude', "<=", planeLon + 1.5], "and", ["HasLighting", "=", 1]]);

            break;


        case "FPLAPT":

            $("#airportsGrid").dxDataGrid("instance").columnOption('Icao', 'filterValues', route_getIdentFilter());

            break;

        case "ONMAP":

            airportShowOnMap();

            break;


            

        //-------------

        case "BACK2MAP":
            softkey_menu_MAP();
            break;

        case "BACK2ACFT":
            softkey_menu_ACFT();
            break;

        case "BACK2MENU":
            softkey_menu_MENU();
            break;

        //-------------

        //COMMON
        case "BACK2MAIN":
            switch ($('#main_carousel div.active').index()) {
                case 1:
                    softkey_menu_set(softkeys_PFD);
                    break;
                case 2:
                    softkey_menu_set(softkeys_MAP);
                    break;

                case 0:

                    if ($("#airportTabs").length > 0) softkey_menu_set(softkeys_APT);
                    if ($("#activeRoute").length > 0) softkey_menu_set(softkeys_FPL);
                    if ($("#musicStation").length > 0) softkey_menu_set(softkeys_MUSIC);
                    //if ($("#airportTabs").length > 0) softkey_menu_set(softkeys_APT);

                    break;
            }
            break;            
    }    


    setTimeout(function () {
        softkey_check_optionsareon();
    }, 500);        
}

function softkey_check_optionsareon() {    
    if (softkeys_menu_enabled) {
        var i;
        for (i = 1; i <= 12; i++) {
            var sId = $("#softkey" + i).data('option');

            softkey_check_optionison(sId, i);
        }
    }
    else {
        $(".softkey").removeClass("funct_on");
        $(".menukey").removeClass("funct_on");
    }

    softkey_menu_MUSIC_setLabel(); //Set label for music menu depending on music status
}

function softkey_check_optionison(option, key) {  
    var ison = false;    

    switch (option) {
        //PFD
        case "INMAP":
            ison = $("#inset_left").is(":visible");
            break;

        case "TRMAP":
            ison = $("#background_map").is(":visible");
            break;

        case "WIND":
            ison = $("#inset_wind").is(":visible");            
            break;

        case "REFSPD":
            ison = $("#vspeeds_info_table").is(":visible");
            break;

        case "BEARNG":
            ison = radio_show_adf_bearing;
            break;

        case "ADFINF":
            ison = $("#inset_adf").is(":visible");            
            break;

        case "ADF":
            ison = radio_show_adf_bearing  && parseInt(stored_data["indicators/hsi_bearing_valid"]) == 1 && parseFloat(stored_data["radio/adf1_signal"]) > 0; 
            break;

            
        //case "NAV1":
        //    ison = (parseInt(stored_data["autopilot/navsrc1"]) == 1);
        //    break;

        //case "NAV2":
        //    ison = (parseInt(stored_data["autopilot/navsrc2"]) == 2);
        //    break;

        //case "GPS":
        //    ison = (parseInt(stored_data["autopilot/navgps"]) == 1);            
            break;

        case "ELEVAT":
            ison = $("#inset_elevation").is(":visible") || $("#map_inset_elevation").is(":visible");            
            break;

        case "ENGINE":
            ison = $("#inset_engine").is(":visible");            
            break;

        case "CTRLS":
            ison = $("#inset_controls").is(":visible");            
            break;

        case "INFO":
            ison = $("#lower_box_container").is(":visible");
            break;
        
        //MAP
        case "MCRTLS":
            ison = $(".leaflet-control-container").is(":visible");            
            break;

        case "MPWIN":
            ison = $("#map_wind").is(":visible");                        
            break;

        case "LANDZ":
            ison = landed_map_active;
            break;

        case "MAPSR1":
        case "MAPSR2":
        case "MAPSR3":
        case "MAPSR4":
        case "MAPSR5":
        case "MAPSR6":
        case "MAPSR7":
        case "MAPSR8":
        case "MAPSR9":
        case "MAPSR10":
        case "MAPSR11":
            ison = (selectedMap == (key-1));

            break;

        case "STATUS":
            //ison = (!$('#map_status_box_container').is(':empty'));
            ison = $("#map_status_box_container").is(":visible");
            break;
       
        case "APT":
            ison = map_layer_visible(airport_layer);
            break;

        case "RWY":
            ison = map_layer_visible(runways_layer);
            break;

        case "VOR":
            ison = map_layer_visible(vor_marker);            
            break;

        case "NDB":
            ison = map_layer_visible(ndb_marker);
            break;

        case "ILS":
            ison = map_layer_visible(ils_marker);            
            break;

        case "FIX":
            ison = map_layer_visible(fixes_layer);
            break;

        case "ROUTE":
            ison = map_layer_visible(route_layer);            
            break;

        case "WAYPT":
            ison = map_layer_visible(route_marker);            
            break;

        case "PLANE":
            ison = map_layer_visible(plane_layer);            
            break;

        case "TRACK":
            ison = map_layer_visible(track_layer);            
            break; 

        case "SHDOW":
            ison = (plane && plane._shadow.src.includes("plane_shadow"));
            break;

        case "NORTH":
            ison = planeAlwaysNorth;
            break;

        case "CENTR":
            ison = planeAlwaysCenter;
            break;

        case "MPT":
            ison = mapPointActive;
            break;

        //ACFT       
        case "START":
        case "STRSTP":
            ison = (parseInt(stored_data["engine/running"]) == 1);
            
            break;

        case "STOP":
            ison = (parseInt(stored_data["engine/running"]) == 0);
            break;

        case "BATT":
            ison = (parseInt(stored_data["systems/battery"]) == 1);            
            break;

        case "PITOT":
            ison = (parseInt(stored_data["systems/pitot"]) == 1);                 
            break;

        case "ANTICE":
            ison = (parseInt(stored_data["systems/ice"]) == 1);                 
            break;

        //LIGHTS        
        case "LAND":
            ison = (parseInt(stored_data["lights/landing"]) == 1);
            break;            

        case "TAXI":
            ison = (parseInt(stored_data["lights/taxi"]) == 1);            
            break;

        case "RECOG":
            ison = (parseInt(stored_data["lights/recog"]) == 1);            
            break;

        case "NAV":
            ison = (parseInt(stored_data["lights/nav"]) == 1);            
            break;

        case "BCN":
            ison = (parseInt(stored_data["lights/beacon"]) == 1);            
            break;

        case "STROBE":
            ison = (parseInt(stored_data["lights/strobe"]) == 1);            
            break;

        case "LOGO":
            ison = (parseInt(stored_data["lights/logo"]) == 1);            
            break;

        case "WING":
            ison = (parseInt(stored_data["lights/wing"]) == 1);            
            break;

        case "PANEL":
            ison = (parseInt(stored_data["lights/panel"]) == 1);            
            break;

        case "CABIN":
            ison = (parseInt(stored_data["lights/cabin"]) == 1);            
            break;

        case "ALL":
            ison = (parseInt(stored_data["lights/all"]) == 1);            
            break;
        //-------------

        //FUEL
        case "ALL":
            ison = (parseInt(stored_data["fuel/selector1"]) == 1);             
            break;

        case "LEFT":
            ison = (parseInt(stored_data["fuel/selector1"]) == 2);             
            break;

        case "RIGHT":
            ison = (parseInt(stored_data["fuel/selector1"]) == 3);             
            break;

        case "CENTER":
            ison = (parseInt(stored_data["fuel/selector1"]) == 6);             
            break;

        case "OFF":
            ison = (parseInt(stored_data["fuel/selector1"]) == 0);               
            break;
        //-------------

        //CTRLS
        case "SPOILR":
            ison = (parseInt(stored_data["controls/spoilers"]) == 1);             
            break;

        case "PBRAKE":
            ison = (parseInt(stored_data["controls/parking_brake"]) == 1);             
            break;

        case "ASKID":
            ison = (parseInt(stored_data["controls/antiskid"]) == 1);                     
            break;

        //-------------

        //MENU
        //case "MUSIC":
        //    ison = $("#audio_music_elements").is(":visible");  
        //    break;

        case "MUTE":
            ison = (parseInt(stored_data["sim/music_status"]) == 2);    //document.getElementById('music').muted;
            break;

        case "ON/OFF":
            ison = softkeys_menu_enabled;
            break;

        /*case "OFF":
            ison = !softkeys_menu_enabled;
            break;*/
        //-------------        

        //-------------
        //GROUND

        case "PUSHBK":
            ison = (parseInt(stored_data["ground/pushback_state"]) < 3);
            break;

        //-------------
    }

    if (ison) $("#softkey" + key).addClass("funct_on"); else $("#softkey" + key).removeClass("funct_on"); 
}

function softkey_caption(option) {   
    switch (option) {
        //SETTINGS
        case "FULLSCR":
            return "FSCR";

        case "ADFTRF":
            return '<img src="/img/swap.png" style="width: 2vw;" />';

        case "SETTNG":
            return '<span class="fa fa-gear"></span>'

        //MAP
        case "LANDZ":
            return "LAND";

        //COMMON
        case "BACK2MAP":
        case "BACK2MENU":
        case "BACK2ACFT":
        case "BACK2MAIN":
            return "BACK";

        //PUSHBACK
        case "PBACKL":
            return "&#11129;";
        case "PBACKS":
            return "&#10515;";
        case "PBACKR":
            return "&#11128;";

        default:
            return option;
    }

    return false;
}

function map_layer_toggle(layer) {
    if (layer._map) map.removeLayer(layer); else map.addLayer(layer);
}

function map_layer_visible(layer) {
    return (layer._map) ? true : false;
}