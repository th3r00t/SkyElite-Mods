/// <reference path="sksc_performance.js" />
/// <reference path="sksc_performance.js" />
var url_GetAirports = '/Map/GetAirports';
var url_GetRunways = '/Map/GetRunways'
var url_GetIls = '/Map/GetIls';
var url_GetVorDme = '/Map/GetVorDme';
var url_GetNdb = '/Map/GetNdb';
var url_GetFixes = '/Map/GetFixes';
var url_GetBoundary = '/Map/GetBoundary';
var url_GetRouteWaypoints = '/Data/GetRouteWaypoints';
var url_home = '/';

var url_Aircraft = '/Aircraft';
var url_Airports = '/Airports';
var url_Positions = '/Positions';
var url_Fpl = '/Fpl';
var url_View = '/View';
var url_Start = '/Start';
var url_Donate = '/Pay/Donate';
var url_BuyPRO = '/Pay/BuyPRO';
var url_Config = '/Config';
var url_SkyElite = '/Aviator';
var url_GetFullAirportData = '/Map/GetFullAirportData';
var url_View = '/View';
var url_Activate = '/Activate/StorePurchase';

const engines = {
        N1: 'N1',
        EPR: 'EPR',
        TRQ: 'TRQ',
        TRQ_NM: 'NM',
        TRQ_LBFT: 'LBFT',
        MAP: 'MAP',

        EGT: 'EGT',
        CHT: 'CHT',
        N2: 'N2',
        ITT: 'ITT',
        PROP: 'PROP',

        OILP: 'OILP',
        OILT: 'OILT',
    }

var metartaf = { METAR: "", TAF: "", metarTR: "", tafTR: "" };

/*$(document).ready(function () {
   
});*/


function getMetar(icao) {
    var url = "https://avwx.rest/api/metar/" + icao + "?options=&format=json&onfail=cache&token=" + avwxToken;

    metartaf.METAR = "";
    metartaf.TAF = "";
    metartaf.metarTR = "";
    metartaf.tafTR = "";

    if ($("#routeFormWeather").is(":visible")) $("#routeFormWeather").dxForm("instance").option("formData", metartaf);

    $.get(url, function (data) {
        console.log("getMetar ", data);

        if (data) {
            metartaf.METAR = data.raw;

            if ($("#routeFormWeather").is(":visible") && data) $("#routeFormWeather").dxForm("instance").option("formData", metartaf);

            if (data.raw) {

                $.ajax({
                    type: "POST",
                    url: "https://avwx.rest/api/parse/metar?options=translate&format=json&token=" + avwxToken,
                    data: data.raw,
                    success: function (response) {
                        console.log("/parse/metar", response); // server response

                        var lista = recursiveIteration(response.translations);
                        console.log("lista1", lista);

                        metartaf.metarTR = lista;

                        //Swal.fire('METAR', metartaf.metarTR);
                    }
                });
            }
        }
    });

    url = "https://avwx.rest/api/taf/" + icao + "?options=&format=json&onfail=cache&token=" + avwxToken;

    $.get(url, function (data) {
        console.log("getTAF ", data);

        if (data) {
            metartaf.TAF = data.raw;

            if ($("#routeFormWeather").is(":visible") && data) $("#routeFormWeather").dxForm("instance").option("formData", metartaf);

            if (data.raw) {

                $.ajax({
                    type: "POST",
                    url: "https://avwx.rest/api/parse/taf?options=translate&format=json&token=" + avwxToken,
                    data: data.raw,
                    success: function (response) {
                        console.log("/parse/taf", response); // server response

                        var lista = recursiveIteration(response.translations);
                        console.log("lista2", lista);

                        metartaf.tafTR = lista;

                        //Swal.fire('TAF', metartaf.tafTR);
                    }
                });
            }
        }

    });
}

function daemonCheker() {
    if (!IsVersionPro) {
        if ($("#watermark").length == 0 || $("#watermark").is(":hidden")) {
            location.href = "/Home/DemoExpired";
        }
    }
}

function recursiveIteration(object, prefix) {
    var listo = "";


    for (var property in object) {
        if (object.hasOwnProperty(property)) {
            if (typeof object[property] == "object") {
                var pr = prefix ? prefix + "/" + property : property;

                listo += recursiveIteration(object[property], pr);
            } else {
                if (object[property]) {
                    //lista[property] = object[property];
                    //console.log(property, object[property]);

                    var key = property;
                    if (prefix) key = prefix + "/" + property;
                    var value = object[property];

                    listo += "<strong>" + key.charAt(0).toUpperCase() + key.slice(1) + "</strong>: " + value + "<br />";
                }
            }
        }
    }

    return listo;
}

