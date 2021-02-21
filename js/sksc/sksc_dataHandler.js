var total_flight_time_sec = -1;
var app_status = 0;
var rev_status = 0;
var gs_status = 0;
var stored_data = {};

var fps_last = 0;
var fps_total =0;
var fps_count =0;
var fps_min =0;
var fps_max =0;
var fps_avg = 0;

var ils_status = ""; //.20

var total_flight_time_sec_last = 0;
var total_flight_time_sec_diff = 0;

var lastPlaneName = "";

var _flap_discovery = -1;

var _experimental_vs_descend_timer = null;

var _sim_on_ground;

function fps_reset() {
    fps_last = 0;
    fps_total = 0;
    fps_count = 0;
    fps_min = 0;
    fps_max = 0;
    fps_avg = 0;
}

function displayPlaneName() {
    if (IsVersionPro) {
        if (stored_data["sim/time/is_in_replay"] == 1) {
            $("#planename").html("REPLAY MODE&nbsp;&nbsp;");
        }
        else {
            if (stored_data["sim/time/paused"] == 1) {
                $("#planename").html("PAUSED&nbsp;&nbsp;");
            }
            else {
                $("#planename").html(lastPlaneName + "&nbsp;&nbsp;");
            }
        }
    }
    else {
        $("#planename").html("DEMO VERSION - LIMTED TO 10 MINUTES &nbsp;&nbsp;");
    }
}

String.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}

String.prototype.padr = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = s + "0" ; }
    return s;
}

function dataHandler(dato) {  
    //console.log("dataHandler", dato);

    var handlethis = false;

    if (dato && dato.Function == "RESET") {
        location.href = url_home;
        return false;
    }

    if (dato && dato.Function) {        
        handlethis = stored_data[dato.Function] != dato.DataDef.DataValue;        
        stored_data[dato.Function] = dato.DataDef.DataValue;
    }

    if (dato.Function == "aircraft/parkingstate") {
        var tx = stored_data["aircraft/title"];

        if (parseInt(dato.DataDef.DataValue) == 1 || !tx || tx.length == 0) {           
            setPFDOff();              
        }
        else {
            setPFDOn();                    
        }
    }    

    if (handlethis) {       
        if (dato.Category == "autopilot") autoPilotHandler(dato); 


        dataRefHandler(dato);            
    }

    if (!IsVersionPro) daemonCheker();
}

function autoPilotHandler(dato) {
    //console.log("autoPilotHandler", dato);

    //is("[name]")  [data-action="toggle"]

    var von = parseFloat(dato.ValueOn);
    var voff = parseFloat(dato.ValueOff);
    var ison = false;

    if (von) ison = parseFloat(dato.DataDef.DataValue) == von; else
        if (voff) ison = parseFloat(dato.DataDef.DataValue) != voff; else
            ison = parseFloat(dato.DataDef.DataValue) > 0;

    if (ison) {
        $('*[data-function="' + dato.Function + '"][lighton]').addClass("funct_on");
    }
    else {
        $('*[data-function="' + dato.Function + '"][lighton]').removeClass("funct_on");
    }   
}

