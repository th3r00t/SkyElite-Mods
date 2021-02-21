var radio_selected_dataref;
var radio_show_adf_bearing = false;

$(document).ready(function () {
    //Radio Keyboard

    $('#radio-keyboard').keyboard({
        layout: 'custom',
        customLayout: {
            'default': [
                "{bksp} {clear}",
                " ",
                '1 2 3 4 5',
                "6 7 8 9 0",
                " ",
                "{accept} {cancel}"
            ],
        },
        display: {
            //'bugup': '&uarr;',
            //'bugdown': '&darr;',
            //'bugsync': 'SYNC',
        },
        css: {
            buttonAction: 'ui-state-active'
        },
        maxLength: 6,
        stayOpen: false,
        usePreview: true, //
        accepted: function (e, keyboard, el) {            
            var val = $('#radio-keyboard').val();

            console.log(radio_selected_dataref, val);
            if (radio_selected_dataref.includes("adf")) {
                sendFunction(radio_selected_dataref, "set", parseInt(Number("0x" + val.pad(5).padr(8))));
            }
            else
                sendFunction(radio_selected_dataref, "set", parseInt(Number("0x" + val)));

            //sendXPSetValue(radio_selected_dataref, $('#radio-keyboard').val());
            //radioReseBugDisplay();
        },
        canceled: function (e, keyboard, el) {
            //radioReseBugDisplay();
        },
        position: {
            of: $("#main_carousel"),
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

    $("#nav_radio_dialer").click(function (event) {
        edit_selected_nav();
    });

    $("#com_radio_dialer").click(function (event) {
        edit_selected_com();
    });

});

//NAV & COM DIal
//------------------------------------------------------------------
function draw_selected_nav(selected) {
    $("#nav1_stby").css("background-color", "");
    $("#nav2_stby").css("background-color", "");
    $("#nav1_stby").css("color", "");
    $("#nav2_stby").css("color", "");
    $("#nav1_swap").html('');
    $("#nav2_swap").html('');
    $("#nav1_active").removeClass("title_on");
    $("#nav2_active").removeClass("title_on");

    $("#nav" + selected + "_stby").css("background-color", "white");
    $("#nav" + selected + "_stby").css("color", "black");
    $("#nav" + selected + "_swap").html('<img src="/img/swap.png" height="10" />');

    //$("#nav" + selected + "_active").addClass("title_on");
}

function swap_selected_nav() {
    elite_active_nav = (elite_active_nav == 1) ? 2 : 1;
    draw_selected_nav(elite_active_nav);
}

function stby_selected_nav() {
    sendFunction("radio/nav" + elite_active_nav + "_stby", "toggle");
}

function edit_selected_nav() {
    radio_selected_dataref = "radio/nav" + elite_active_nav + "_stby";
    var title = 'Enter NAV' + elite_active_nav + ' STBY frequency';

    maxLength = 5;

    $('#radio-keyboard').getkeyboard().options.maxLength = maxLength;

    $('#radio-keyboard').val(parseFloat(stored_data[radio_selected_dataref]) * 100);
    $('#radio-keyboard').getkeyboard().reveal();

    $(".ui-keyboard").prepend("<h5 style='color:white;'>" + title + "</h5>");

    //$(".ui-keyboard-preview").addClass(display_class);
}

function edit_selected_adf() {
    radio_selected_dataref = "radio/adf1_stby";
    var title = 'Enter ADF STBY frequency';

    maxLength = 5;

    $('#radio-keyboard').getkeyboard().options.maxLength = maxLength;

    $('#radio-keyboard').val((parseFloat(stored_data["radio/adf1_stby"]) / 100));
    $('#radio-keyboard').getkeyboard().reveal();

    $(".ui-keyboard").prepend("<h5 style='color:white;'>" + title + "</h5>");    
}

//------------------------------------------------------------------

function draw_selected_com(selected) {
    $("#com1_stby").css("background-color", "");
    $("#com2_stby").css("background-color", "");
    $("#com1_stby").css("color", "");
    $("#com2_stby").css("color", "");
    $("#com1_swap").html('');
    $("#com2_swap").html('');
    $("#com1_active").removeClass("title_on");
    $("#com2_active").removeClass("title_on");

    $("#com" + selected + "_stby").css("background-color", "white");
    $("#com" + selected + "_stby").css("color", "black");
    $("#com" + selected + "_swap").html('<img src="/img/swap.png" height="10" />');

    //$("#com" + selected + "_active").addClass("title_on");
}

function swap_selected_com() {
    elite_active_com = (elite_active_com == 1) ? 2 : 1;
    draw_selected_com(elite_active_com);
}

function stby_selected_com() {
    sendFunction("radio/com" + elite_active_com + "_stby", "toggle");
}

function edit_selected_com() {
    radio_selected_dataref = "radio/com" + elite_active_com + "_stby";
    var title = 'Enter COM' + elite_active_com + ' STBY frequency';

    maxLength = 5;

    $('#radio-keyboard').getkeyboard().options.maxLength = maxLength;

    var val = String(parseFloat(stored_data[radio_selected_dataref]) * 1000);

    $('#radio-keyboard').val(val.substring(0,5));
    $('#radio-keyboard').getkeyboard().reveal();

    $(".ui-keyboard").prepend("<h5 style='color:white;'>" + title + "</h5>");

    //$(".ui-keyboard-preview").addClass(display_class);
}


//------------------------------------------------------------------