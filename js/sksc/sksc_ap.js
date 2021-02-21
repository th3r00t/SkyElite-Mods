var ap_bug_function;

function mousewheelEnable(ids, ap_function) {
    $(ids).mousewheel(function (event) {
        //console.log(event.originalEvent.deltaX, event.originalEvent.deltaY, event.originalEvent.deltaFactor);

        if (event.originalEvent.deltaY <= 1) sendFunction(ap_function, "up", "");
        if (event.originalEvent.deltaY >= -1) sendFunction(ap_function, "down", "");
    });
}

function mouseupEnable(ids, ap_function, display_class, title) {
    $(ids).mouseup(function (event) {
        ap_bug_function = ap_function;

        if (lastMouseButton == 1) {
            $('#ap-keyboard').val(Math.round(parseFloat(stored_data[ap_function])));
            $('#ap-keyboard').getkeyboard().reveal();

            $(".ui-keyboard").prepend("<h5 style='color:white;'>" + title + "</h5>");

            //autopilotReseBugDisplay();

            $(".ui-keyboard-preview").addClass(display_class);
        }
        else {
            sendFunction(ap_bug_function, "sync", "");
        }
    });
}

$(document).ready(function () {   
    $.keyboard.keyaction.bugup = function (base) {
        sendFunction(ap_bug_function, "up", "");
    };

    $.keyboard.keyaction.bugdown = function (base) {
        sendFunction(ap_bug_function, "down", "");
    };

    $.keyboard.keyaction.bugsync = function (base) {
        sendFunction(ap_bug_function, "sync", "");
        $('#ap-keyboard').getkeyboard().close();
    };

    $('#ap-keyboard').keyboard({
        layout: 'custom',
        customLayout: {
            'default': [
                "{bksp} {clear} + -",
                " ",
                '{bugup} 1 2 3 4 5',
                "{bugdown} 6 7 8 9 0",
                " ",
                "{accept} {cancel} {bugsync}"
            ],
        },
        display: {
            'bugup': '&uarr;',
            'bugdown': '&darr;',
            'bugsync': 'SYNC',
        },
        css: {
            buttonAction: 'ui-state-active'
        },

        stayOpen: false,
        usePreview: true,
        accepted: function (e, keyboard, el) {
            sendFunction(ap_bug_function, "set", $('#ap-keyboard').val());
            //autopilotReseBugDisplay();
        },
        canceled: function (e, keyboard, el) {
            //autopilotReseBugDisplay();
        },
        position: {
            of: $("#main_carousel"), //document
            my: 'center bottom',
            at: 'center bottom'
        },
        visible: function (e, keyboard, el) {
            keyboard.$preview[0].select();
        }
    });
    //// activate the typing extension
    //.addTyping({
    //    showTyping: true,
    //    delay: 50
    //});
    //---

    //HDG
    //-----------------------------------------------------------
    mousewheelEnable('#hdg_value,#hdg_value_label', "autopilot/heading_selected");
    mouseupEnable('#hdg_value,#hdg_value_label', "autopilot/heading_selected", '', 'Enter HDG');

    //CRS
    //-----------------------------------------------------------
    mousewheelEnable('#crs_value,#crs_value_label', "indicators/obs");
    mouseupEnable('#crs_value,#crs_value_label', "indicators/obs", '', 'Enter CRS');

    //VS
    //-----------------------------------------------------------
    mousewheelEnable('#selected_vertical_speed', "autopilot/vs_selected");
    mouseupEnable('#selected_vertical_speed', "autopilot/vs_selected", '', 'Enter VS');

    //Altitude
    //-----------------------------------------------------------
    mousewheelEnable('#selected_altitude', "autopilot/altitude_selected");
    mouseupEnable('#selected_altitude', "autopilot/altitude_selected", '', 'Enter ALTITUDE');

    //FLC
    //-----------------------------------------------------------
    mousewheelEnable('#selected_air_speed', "autopilot/ias_selected");
    mouseupEnable('#selected_air_speed', "autopilot/ias_selected", '', 'Enter FLC/IAS');

    //BARO
    //-----------------------------------------------------------
    $("#barometer").mousewheel(function (event) {
        //console.log(event.originalEvent.deltaX, event.originalEvent.deltaY, event.originalEvent.deltaFactor);

        if (event.originalEvent.deltaY <= 1) sendFunction("indicators/baro", "up", "");
        if (event.originalEvent.deltaY >= -1) sendFunction("indicators/baro", "down", "");
    });
});