function dataRefHandler(dato) {
    //console.log("dataRefHandler", dato);
    
    switch (dato.Function) {
        //sim
        //case "sim/music_status":
        //    console.log("music_status", dato.DataDef.DataValue);
        //    break;


        case "sim/sim_on_ground":            
            //If was on air and then is on ground
            if (_sim_on_ground == 0 && parseInt(dato.DataDef.DataValue) == 1) {   
                if (!landed_map_active) {
                    setLandedMap();
                }
            }

            //If was on ground and then is on air again
            if (_sim_on_ground == 1 && parseInt(dato.DataDef.DataValue) == 0) {
                if (landed_map_active) {
                    setDefaultMap();
                }                
            }

            _sim_on_ground = parseInt(dato.DataDef.DataValue);

            break;

        case "sim/sim_exit":

            if (parseInt(dato.DataDef.DataValue) >= 1) demoExpired();

            break;

        case "sim/total_flight_time":
            //console.log("total_flight_time", dato.DataDef.DataValue);

            $("#time_flight").html(toHHMMSS(parseInt(dato.DataDef.DataValue)))

            break;

        case "sim/time_on_air":
            //console.log("total_flight_time", dato.DataDef.DataValue);

            $("#time_onair").html(toHHMMSS(parseInt(dato.DataDef.DataValue)))

            break;

        case "sim/local_time":
            $("#time_local").html(toHHMMSS(parseInt(dato.DataDef.DataValue)));
            break;

        case "sim/zulu_time":
            $("#time_zulu").html(toHHMMSS(parseInt(dato.DataDef.DataValue)));
            break;

        //indicators
        case "indicators/bank":
            var roll = (dato.DataDef.DataValue) * -1; //radians_to_degrees

            if (typeof indicator != "undefined") {
                indicator.updateRollAngle(roll);
            }

            break;

        case "indicators/pitch":       
            var pitch = (dato.DataDef.DataValue) * -1; //radians_to_degrees

            if (typeof indicator != "undefined") {
                indicator.updatePitchAngle(pitch);
            }

            break;

        case "indicators/heading_mag":
            var heading = parseFloat(dato.DataDef.DataValue); //radians_to_degrees(dato.DataDef.DataValue);// * -1;

            if (typeof indicator != "undefined") {
                indicator.updateHeading(heading);
            }

            break;

        case "indicators/baro":
            if (typeof indicator != "undefined") {
                indicator.updateBarometer(parseFloat(dato.DataDef.DataValue).toFixed(2));
            }

            break;

        case "indicators/gsi_valid":

            //Will comment this later
            if (typeof indicator != "undefined") {
                $("#vdef_dot_gauge").toggle(parseInt(dato.DataDef.DataValue) != 0);
                $("#hdef_dot_gauge").toggle(parseInt(dato.DataDef.DataValue) != 0);
            }

            break;

        case "indicators/gsi":

            if (typeof indicator != "undefined") {
                vdef_dot_gauge.value(parseFloat(dato.DataDef.DataValue));
            }

            break;

        case "indicators/cdi":

            if (typeof indicator != "undefined") {
                hdef_dot_gauge.value(parseFloat(dato.DataDef.DataValue));
            }

            break;

        /*case "indicators/hsi_distance":

            if (typeof indicator != "undefined") {
                if (parseFloat(dato.DataDef.DataValue) > 0)
                    indicator.updateHSISourceInfo(parseFloat(dato.DataDef.DataValue).toFixed(2));
                else
                    indicator.updateHSISourceInfo(" --- ");
            }

            break;*/

        case "indicators/airspeed":
            if (typeof indicator != "undefined") {
                indicator.updateAirSpeed(dato.DataDef.DataValue);
            }
            break;

        case "indicators/airspeed_true":
            if (typeof indicator != "undefined") {
                indicator.updateTas(dato.DataDef.DataValue);
            }
            break;

        case "indicators/altitude":
            if (typeof indicator != "undefined") {
                indicator.updateAltitude(dato.DataDef.DataValue);
            }

            if (typeof elevation_flot != "undefined") {
                flot_setPlaneElevation(dato.DataDef.DataValue);
            }
            break;

        case "indicators/vs":
            if (typeof indicator != "undefined") {
                indicator.updateVS(dato.DataDef.DataValue);
            }
            break;

        case "indicators/oat":            
            $("#oat").html(parseFloat(dato.DataDef.DataValue).toFixed(1));
            break;

        case "indicators/gs":
            $("#gs").html(parseInt(dato.DataDef.DataValue)); //parseFloat(dato.DataDef.DataValue).toFixed(1)
            break;

        //Disabled and replaced by agl
        //case "indicators/xpdr1":
        //    $("#xpdr").html(dato.DataDef.DataValue);
        //    break;

        case "indicators/agl":
            if (parseInt(stored_data["sim/sim_on_ground"]) > 0) {
                $("#agl").html("<small>ON GROUND</small>");

                $("#agl_box").css("color", "green");
                $("#agl_box").css("box-shadow", "0 0 10px 5px green");
                $("#agl_box").css("background-color", "");

                $("#altitude").css("box-shadow", "");
                $("#altitude").css("color", "powderblue");
            }
            else {
                $("#agl_box").css("color", "");
                $("#altitude").css("color", "powderblue");

                $("#agl").html(parseInt(dato.DataDef.DataValue)); //parseFloat(dato.DataDef.DataValue).toFixed(1) //Math.round(parseFloat(dato.DataDef.DataValue) / 10) * 10

                switch (true) {
                    case parseFloat(dato.DataDef.DataValue) <= 250:
                        $("#agl_box").css("box-shadow", "0 0 10px 5px orangered");
                        $("#agl_box").css("background-color", "orangered");

                        $("#altitude").css("box-shadow", "0 0 10px 5px orangered");
                        $("#altitude").css("color", "orangered");
                        break;

                    case parseFloat(dato.DataDef.DataValue) <= 500:                        
                        $("#agl_box").css("box-shadow", "0 0 10px 5px orangered");
                        $("#agl_box").css("background-color", "");

                        $("#altitude").css("box-shadow", "0 0 10px 5px orangered");
                        $("#altitude").css("color", "orangered");
                        break;

                    case parseFloat(dato.DataDef.DataValue) <= 1000:
                        $("#agl_box").css("box-shadow", "0 0 10px 5px gold");
                        $("#agl_box").css("background-color", "");

                        $("#altitude").css("box-shadow", "0 0 10px 5px gold");
                        $("#altitude").css("color", "gold");
                        break;

                    case parseFloat(dato.DataDef.DataValue) <= 1500:
                        $("#agl_box").css("box-shadow", "0 0 10px 5px khaki");
                        $("#agl_box").css("background-color", "");

                        $("#altitude").css("box-shadow", "0 0 10px 5px khaki");
                        $("#altitude").css("color", "kaki");
                        break;

                    default:
                        $("#agl_box").css("box-shadow", "")
                        $("#agl_box").css("background-color", "")
                        $("#agl_box").css("color", "");

                        $("#altitude").css("box-shadow", "");
                        break;
                }
            }

            break;

        case "indicators/gear_0":
            //console.log("gear_0", dato.DataDef.DataValue);

            switch (true) {
                case parseFloat(dato.DataDef.DataValue) <= 0:
                    $("#landing_gear_0").css("background-color", "");
                    $("#landing_gear_0").html("&#8213;");
                    break;
                case parseFloat(dato.DataDef.DataValue) >= .5:
                    $("#landing_gear_0").css("background-color", "mediumseagreen");
                    $("#landing_gear_0").html("&#9881;");
                    break;
                default:
                    $("#landing_gear_0").css("background-color", "gold");
                    $("#landing_gear_0").html("&#8661;");
                    break;
            }
            break;

        case "indicators/gear_1":
            switch (true) {
                case parseFloat(dato.DataDef.DataValue) <= 0:
                    $("#landing_gear_1").css("background-color", "");
                    $("#landing_gear_1").html("&#8213;");
                    break;
                case parseFloat(dato.DataDef.DataValue) >= .5:
                    $("#landing_gear_1").css("background-color", "mediumseagreen");
                    $("#landing_gear_1").html("&#9881;");
                    break;
                default:
                    $("#landing_gear_1").css("background-color", "gold");
                    $("#landing_gear_1").html("&#8661;");
                    break;
            }
            break;

        case "indicators/gear_2":
            switch (true) {
                case parseFloat(dato.DataDef.DataValue) <= 0:
                    $("#landing_gear_2").css("background-color", "");
                    $("#landing_gear_2").html("&#8213;");
                    break;
                case parseFloat(dato.DataDef.DataValue) >= .5:
                    $("#landing_gear_2").css("background-color", "mediumseagreen");
                    $("#landing_gear_2").html("&#9881;");
                    break;
                default:
                    $("#landing_gear_2").css("background-color", "gold");
                    $("#landing_gear_2").html("&#8661;");
                    break;
            }
            break;

        //autopilot
        case "indicators/hsi_bearing":
        case "indicators/obs1":
        case "indicators/obs2":                
        case "indicators/nav1_cdi":
        case "indicators/nav2_cdi":

            updateCRS();

            break;

        case "radio/adf1_active":
        case "radio/adf1_stby":
        case "radio/adf1_signal":
        case "indicators/hsi_bearing_valid":            

            $("#adf_active").html((parseFloat(stored_data["radio/adf1_active"]) / 1000).toFixed(1));
            $("#adf_stby").html((parseFloat(stored_data["radio/adf1_stby"]) / 1000).toFixed(1));
            if (parseInt(stored_data["radio/adf1_signal"]) > 0) {
                $("#adf_bearing").html(Math.round(parseFloat(stored_data["indicators/hsi_bearing"])) + "&deg;");
            }
            else {
                $("#adf_bearing").html("<small style='font-size:.8vw;'>NO SIGNAL</small>");
            }

            updateCRS();
           
            break;

        case "gps/active_fpl":
        case "autopilot/navsrc1":
        case "autopilot/navgps":

            //Disabled due some issues: no signals, multi-browser, flickering indicators sometimes
            /*setTimeout(function () {
                sendFunction("indicators/obs", "sync", "");
                updateCRS();
            }, 2000)            */

            getDistanceInfo();
            showActiveTargetInfo();

            if (typeof indicator != "undefined") {
                showActiveHSIInfo();
            }

            break;

        case "autopilot/heading_selected":
            //console.log(dato.Function, pitch);

            if (typeof indicator != "undefined") {
                indicator.updateHDG(parseFloat(dato.DataDef.DataValue));
            }

            break;

        case "autopilot/altitude_selected":
            //console.log(dato.Function, pitch);

            if (typeof indicator != "undefined") {
                indicator.updateSelectedAltitude(parseFloat(dato.DataDef.DataValue));
            }

            break;

        case "autopilot/vs_selected":
            //console.log(dato.Function, pitch);

            if (typeof indicator != "undefined") {
                indicator.updateVSBug(parseFloat(dato.DataDef.DataValue));
            }

            break;

        case "autopilot/ias_selected":
            //console.log(dato.Function, pitch);

            if (typeof indicator != "undefined") {
                indicator.updateSelectedAirSpeed(parseFloat(dato.DataDef.DataValue));
            }

            break;


        case "autopilot/fd":

            if (typeof indicator != "undefined") {
                indicator.updateFDVisible(dato.DataDef.DataValue > 0);
            }         

            break;

        case "autopilot/fd_pitch":

            if (typeof indicator != "undefined") {
                var pitch = (dato.DataDef.DataValue) * -1;  //radians_to_degrees
                indicator.updateFDPitch(pitch);
            }

            if (typeof elevation_flot != "undefined") {
                flot_setPlanePitch();
            }
            
            break;

        case "autopilot/fd_bank":

            if (typeof indicator != "undefined") {
                var bank = (dato.DataDef.DataValue) * -1; //radians_to_degrees
                indicator.updateFDRoll(bank);            
            }            

            break;        

        //gps
        case "gps/wp_next_id":
            //if (typeof indicator != "undefined") {
            //    indicator.updateHSISource(dato.DataDef.DataValue);
            //}

            getDistanceInfo();
            showTargetInfo(elite_target_info);
            setFocusedRouteRow();

            break;

        //radio & gps info
        case "gps/wp_distance":        
        case "gps/wp_ete":

        case "radio/nav1_name":
        case "radio/nav1_distance":
        case "radio/nav1_ete":

        case "radio/nav2_name":
        case "radio/nav2_distance":
        case "radio/nav2_ete":         

            getDistanceInfo();           
            showTargetInfo(elite_target_info);

            break;

        case "gps/fpl_has_changed":
            route_DrawRoute();
            break;        

        //radio nav
        case "radio/nav1_stby":
            $("#nav1_stby").html(parseFloat(dato.DataDef.DataValue).toFixed(2));
            break;

        case "radio/nav1_active":
            $("#nav1_active").html(parseFloat(dato.DataDef.DataValue).toFixed(2));

            //Disabled due some issues: no signals, multi-browser, flickering indicators sometimes
            /*setTimeout(function () {
                sendFunction("indicators/obs", "sync", "");
                updateCRS(); 
            }, 2000);            */

            getDistanceInfo();
            showActiveTargetInfo(); 

            break;

        case "radio/nav2_stby":
            $("#nav2_stby").html(parseFloat(dato.DataDef.DataValue).toFixed(2));
            break;

        case "radio/nav2_active":
            $("#nav2_active").html(parseFloat(dato.DataDef.DataValue).toFixed(2));

            //Disabled due some issues: no signals, multi-browser, flickering indicators sometimes
            /*setTimeout(function () {
                sendFunction("indicators/obs", "sync", "");
                updateCRS();
            }, 2000);*/

            getDistanceInfo();
            showActiveTargetInfo(); 
            break;

        //radio com
        case "radio/com1_stby":
            $("#com1_stby").html(parseFloat(dato.DataDef.DataValue).toFixed(3));
            break;

        case "radio/com1_active":
            $("#com1_active").html(parseFloat(dato.DataDef.DataValue).toFixed(3));
            break;

        case "radio/com2_stby":
            $("#com2_stby").html(parseFloat(dato.DataDef.DataValue).toFixed(3));
            break;

        case "radio/com2_active":
            $("#com2_active").html(parseFloat(dato.DataDef.DataValue).toFixed(3));
            break;

        case "radio/com_active":
            if (typeof musicControl === 'function')
                musicControl(dato.Value);

            //if (dato.Value) {
            //    $(".com1_info").css("background-color", "orangered");
            //}
            //else {
            //    $(".com1_info").css("background-color", "");
            //}

        //controls
        case "controls/throttle":
            $("#throttle_status").html(Math.round(parseFloat(dato.DataDef.DataValue) * 100) + "%");

            //throttle_status indicator red or gold when activated
            switch (true) {
                case parseFloat(dato.DataDef.DataValue) < 0:
                    $("#throttle_status").css("background-color", "gold");
                    $("#throttle_status").css("color", "#424242");
                    break;

                case parseFloat(dato.DataDef.DataValue) >= .95:
                    $("#throttle_status").css("background-color", "orangered");
                    $("#throttle_status").css("color", "");
                    break;

                case parseFloat(dato.DataDef.DataValue) >= .91:
                    $("#throttle_status").css("background-color", "gold");
                    $("#throttle_status").css("color", "#424242");
                    break;

                default:
                    $("#throttle_status").css("background-color", "");
                    $("#throttle_status").css("color", "");
                    break;
            } 

            break;

        case "controls/prop":
            $("#prop_status").html(Math.round(parseFloat(dato.DataDef.DataValue) * 100) + "%");

            //prop_status indicator red or gold when activated
            switch (true) {
                case parseFloat(dato.DataDef.DataValue) <= .4:
                    $("#prop_status").css("background-color", "orangered");
                    $("#prop_status").css("color", "");
                    break;

                case parseFloat(dato.DataDef.DataValue) <= .6:
                    $("#prop_status").css("background-color", "gold");
                    $("#prop_status").css("color", "#424242");
                    break;

                default:
                    $("#prop_status").css("background-color", "");
                    $("#prop_status").css("color", "");
                    break;
            } 

            break;

        case "controls/mixture":
            $("#mixture_status").html(Math.round(parseFloat(dato.DataDef.DataValue) * 100) + "%");

            //mixture indicator red or gold when activated
            switch (true) {
                case parseFloat(dato.DataDef.DataValue) <= .4:
                    $("#mixture_status").css("background-color", "orangered");
                    $("#mixture_status").css("color", "");
                    break;

                case parseFloat(dato.DataDef.DataValue) <= .6:
                    $("#mixture_status").css("background-color", "gold");
                    $("#mixture_status").css("color", "#424242");
                    break;

                default:
                    $("#mixture_status").css("background-color", "");
                    $("#mixture_status").css("color", "");
                    break;
            } 

            break;

        case "controls/parking_brake":
            $("#pbrake_status").html(Math.round(parseFloat(dato.DataDef.DataValue) * 100) + "%");

            //Spoiler indicator red or gold when activated
            switch (true) {
                case parseFloat(dato.DataDef.DataValue) >= .50:
                    $("#pbrake_status").css("background-color", "orangered");
                    $("#pbrake_status").css("color", "");
                    break;

                case parseFloat(dato.DataDef.DataValue) >= .1:
                    $("#pbrake_status").css("background-color", "gold");
                    $("#pbrake_status").css("color", "#424242");
                    break;

                default:
                    $("#pbrake_status").css("background-color", "");
                    $("#pbrake_status").css("color", "");
                    break;
            } 

            break;

        case "controls/spoilers":
            $("#spoiler_status").html(Math.round(parseFloat(dato.DataDef.DataValue) * 100) + "%");

            //Spoiler indicator gold when activated
            switch (true) {
                case parseFloat(dato.DataDef.DataValue) >= .50:
                    $("#spoiler_status").css("background-color", "gold");
                    $("#spoiler_status").css("color", "#424242");
                    break;

                case parseFloat(dato.DataDef.DataValue) >= .1:
                    $("#spoiler_status").css("background-color", "gold");
                    $("#spoiler_status").css("color", "#424242");
                    break;

                default:
                    $("#spoiler_status").css("background-color", "");nav1
                    $("#spoiler_status").css("color", "");
                    break;
            }      

            break;

        case "controls/flaps":
            $("#flaps_status").html(Math.round(parseFloat(dato.DataDef.DataValue) * 100) + "%");

            //Flaps indicator gold when activated
            switch (true) {
                case parseFloat(dato.DataDef.DataValue) >= .50:
                    $("#flaps_status").css("background-color", "gold");
                    $("#flaps_status").css("color", "#424242");
                    break;

                case parseFloat(dato.DataDef.DataValue) >= .1:
                    $("#flaps_status").css("background-color", "gold");
                    $("#flaps_status").css("color", "#424242");
                    break;

                default:
                    $("#flaps_status").css("background-color", "");
                    $("#flaps_status").css("color", "");
                    break;
            }       

            if (typeof indicator != "undefined") {
                indicator.updateFlaps(parseFloat(dato.DataDef.DataValue));
            }

            break;

        case "controls/rudder_trim":
            $("#rudder_status").html(parseFloat(dato.DataDef.DataValue).toFixed(1) +" &deg;");
            break;

        case "controls/aileron_trim":
            $("#aileron_status").html(parseFloat(dato.DataDef.DataValue).toFixed(1) + " &deg;");

            break;

        case "controls/elevator_trim":
            $("#elevator_status").html(parseFloat(dato.DataDef.DataValue).toFixed(1) + " &deg;");
            break;

        //Engines
        case "engine/engine_type":

            //Logic to enable propeller or jet engine indicators
            switch (parseInt(dato.DataDef.DataValue))
            {
                case 1: //JET
                    $("#engine_prop_table").hide();
                    $("#engine_jet_table").show();

                    break;

                default:
                    $("#engine_prop_table").show();
                    $("#engine_jet_table").hide();

                    break;
            }

            break;

        case "engine/torque":
            $("#trq_status").html(positiveOrHiypens(parseFloat(dato.DataDef.DataValue).toFixed(0)));
            break;

        case "engine/torque_max":             

            //Removed from there to avoid this to happen every torque value change... too much load
            /*if (parseFloat(dato.DataDef.DataValue) <= 0) {
                $("#engine_prop_table").hide();
                $("#engine_jet_table").show();
            }
            else {
                $("#engine_prop_table").show();
                $("#engine_jet_table").hide();
            }*/

            switch (true) {
                case parseFloat(dato.DataDef.DataValue) >= 100:
                    $("#trq_status").css("background-color", "orangered");
                    $("#trq_status").css("color", "");
                    break;

                case parseFloat(dato.DataDef.DataValue) >= 99 :
                    $("#trq_status").css("background-color", "gold");
                    $("#trq_status").css("color", "#424242");
                    break;

                default:
                    $("#trq_status").css("background-color", "");
                    $("#trq_status").css("color", "");
                    break;
            }          
            
            break;

        case "engine/prop":
            $("#rpm_status").html(positiveOrHiypens(parseFloat(dato.DataDef.DataValue).toFixed(0)));
            break;

        case "engine/prop_max":
            switch (true) {
                case parseFloat(dato.DataDef.DataValue) > 103:
                    $("#rpm_status").css("background-color", "orangered");
                    $("#rpm_status").css("color", "");
                    break;

                case parseFloat(dato.DataDef.DataValue) > 102:
                    $("#rpm_status").css("background-color", "gold");
                    $("#rpm_status").css("color", "#424242");
                    break;

                default:
                    $("#rpm_status").css("background-color", "");
                    $("#rpm_status").css("color", "");
                    break;
            }
            break;


        case "engine/n1":
            $("#ng_status").html(positiveOrHiypens(parseFloat(dato.DataDef.DataValue).toFixed(0)));
            $("#n1_status").html(positiveOrHiypens(parseFloat(dato.DataDef.DataValue).toFixed(0)));
            break;

        case "engine/n2":            
            $("#n2_status").html(positiveOrHiypens((parseFloat(dato.DataDef.DataValue).toFixed(0))));
            break;

        case "engine/egt":
            $("#egt_status").html(positiveOrHiypens(parseFloat(dato.DataDef.DataValue).toFixed(0)));
            break;

        case "engine/itt":
            $(".itt_status").html(positiveOrHiypens(parseFloat(dato.DataDef.DataValue).toFixed(0)));

            //ITT limits removed because different values for different planes
            /*switch (true) {
                case parseFloat(dato.DataDef.DataValue) > 840:
                    $(".itt_status").css("background-color", "orangered");
                    $("#itt_status").css("color", "");
                    break;

                case parseFloat(dato.DataDef.DataValue) > 835:
                    $(".itt_status").css("background-color", "gold");
                    $("#itt_status").css("color", "#424242");
                    break;

                default:
                    $(".itt_status").css("background-color", "");
                    $("#itt_status").css("color", "");
                    break;
            }*/

            break;

        case "engine/oil_psi":
            $("#oilp_status").html(parseFloat(dato.DataDef.DataValue).toFixed(0));
            break;

        case "engine/oil_temp":
            $("#oilt_status").html(parseFloat(dato.DataDef.DataValue).toFixed(0));
            break;


        //fuel
        case "fuel/total":
            $("#fuelq_status").html(Math.round(parseFloat(dato.DataDef.DataValue) * 100) + "%");

            switch (true) {
               case parseFloat(dato.DataDef.DataValue) <= .10 :
                    $("#fuelq_status").css("background-color", "orangered");
                    $("#fuelq_status").css("color", "");
                   break;

                case parseFloat(dato.DataDef.DataValue) <= .20 :
                    $("#fuelq_status").css("background-color", "gold");
                    $("#fuelq_status").css("color", "#424242");
                   break;

               default:
                    $("#fuelq_status").css("background-color", "");
                    $("#fuelq_status").css("color", "");
                   break;
           }

            break;

        case "fuel/flow":
            $("#fuelf_status").html(parseFloat(dato.DataDef.DataValue).toFixed(0));
            break;

        case "wind/speed":
            $("#wind_label_s").html(Math.round(parseFloat(dato.DataDef.DataValue)) + "<small>KT</small>");

            setMapWindInfo();

            break;

        case "wind/direction":
            $("#wind_label_d").html(Math.round(parseFloat(dato.DataDef.DataValue)) + "&deg;"); //

            WindSetRotationAngle(parseFloat(dato.DataDef.DataValue));

            /*var r = -(parseFloat(stored_data["indicators/heading"]) - parseFloat(dato.DataDef.DataValue)) + 180;
            //var r = (parseFloat(stored_data["indicators/heading"]) - parseFloat(dato.DataDef.DataValue) - 180);            

            $("#wind_i").css({ 'transform': 'rotate(' + r + 'deg)' });
            $("#wind_i").css({ '-webkit-transform': 'rotate(' + r + 'deg)' });*/

            //var rm = 90 + parseFloat(dato.DataDef.DataValue);
            setMapWindRotation();

            break;

        case "wind/lateral":
            $("#wind_label_h").html(Math.abs(Math.round(parseFloat(dato.DataDef.DataValue))));

            if (parseFloat(dato.DataDef.DataValue) >= 0) {
                $("#wind_h").css({ 'transform': 'rotate(180deg)' });
                $("#wind_h").css({ '-webkit-transform': 'rotate(180deg)' });
            }
            else {
                $("#wind_h").css({ 'transform': 'rotate(0deg)' });
                $("#wind_h").css({ '-webkit-transform': 'rotate(0deg)' });
            }

            break;

        case "wind/longitudinal":
            $("#wind_label_v").html(Math.abs(Math.round(parseFloat(dato.DataDef.DataValue))));

            if (parseFloat(dato.DataDef.DataValue) >= 0) {
                $("#wind_v").css({ 'transform': 'rotate(180deg)' });
            }
            else
                $("#wind_v").css({ 'transform': 'rotate(0deg)' });
            break;

        case "vspeeds/vne":
            if (typeof indicator != "undefined") {
                indicator.updateVNE(parseFloat(dato.DataDef.DataValue));
            }

            break;

        case "vspeeds/vno":
            if (typeof indicator != "undefined") {
                indicator.updateVNO(parseFloat(dato.DataDef.DataValue));
            }

            break;

        case "vspeeds/vfe":
            if (typeof indicator != "undefined") {
                indicator.updateVFE(parseFloat(dato.DataDef.DataValue));
            }

            break;

        case "vspeeds/vs":
            if (typeof indicator != "undefined") {
                indicator.updateVSX(parseFloat(dato.DataDef.DataValue));
            }

            break;

        case "vspeeds/vso":
            if (typeof indicator != "undefined") {
                indicator.updateVSO(parseFloat(dato.DataDef.DataValue));
            }

            break;
    }   
}

