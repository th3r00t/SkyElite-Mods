//SkyElite PADS
//----------------------------------------------------------------------------------

function PadFunctionDataReceived(dato) {
    console.log("PadFunctionDataReceived", dato);

    switch (dato.DataRef) {
        //LPD8 KNOBS
        //--------------------------------------------------------------------------

        //MAp zoom for PFD
        case "aviator/pads/L/1":
            if (isPFD) map.setZoom(parseInt(dato.Data));

            break;

        //AVAILBLE
        case "aviator/pads/L/2":
            //AVAILBLE

            break;

        //Volume for music
        case "aviator/pads/L/3":
            $("#music")[0].volume = parseInt(dato.Data) / 100;

            break;

        //Field of view
        case "aviator/pads/L/4":
            sendXPSetValue("sim/graphics/view/field_of_view_deg", parseInt(dato.Data) + 25);

            break;

        //MAp zoom for MFD
        case "aviator/pads/L/5":
            if (isMFD) map.setZoom(parseInt(dato.Data));

            break;

        //AVAILBLE
        case "aviator/pads/L/6":
            //AVAILBLE

            break;

        //Volume for plane
        case "aviator/pads/L/7":

            var _value = parseInt(dato.Data) / 100;

            sendXPSetValue("sim/operation/sound/master_volume_ratio", _value);
            sendXPSetValue("sim/operation/sound/interior_volume_ratio", _value);
            sendXPSetValue("sim/operation/sound/exterior_volume_ratio", _value);

            break;

        //MAp transparenci for PFD maps
        case "aviator/pads/L/8":
            if (isPFD) {
                var _value = parseInt(dato.Data) / 100;
                setPFDTransparency(_value)

            }

            break;

        //LPD8 PROGS
        //--------------------------------------------------------------------------

        //Reserved for Warning
        case "aviator/pads/L/11":
            //AVAILABLE

            break;

        //Reserved for caution
        case "aviator/pads/L/12":
            //AVAILABLE

            break;

        //Reserved for elt
        case "aviator/pads/L/13":
            //AVAILABLE

            break;

        //Reserved for trim reset
        case "aviator/pads/L/14":
            //AVAILABLE

            break;

        //PFD in HSI normal mode
        case "aviator/pads/L/15":
            if (isPFD) dualContainerOption("HSI", true);

            break;

        //PFD in TRANSPARENT MAP
        case "aviator/pads/L/16":
            if (isPFD) dualContainerOption("MAP", true);

            break;


        //LPD8 PADS
        //--------------------------------------------------------------------------

        //Show ap in pfd
        case "aviator/pads/L/55":
            if (isPFD) $('#slide-ap').tabSlideOut(parseInt(dato.Data) != 127 ? "open" : "close");
            
            break;

        //Show route in pfd
        case "aviator/pads/L/56":
            if (isPFD) $('#slide-route').tabSlideOut(parseInt(dato.Data) != 127 ? "open" : "close");

            break;


        //Show elevation in pfd
        case "aviator/pads/L/57":
            if (isPFD) $('#slide-elevation').tabSlideOut(parseInt(dato.Data) != 127 ? "open" : "close");

            break;


        //Show radio in pfd
        case "aviator/pads/L/58":
            if (isPFD) $('#slide-radio').tabSlideOut(parseInt(dato.Data) != 127 ? "open" : "close");

            break;


        //Show engine in pfd
        case "aviator/pads/L/51":
            if (isPFD) $('#slide-engine').tabSlideOut(parseInt(dato.Data) != 127 ? "open" : "close");

            break;

        //Show fuel in pfd
        case "aviator/pads/L/52":
            if (isPFD) $('#slide-fuel').tabSlideOut(parseInt(dato.Data) != 127 ? "open" : "close");

            break;


        //Show elec in pfd
        case "aviator/pads/L/53":
            if (isPFD) $('#slide-elec').tabSlideOut(parseInt(dato.Data) != 127 ? "open" : "close");

            break;


        //Show controls in pfd
        case "aviator/pads/L/54":
            if (isPFD) $('#slide-controls').tabSlideOut(parseInt(dato.Data) != 127 ? "open" : "close");

            break;

        //LPD8 CC --- HERE 0 is closed  --- not 127
        //--------------------------------------------------------------------------

        //Show Map pfd
        case "aviator/pads/L/61":
            if (isPFD) $('#slide-finfo').tabSlideOut(parseInt(dato.Data) != 0 ? "open" : "close");            

            break;

        //Show FLIGHT INFO in pfd
        case "aviator/pads/L/62":
            if (isPFD) $('#slide-map').tabSlideOut(parseInt(dato.Data) != 0 ? "open" : "close");

            break;

        //Toggle vspeeds table
        case "aviator/pads/L/65":
            if (isPFD) $("#vspeeds_info_table").toggle(parseInt(dato.Data) != 0);

            break;

        //Toggle ETE display
        case "aviator/pads/L/66":
            if (isPFD) $("#hsi_eta").toggle(parseInt(dato.Data) != 0);            

            break;


        //Toggle barometer
        case "aviator/pads/L/67":
            if (isPFD) $(".barotable").toggle(parseInt(dato.Data) != 0);            

            break;


        //Toggle times table
        case "aviator/pads/L/68":
            
            if (isPFD) $(".timestable").toggle(parseInt(dato.Data) != 0);   

            break;


        //MPD218 KNOBS BANK A
        //--------------------------------------------------------------------------
        case "aviator/pads/M/1":
            //console.log("aviator/pads/M/1", dato.Data);

            if (function_crs_value) {
                if (parseInt(dato.Data) < 65) sendXPCommandArray(function_crs_value.commands_up);
                if (parseInt(dato.Data) >= 65) sendXPCommandArray(function_crs_value.commands_down);
            }
            break;
        case "aviator/pads/M/2":
            //console.log("aviator/pads/M/2", dato.Data);

            if (function_heading_value) {
                if (parseInt(dato.Data) < 65) sendXPCommandArray(function_heading_value.commands_up);
                if (parseInt(dato.Data) >= 65) sendXPCommandArray(function_heading_value.commands_down);
            }
            break;
        case "aviator/pads/M/3":
            //console.log("aviator/pads/M/2", dato.Data);

            if (function_alt_value) {
                if (parseInt(dato.Data) < 65) sendXPCommandArray(function_alt_value.commands_up);
                if (parseInt(dato.Data) >= 65) sendXPCommandArray(function_alt_value.commands_down);
            }
            break;
        case "aviator/pads/M/4":
            //console.log("aviator/pads/M/2", dato.Data);

            if (function_vs_value) {
                if (parseInt(dato.Data) < 65) sendXPCommandArray(function_vs_value.commands_up);
                if (parseInt(dato.Data) >= 65) sendXPCommandArray(function_vs_value.commands_down);
            }
            break;
        case "aviator/pads/M/5":
            //console.log("aviator/pads/M/2", dato.Data);

            if (function_hsisource_value) {
                if (parseInt(dato.Data) < 65) sendXPCommandArray(function_hsisource_value.commands_up);
                if (parseInt(dato.Data) >= 65) sendXPCommandArray(function_hsisource_value.commands_down);
            }
            break;
        case "aviator/pads/M/6":
            //console.log("aviator/pads/M/2", dato.Data);

            if (function_flc_value) {
                if (parseInt(dato.Data) < 65) sendXPCommandArray(function_flc_value.commands_up);
                if (parseInt(dato.Data) >= 65) sendXPCommandArray(function_flc_value.commands_down);
            }
            break;


        //MPD218 PADS BANK A
        //--------------------------------------------------------------------------

        /*
        //AP
        case "aviator/pads/M/63":
            //console.log("aviator/pads/M/2", dato.Data);            

            if (function_ap_status) {
                var v = (parseInt(dato.Data) == 0 || parseInt(dato.Data) == 127) ? function_ap_status.off : function_ap_status.on;

                if (parseInt(v) != parseInt(stored_data[function_ap_status.dataref])) sendXPCommandArray(function_ap_status.commands_off); //Toggle                                           
            }

            break;

        //FD
        case "aviator/pads/M/64":
            //console.log("aviator/pads/M/2", dato.Data);            

            if (function_fd_status) {
                var v = (parseInt(dato.Data) == 0 || parseInt(dato.Data) == 127) ? function_fd_status.off : function_fd_status.on;

                if (parseInt(v) != parseInt(stored_data[function_fd_status.dataref])) sendXPCommandArray(function_fd_status.commands_off); //Toggle                                      
            }

            break;

        //YD
        case "aviator/pads/M/65":
            //console.log("aviator/pads/M/2", dato.Data);            

            if (function_yd_status) {
                var v = (parseInt(dato.Data) == 0 || parseInt(dato.Data) == 127) ? function_yd_status.off : function_yd_status.on;

                if (parseInt(v) != parseInt(stored_data[function_yd_status.dataref])) sendXPCommandArray(function_yd_status.commands_off); //Toggle                                           
            }

            break;
        
        //HDG
        case "aviator/pads/M/59":
            //console.log("aviator/pads/M/2", dato.Data);            

            if (function_heading_status) {
                var v = (parseInt(dato.Data) == 0 || parseInt(dato.Data) == 127) ? function_heading_status.off : function_heading_status.on;

                if (parseInt(v) != parseInt(stored_data[function_heading_status.dataref])) sendXPCommandArray(function_heading_status.commands_off); //Toggle                                           
            }

            break;

        //ALT
        case "aviator/pads/M/60":
            //console.log("aviator/pads/M/2", dato.Data);

            if (function_alt_status) {
                var v = (parseInt(dato.Data) == 0 || parseInt(dato.Data) == 127) ? function_alt_status.off : function_alt_status.on;

                if (parseInt(v) != parseInt(stored_data[function_alt_status.dataref])) sendXPCommandArray(function_alt_status.commands_off); //Toggle                                   
            }

            break;

        //VS
        case "aviator/pads/M/61":
            //console.log("aviator/pads/M/2", dato.Data);


            if (function_vs_status) {
                var v = (parseInt(dato.Data) == 0 || parseInt(dato.Data) == 127) ? function_vs_status.off : function_vs_status.on;

                if (parseInt(v) != parseInt(stored_data[function_vs_status.dataref])) sendXPCommandArray(function_vs_status.commands_off); //Toggle
            }

            break;


        /*
        //NAV
        case "aviator/pads/M/55":
            //console.log("aviator/pads/M/2", dato.Data);

            if (function_nav_status) {
                if (parseInt(dato.Data) == 0) sendXPCommandArray(function_nav_status.commands_off);
                if (parseInt(dato.Data) > 0) sendXPCommandArray(function_nav_status.commands_on);
            }
            break;

        //APPR
        case "aviator/pads/M/56":
            //console.log("aviator/pads/M/2", dato.Data);

            if (function_appr_status) {
                if (parseInt(dato.Data) == 0) sendXPCommandArray(function_appr_status.commands_off);
                if (parseInt(dato.Data) > 0) sendXPCommandArray(function_appr_status.commands_on);
            }
            break;

        //BC
        case "aviator/pads/M/57":
            //console.log("aviator/pads/M/2", dato.Data);

            if (function_bc_status) {
                if (parseInt(dato.Data) == 0) sendXPCommandArray(function_bc_status.commands_off);
                if (parseInt(dato.Data) > 0) sendXPCommandArray(function_bc_status.commands_on);
            }
            break;

        //VNAV
        case "aviator/pads/M/51":
            //console.log("aviator/pads/M/2", dato.Data);

            if (function_vnav_status) {
                if (parseInt(dato.Data) == 0) sendXPCommandArray(function_vnav_status.commands_off);
                if (parseInt(dato.Data) > 0) sendXPCommandArray(function_vnav_status.commands_on);
            }
            break;

        //FLC
        case "aviator/pads/M/52":
            //console.log("aviator/pads/M/2", dato.Data);

            if (function_flc_status) {
                if (parseInt(dato.Data) == 0) sendXPCommandArray(function_flc_status.commands_off);
                if (parseInt(dato.Data) > 0) sendXPCommandArray(function_flc_status.commands_on);
            }
            break;

        //ATHR
        case "aviator/pads/M/53":
            //console.log("aviator/pads/M/2", dato.Data);

            if (function_athr_status) {
                if (parseInt(dato.Data) == 0) sendXPCommandArray(function_athr_status.commands_off);
                if (parseInt(dato.Data) > 0) sendXPCommandArray(function_athr_status.commands_on);
            }
            break;*/
    }
}