function checkFrequencySize(data) {
    if (String(data.Item1).length < 6) return ((Math.round((data.Item1 * 10) / 25) * 25) / 1000).toFixed(3);

    return (data.Item1 / 1000).toFixed(3);
}

function fullscreen() {
    var element = document.documentElement;
    if (element.requestFullscreen) element.requestFullscreen();
    else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
    else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
    else if (element.msRequestFullscreen) element.msRequestFullscreen();

    displayRefresh();
}

function zoom_in() {
    session_zoom += .05;
    localStorage.setItem("SKSC_HTML_ZOOM", session_zoom);
    $("html").css("zoom", session_zoom);
    //$("html").css("-moz-transform", "scale(" + session_zoom + ")");

    displayRefresh();
}

function zoom_out() {
    session_zoom -= .05;
    localStorage.setItem("SKSC_HTML_ZOOM", session_zoom);
    $("html").css("zoom", session_zoom);
    //$("html").css("-moz-transform", "scale(" + session_zoom + ")");

    displayRefresh();
}

function zoom_normal() {
    session_zoom = 1;
    localStorage.setItem("SKSC_HTML_ZOOM", session_zoom);
    $("html").css("zoom", session_zoom);
    //$("html").css("-moz-transform", "scale(" + session_zoom + ")");

    displayRefresh();
}

function displayRefresh() {
    if (isPFD) {
        indicator.resize();
        refreshMapIn(1);
    }
}

function performPRELAPT(icao) {
    sendXPCommand("sim/operation/toggle_flight_config");

    setTimeout(function () {
        sendXP_PRELAPT(icao);
        sendXPCommand("sim/operation/toggle_flight_config");
    }, 1000);
}

function musicTogglePause() {
    sendMusic("toggle");

    /*if (!document.getElementById('music').muted) {
        document.getElementById('music').muted = true;
        //$(this).text("OFF");
        $("#music_status").css("background-color", "gold");
    } else {
        document.getElementById('music').muted = false;
        //$(this).text("ON");
        $("#music_status").css("background-color", "");
    }*/
}

function getLoadPanelInstance() {
    return $("#loadPanel").dxLoadPanel("instance");
}

function showHSISource(do_setFocusedRouteRow = true) {
    if (isPFD) {
        var nav = function_hsisource_value.labels[stored_data[function_hsisource_value.dataref]];

        if (typeof indicator != "undefined") {
            indicator.updateHSISource(nav);

            if (do_setFocusedRouteRow) {
                setTimeout(function () {
                    setFocusedRouteRow();
                }, 1000);
            }
        }
    }
}

function StringIsBoolean(str) {
    //console.log("StringIsBoolean", str)

    if (!str) return true;

    return str.toLowerCase() == "true";
}

function radioReseBugDisplay() {
    $(".ui-keyboard-preview").removeClass('com1_info'); //list all possible
}   

function radioEditEnable(ids, com_dataref, display_class, title, maxLength) {
    $(ids).click(function (event) {        
        radio_selected_dataref = com_dataref;

        if (!maxLength) maxLength = 6;

        $('#radio-keyboard').getkeyboard().options.maxLength = maxLength

        $('#radio-keyboard').val(stored_data[com_dataref]);
        $('#radio-keyboard').getkeyboard().reveal();

        $(".ui-keyboard").prepend("<h5 style='color:white;'>" + title + "</h5>");

        radioReseBugDisplay();

        $(".ui-keyboard-preview").addClass(display_class);
    });
}


//New timeOfDaySlider approach
function setTimeOfDay(value) {
    /*if (typeof formatTimeSlider === 'function') {        
        if(!_mouseisdown) $(".timeOfDaySlider").val(stored_data["sim/time/local_time_sec"]);
        $('.timeOnSim').text(formatTimeSlider($(".timeOfDaySlider").val()));
    }*/

    if (typeof indicator != "undefined") {
        var local_time_sec = parseFloat(stored_data["sim/local_time"]);
        var zulu_time_sec = parseFloat(stored_data["sim/zulu_time"]);
        var date_sys = new Date();

        indicator.updateTimeUtc(toHHMMSS(zulu_time_sec));
        indicator.updateTimeLocal(toHHMMSS(local_time_sec));
        indicator.updateTimeSystem(date_sys.toLocaleString('en-GB').substr(11, 9));
    }
}

function toDDHHMMSS(s) {
    var fm = [
        Math.floor(Math.floor(Math.floor(s / 60) / 60) / 24) % 24,      //DAYS
        Math.floor(Math.floor(s / 60) / 60) % 60,                          //HOURS
        Math.floor(s / 60) % 60,                                                //MINUTES
        Math.floor(s % 60)                                                                     //SECONDS
    ];
    return $.map(fm, function (v, i) { return ((v < 10) ? '0' : '') + v; }).join(':');
}

