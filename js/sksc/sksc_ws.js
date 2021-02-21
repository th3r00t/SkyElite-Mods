var socket = null;
var uri = "ws://" + window.location.host + "/ws";

var lastReceivedTime = new Date().getTime();
var lastReceiveTimes = 0;
var lastReceiveLog = false;

var total_flight_time_sec_PREV = -1;
var backInterval;
var tout_times = 0;

var ws_stack = [];

var ws_stack_len = 0;
var ws_stack_times = 0;
var ws_stack_avg = 0;

//
//$(window).on('load', function () {

$(document).ready(function () {
    //Give render a breath
    setTimeout(function () {
        doConnect();

        //Logic V2 Socket should be receiving some per second
        setTimered(function () {       //setInterval               
            doCheckSocket();    
            sendXP_Ping();

            //Taking care of this timer to perform this just one per second
            //if (typeof setTimeOfDay === 'function') setTimeOfDay();

            if (!IsVersionPro) daemonCheker();       
        }, 1000);

    }, 10);

    //V2 go to home page logic if time is less or equal... equal means sim is stopped. Give 5 sec courtesy.
    /*backInterval = setInterval(function () {
        if (window.location.pathname != url_home && (total_flight_time_sec_PREV > 0 && total_flight_time_sec <= total_flight_time_sec_PREV)) {
            tout_times++;

            console.log("tout_times", tout_times, total_flight_time_sec_PREV, total_flight_time_sec);
            
            if (total_flight_time_sec < total_flight_time_sec_PREV || (tout_times > 15 && stored_data["sim/time/paused"] == 0 && stored_data["sim/time/is_in_replay"] == 0)) {                    //Logic not working|| (stored_data["sim/time/paused"] == 1 && tout_times > 3)
                total_flight_time_sec_PREV = -1;
                tout_times = 0;
                location.href = url_home;
            }
        }
        else
        {
            //Reset tout_times if receiving again
            if (tout_times > 0 && total_flight_time_sec_PREV > 0 && total_flight_time_sec > total_flight_time_sec_PREV) {
                tout_times = 0;
                console.log("tout_times reset", tout_times);
            }
        }

        total_flight_time_sec_PREV = total_flight_time_sec;
    }, 1000);*/
});

function doConnect() {
    try {        
        socket = new WebSocket(uri);        
        

        socket.onopen = function (e) {
            console.log("opened " + uri);                
        };

        socket.onclose = function (e) {
            console.log("closed");
            socket = null;            
        };

        socket.onmessage = function (e) {           
            try
            {
                lastReceivedTime = new Date().getTime();

                var dato = JSON.parse(e.data);
               
                dataHandler(dato);
            }
            catch { }

            if (lastReceiveLog) {
                console.log(lastReceivedTime, dato);
            }
        };

        socket.onerror = function (e) {
            if (e.data)
                console.log("Error: " + e.data);
        };        
    } catch{ };
}

function doSend(cmd) {        
    if (socket != null && socket.readyState == socket.OPEN) {

        if (cmd.type && cmd.type != "PING") console.log("Sending: " + cmd);

        socket.send(cmd);
    }
    else {
        try {
            doCheckSocket();
        } catch{ };
    }
}

function doCheckSocket() {
    try {
        var doReconnect = 0;

        elapsed_rec_time = new Date().getTime() - lastReceivedTime;

        if (socket == null || elapsed_rec_time > 15000) {
            doReconnect = elapsed_rec_time;
        }
        else
            if (socket != null) {
                if (socket.readyState != socket.OPEN)
                    doReconnect = 1;
            }

        if (doReconnect > 0) {
            console.log("Reconnecting: ", doReconnect);

            doDisconnect();

            doConnect();
        }
    } catch{ };   
}

function doDisconnect() {  
    try {
        if (socket != null)
            if (socket.readyState == socket.OPEN)
                socket.close();
        socket = null;
    } catch{ };
}

function sendFunction(name, action, value) {   
    var commnad = { type: "function", name,  action, value};
    console.log("sendFunction " + JSON.stringify(commnad))
    doSend(JSON.stringify(commnad));
};

function sendEvent(eventName, value) {
    var commnad = { type: "event", eventName, value };
    console.log("sendEvent " + JSON.stringify(commnad))
    doSend(JSON.stringify(commnad));
};

function sendMusic(eventName, value) {
    var commnad = { type: "music", eventName, value };
    console.log("sendMusic " + JSON.stringify(commnad))
    doSend(JSON.stringify(commnad));
};

//function sendXPSetValue(dataref, value) {
//    var commnad = { type: "xpsetvalue", dataref: dataref, value: value };
//    console.log("sendXPSetValue ", commnad)
//    doSend(JSON.stringify(commnad));
//};

function sendXP_PADSet(device, controller, status) {
    if (socket != null && socket.readyState == socket.OPEN) {
        var commnad = { type: "SETPAD", device: device, controller: controller, status: status };
        console.log("SETPAD ", commnad)
        doSend(JSON.stringify(commnad));
    }
};

function sendXP_PADSetOff(device, controller) {
    if (socket != null && socket.readyState == socket.OPEN) {
        var commnad = { type: "SETPADOFF", device: device, controller: controller };
        console.log("SETPADOFF ", commnad)
        doSend(JSON.stringify(commnad));
    }
};

function sendXP_PADSetOn(device, controller) {
    if (socket != null && socket.readyState == socket.OPEN) {
        var commnad = { type: "SETPADON", device: device, controller: controller };
        console.log("SETPADON ", commnad)
        doSend(JSON.stringify(commnad));
    }
};

function sendXP_Ping() {
    var commnad = { type: "PING"};
    //console.log("PING ", commnad)
    doSend(JSON.stringify(commnad));
};