function zeroFill(number, width) {
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number + ""; // always return a string
}

function blankFill(number, width) {
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join(' ') + number;
    }
    return number + ""; // always return a string
}

function GetHeadingDiff(_Heading1, _Heading2) {
    return (_Heading2 - _Heading1 + 540) % 360 - 180;
}

function getIntDividedIntoMultiple(dividend, divisor, multiple) {
    var values = [];
    while (dividend > 0 && divisor > 0) {
        var a = Math.round(dividend / divisor / multiple) * multiple;
        dividend -= a;
        divisor--;
        values.push(a);
    }

    return values;
}

//Adapt to new things
function getDistanceInfo() {
    var xdist1 = parseFloat(stored_data["radio/nav1_distance"]);
    var xdist2 = parseFloat(stored_data["radio/nav2_distance"]);

    var xspd = parseFloat(stored_data["indicators/airspeed"]);

    if (xspd != 0 && xdist1 > 0) stored_data["radio/nav1_ete"] = 3600 * (xdist1 / xspd); else stored_data["radio/nav1_ete"] = 0;
    if (xspd != 0 && xdist2 > 0) stored_data["radio/nav2_ete"] = 3600 * (xdist2 / xspd); else stored_data["radio/nav2_ete"] = 0;
}

function updateCRS() {
    var obs = 0;
    var cdi = 0;

    if (parseInt(stored_data["autopilot/navgps"]) == 1) {
        obs = parseFloat(stored_data["indicators/hsi_bearing"]);
    } else {
        if (parseInt(stored_data["autopilot/navsrc1"]) == 1) {
            obs = parseFloat(stored_data["indicators/obs1"]);
            cdi = parseFloat(stored_data["indicators/nav1_cdi"]);
        }
        else {
            obs = parseFloat(stored_data["indicators/obs2"]);
            cdi = parseFloat(stored_data["indicators/nav2_cdi"]);
        }
    }

    if (cdi) cdi = cdi / (127 / 40);

    if (typeof indicator != "undefined") {
        indicator.updateCRS(parseFloat(obs), parseFloat(cdi) || 0);
    }

    if (radio_show_adf_bearing && parseInt(stored_data["indicators/hsi_bearing_valid"]) == 1 && parseFloat(stored_data["radio/adf1_signal"]) > 0) {
        if (typeof indicator != "undefined") {
            $("#adf_indicator").show();
            var adf = parseFloat(stored_data["indicators/hsi_bearing"]);
            indicator.updateADF(adf);
        }
    }
    else {
        if (typeof indicator != "undefined") {
            $("#adf_indicator").hide();
        }
    }
}

function demoExpired() {
    setTimeout(function () { sendFunction("engine/running", "off"); }, 1);
    setTimeout(function () { sendFunction("fuel/selector1", "set", 0); }, 1000);    
    setTimeout(function () { location.href = "/Home/DemoExpired"; }, 2000);         
}