function toHHMMSS(s) {
    if (s) {
        var fm = [
            //Math.floor(Math.floor(Math.floor(s / 60) / 60) / 24) % 24,      //DAYS
            Math.floor(Math.floor(s / 60) / 60) % 60,                          //HOURS
            Math.floor(s / 60) % 60,                                                //MINUTES
            Math.floor(s % 60)                                                                     //SECONDS
        ];
        return $.map(fm, function (v, i) { return ((v < 10) ? '0' : '') + v; }).join(':');
    }

    return "--:--:--";
}

function formatTimeSlider(value, send) {    
    var local_time_sec = stored_data["sim/time/local_time_sec"];
    var zulu_time_sec = stored_data["sim/time/zulu_time_sec"];

    if (send) {
        var time_diff = value - local_time_sec;
        console.log("sim/time/zulu_time_sec", zulu_time_sec + time_diff)
        sendXPSetValue("sim/time/zulu_time_sec", zulu_time_sec + time_diff);
    }

    if (local_time_sec && local_time_sec) {
        return "LOCAL " + toHHMMSS(local_time_sec) + " - UTC " + toHHMMSS(zulu_time_sec);
    }
    else
        return "Loading...";
}

function dayOfYear(now) {
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = now - start;
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);

    return day - 1;
}



function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}   

function setXPDay() {
    var days = stored_data["sim/time/local_date_days"];
    if (days) {
        var doy = addDays(new Date(new Date().getFullYear() + '-01-01'), days);

        //console.log(days, doy);

        $("#xp_day").dxDateBox("instance").option("value", doy);
    }
}


function dateBox_valueChanged(data) {
    var days = stored_data["sim/time/local_date_days"];
    var day = dayOfYear(new Date(data.value));

    if (days && days != day) {

        console.log('Day of year: ' + day);

        sendXPSetValue("sim/time/local_date_days", day);
    }
}

function radians_to_degrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}

function positiveOrHiypens(val) {
    return positiveOrSomething(val, "---");
}

function positiveOrSomething(val, someval) {
    return (val && val >= 0) ? val : someval;
}

//NAV CODES:index
/*
 Returns bit flags with the following meaning:
BIT7: 0= VOR  1= Localizer
BIT6: 1= glideslope available
BIT5: 1= no localizer backcourse
BIT4: 1= DME transmitter at glide slope transmitter
BIT3: 1= no nav signal available
BIT2: 1= voice available
BIT1: 1 = TACAN available
BIT0: 1= DME available
 */

function nav_code_has_gs(val) {
    var nc = nav_codes(val);
    return nc.length >= 8 ? (nc[6] == 1) : false;
}

function nav_codes(val) {
    return reverseString(dec2bin(val));
}

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

function reverseString(str) {
    return str.split("").reverse().join("");
}

function hexToRgbA(hex, trsp) {
    var c;

    hex = colorToHex(hex);

    trsp = trsp || 1;

    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + trsp + ')';
    }
    throw new Error('Bad Hex');
}

function colorToRGBA(color, trsp) {

    trsp = trsp || 1;

    var cvs, ctx;
    cvs = document.createElement('canvas');
    cvs.height = 1;
    cvs.width = 1;
    ctx = cvs.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    return ctx.getImageData(0, 0, 1, 1).data;
}

function byteToHex(num) {
    // Turns a number (0-255) into a 2-character hex number (00-ff)
    return ('0' + num.toString(16)).slice(-2);
}

function colorToHex(color) {
    var rgba, hex;
    rgba = colorToRGBA(color);
    hex = [0, 1, 2].map(
        function (idx) { return byteToHex(rgba[idx]); }
    ).join('');
    return "#" + hex;
}

function obj_subtract(r1, r2) {
    return Object.keys(r1).reduce((a, k) => {
            a[k] = r1[k] - r2[k];
            return a;      
    }, {});
}

function setTimered(func, wait, times) {
    var interv = function (w, t) {
        return function () {
            if (typeof t === "undefined" || t-- > 0) {
                //setTimeout(interv, w);

                try {
                    func.call(null);
                }
                catch (e) {                    
                    t = 0;
                    throw e.toString();
                }

                setTimeout(interv, w); //Moved to after the function call
            }
        };
    }(wait, times);

    setTimeout(interv, wait);
};

function tugHeading(bearing) {
    var hdg = parseFloat(stored_data["indicators/heading"]);
    var tugH = ((hdg + bearing) % 360);

    if (tugH > 180) tugH -= 360;

    console.log("TUG", Math.round(tugH));

    return 11930465 * Math.round(tugH);
}