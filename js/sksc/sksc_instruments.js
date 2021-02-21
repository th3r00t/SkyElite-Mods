var instrumentSize = "12vw"; //Math.floor(($(window).width() / 4)* .8); 12vw

var attitude = $.flightIndicator('#attitude', 'attitude', { size: instrumentSize, showBox: false, img_directory: "/img/" });
var heading = $.flightIndicator('#heading', 'heading', { size: instrumentSize, showBox: false, img_directory: "/img/" });
var variometer = $.flightIndicator('#variometer', 'variometer', { size: instrumentSize, showBox: false, img_directory: "/img/" });
var altimeter = $.flightIndicator('#altimeter', 'altimeter', { size: instrumentSize, showBox: false, img_directory: "/img/" });


//var airspeed = $.flightIndicator('#airspeed', 'airspeed', { showBox: true });
//var turn_coordinator = $.flightIndicator('#turn_coordinator', 'turn_coordinator', { turn: 0 });

//This does the best reponsive fit for all devices
//$(".instrument").css('height', '30vh').removeAttr("width");