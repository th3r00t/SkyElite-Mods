(function(w){
    w.skscEfis = function(selector, autoUpdate){
        this.autoUpdate = autoUpdate;
        this.angleHorizontal = 0;
        this.angleVertical = 0;
        this.noiseBarrier = 0.25;
        this.maximumVerticalDegrees = 360;
        this.minimumVerticalDegrees = -360;
        this.degreesPerLine = 5;
        this.verticalMeasurementlineId = 'AH__verticalMeasurementLine';

        /*this.MaxAltitude = 55000;
        this.FeetPerLine = 100;
        this.verticalAltitudelineId = 'AH__verticalAltitudeLine';*/

        this.MaxVS = 10;        
        this.verticalVSlineId = 'AH__verticalVSLine';


        this.horizontalAngle = 0;
        this.verticalAngle = 0;
        this.altitudeFeet = 0;
        this.heading = 0
        this.hdg = 0
        this.crs = 0
        this.cdi = 0
        this.adf = 0
        this.air_speed = 0;

        this.fd_enabled = false;
        this.fd_roll = 0
        this.fd_pitch = 0


        this.vxw = .98;
        this.vyw = 1.1;

        this.flaps = 0;
        this.vne = 0;
        this.vnew = 0;
        this.vno = 0;
        this.vnow = 0;
        this.vfe = 0;
        this.vfew = 0;
        this.vs = 0;
        this.vsw = 0;
        this.vso = 0;
        this.vsow = 0;

        this.updatingVH = false;

        this.node = document.querySelector(selector);
        this.initElements();
        //this.initMotionListener();

        window.addEventListener('resize', this.resize.bind(this));

        //this.resize();
        //var that = this;
        //setTimeout(function () { that.resize(); }, 100);        
    }

    var p = w.skscEfis.prototype;

    p.initElements = function() {
        var docFragment = document.createDocumentFragment();

        this.wrapperNode = document.createElement('div');
        this.wrapperNode.className = 'sksc_efis__wrapper';

        this.movingWrapperNode = document.createElement('div');
        this.movingWrapperNode.className = 'sksc_efis__wrapperMoving';

        this.groundNode = document.createElement('div');
        this.groundNode.id = "efis_ground";
        this.groundNode.className = 'sksc_efis__absolute sksc_efis__half_screen sksc_efis__ground';
        this.skyNode = document.createElement('div');
        this.skyNode.className = 'sksc_efis__absolute sksc_efis__half_screen sksc_efis__sky';

        this.wrapperNode.appendChild(this.movingWrapperNode);
        this.movingWrapperNode.appendChild(this.groundNode);
        this.movingWrapperNode.appendChild(this.skyNode);

        this.planeMarkNode = document.createElement('div');
        this.planeMarkNode.className = 'sksc_efis__planeMark sksc_efis__absolute';
        this.wrapperNode.appendChild(this.planeMarkNode);

        this.planeMarkImage = document.createElement('img');
        this.planeMarkImage.src = '/img/plane_mark.gif';

        this.planeMarkImage.style.position = 'absolute';
        this.planeMarkImage.style.top = '-.6vh';

        this.planeMarkImage.style.width = '40%';
        this.planeMarkImage.style.left = '30%';        

        this.planeMarkNode.appendChild(this.planeMarkImage);

         

        //Heading 
        this.planeHeadingNode = document.createElement('div');
        this.planeHeadingNode.className = 'sksc_efis__HeadingMark sksc_efis__absolute';
        this.wrapperNode.appendChild(this.planeHeadingNode);

        //HeadingBack 
        this.planeHeadingBack = document.createElement('div');
        this.planeHeadingBack.className = 'sksc_efis__HeadingBack sksc_efis__absolute';
        this.planeHeadingBack.id = 'headingBack';
        this.planeHeadingNode.appendChild(this.planeHeadingBack); 


        this.planeHeadingImage = document.createElement('img');        
        this.planeHeadingImage.src = '/img/heading.png';

        this.planeHeadingImage.style.position = 'absolute';
        this.planeHeadingImage.style.bottom = '0px';

        this.planeHeadingImage.setAttribute('width', '100%');
        this.planeHeadingImage.setAttribute('height', 'auto');

        var that = this;

        //Until the image is loaded fist time, the heading value box is not correctly possitioned.
        this.planeHeadingImage.onload = function () {
            that.refreshHeadingValuePosition();
        };

        this.planeHeadingNode.appendChild(this.planeHeadingImage);
        //

        //HeadingIndInd ind
        this.planeHeadingIndNode = document.createElement('div');
        this.planeHeadingIndNode.className = 'sksc_efis__HeadingMark sksc_efis__absolute';
        this.wrapperNode.appendChild(this.planeHeadingIndNode);

        this.planeHeadingIndImage = document.createElement('img');        
        this.planeHeadingIndImage.src = '/img/heading_indicator.png';
        this.planeHeadingIndImage.id = 'heading_indicator';        

        this.planeHeadingIndImage.style.position = 'absolute';
        this.planeHeadingIndImage.style.bottom = '8vh';

        this.planeHeadingIndImage.setAttribute('width', '50%');
        this.planeHeadingIndImage.setAttribute('height', 'auto');

        this.planeHeadingIndNode.appendChild(this.planeHeadingIndImage);      
        //

        //Heading value
        this.planeHeadingValueNode = document.createElement('div');
        this.planeHeadingValueNode.className = 'sksc_efis__HeadingValue sksc_efis__absolute';
        this.planeHeadingValueNode.id = 'heading_value';
        this.planeHeadingIndNode.appendChild(this.planeHeadingValueNode);
        this.planeHeadingValueNode.textContent = "0";
        //this.planeHeadingValueNode.style.top = '60%';
        //

        //Heading value arrow
        this.planeHeadingArrowNode = document.createElement('div');
        this.planeHeadingArrowNode.className = 'sksc_efis__HeadingArrow sksc_efis__absolute';
        this.planeHeadingArrowNode.id = 'heading_arrow';
        this.planeHeadingIndNode.appendChild(this.planeHeadingArrowNode);        
        //this.planeHeadingArrowNode.style.top = '60%';
        //        

        //HDG ind
        this.planeHDGIndNode = document.createElement('div');
        this.planeHDGIndNode.className = 'sksc_efis__HeadingMark sksc_efis__absolute';
        this.wrapperNode.appendChild(this.planeHDGIndNode);

        this.planeHDGIndImage = document.createElement('img');        
        this.planeHDGIndImage.src = '/img/hdg_indicator.png';
        this.planeHDGIndImage.id = 'hdg_indicator';

        this.planeHDGIndImage.style.position = 'absolute';
        this.planeHDGIndImage.style.bottom = '0px';

        this.planeHDGIndImage.setAttribute('width', '100%');
        this.planeHDGIndImage.setAttribute('height', 'auto');

        this.planeHDGIndNode.appendChild(this.planeHDGIndImage);

        //CRS ind
        this.planeCRSIndNode = document.createElement('div');
        this.planeCRSIndNode.className = 'sksc_efis__HeadingMark sksc_efis__absolute';
        this.wrapperNode.appendChild(this.planeCRSIndNode);

        this.planeCRSIndImage = document.createElement('img');
        this.planeCRSIndImage.src = '/img/crs_indicator.png';
        this.planeCRSIndImage.id = 'crs_indicator';

        this.planeCRSIndImage.style.position = 'absolute';
        this.planeCRSIndImage.style.bottom = '0px';

        this.planeCRSIndImage.setAttribute('width', '100%');
        this.planeCRSIndImage.setAttribute('height', 'auto');

        this.planeCRSIndNode.appendChild(this.planeCRSIndImage);

        this.planeDEFIndImage = document.createElement('img');
        this.planeDEFIndImage.src = '/img/def_indicator.png';
        this.planeDEFIndImage.id = 'def_indicator';

        this.planeDEFIndImage.style.position = 'absolute';
        this.planeDEFIndImage.style.bottom = '0px';

        this.planeDEFIndImage.setAttribute('width', '100%');
        this.planeDEFIndImage.setAttribute('height', 'auto');

        this.planeCRSIndNode.appendChild(this.planeDEFIndImage);

        this.planeAdfIndImage = document.createElement('img');
        this.planeAdfIndImage.src = '/img/adf_indicator.png';
        this.planeAdfIndImage.id = 'adf_indicator';

        this.planeAdfIndImage.style.position = 'absolute';
        this.planeAdfIndImage.style.bottom = '0px';

        this.planeAdfIndImage.setAttribute('width', '100%');
        this.planeAdfIndImage.setAttribute('height', 'auto');

        this.planeCRSIndNode.appendChild(this.planeAdfIndImage);

        //HSI Source Info
        this.planeSourceInfoNode = document.createElement('div');
        this.planeSourceInfoNode.className = 'sksc_efis__HeadingMark sksc_efis__absolute';
        this.planeSourceInfoNode.id = 'hsi_info';
        this.planeHDGIndNode.appendChild(this.planeSourceInfoNode);

        this.planeSourceInfoNode.style.position = 'absolute';
        this.planeSourceInfoNode.style.bottom = '0px';

        this.planeSourceInfoNode.setAttribute('width', '100%');
        this.planeSourceInfoNode.setAttribute('height', '100%');

        //this.planeSourceInfoNode.style.zIndex = "9999";
        //this.planeSourceInfoNode.style.minWidth = "9vw"; // "120px";

        this.planeSourceInfoNode.textContent = "---";
        this.planeSourceInfoNode.style.textAlign = "center";
        this.planeSourceInfoNode.style.fontSize = "1vw";
        this.planeSourceInfoNode.style.fontWeight = "500";
        this.planeSourceInfoNode.style.color = "greenyellow";

        //HSI Source Info
        /*this.planeSourceInfoNode = document.createElement('div');
        this.planeSourceInfoNode.className = 'efis_boxed_small';
        this.planeSourceInfoNode.id = 'hsi_info';
        this.wrapperNode.appendChild(this.planeSourceInfoNode);

        this.planeSourceInfoNode.style.position = 'absolute';
        this.planeSourceInfoNode.style.top = '20%';
        this.planeSourceInfoNode.style.left = '28%';
        this.planeSourceInfoNode.style.zIndex = "9999";
        this.planeSourceInfoNode.style.minWidth = "9vw"; // "120px";
        this.planeSourceInfoNode.textContent = "--------";
        this.planeSourceInfoNode.style.textAlign = "center";
        //this.planeSourceInfoNode.style.fontFamily = "digital-7, sans-serif";
        //*/

       

        //FD
        this.planeFDCommandNode = document.createElement('div');
        this.planeFDCommandNode.className = 'sksc_efis__FDCommandMark sksc_efis__absolute';
        this.planeFDCommandNode.id = "fd_node";
        this.wrapperNode.appendChild(this.planeFDCommandNode);

        this.planeFDCommandImage = document.createElement('img');        
        this.planeFDCommandImage.src = '/img/fdcommand.png';
        this.planeFDCommandImage.id = "fd_indicator";

        this.planeFDCommandImage.style.position = 'absolute';
        this.planeFDCommandImage.style.top = '50%';

        this.planeFDCommandImage.setAttribute('width', '100%');        
        this.planeFDCommandImage.setAttribute('height', 'auto');

        this.planeFDCommandNode.appendChild(this.planeFDCommandImage);
        //
      
        //air speed
        this.planeAirSpeedNode = document.createElement('div');
        this.planeAirSpeedNode.className = 'efis_boxed';
        this.planeAirSpeedNode.id = 'air_speed';
        this.wrapperNode.appendChild(this.planeAirSpeedNode);

        this.planeAirSpeedNode.style.position = 'absolute';
        this.planeAirSpeedNode.style.top = '40%';
        this.planeAirSpeedNode.style.left = '28%';
        this.planeAirSpeedNode.style.zIndex  = "9999";        
        this.planeAirSpeedNode.style.minWidth = "6vw"; // "120px";        
        this.planeAirSpeedNode.textContent = "0";

        this.planeAirSpeedNode.style.color = "#eee0d3"; //cornsilk        #eee0d3
        this.planeAirSpeedNode.style.backgroundColor = "rgba(42, 42, 42, 0.8)";
        this.planeAirSpeedNode.style.fontWeight = 700;
        //

        /*this.odometer_speed = new Odometer({
            el: this.planeAirSpeedNode,
            auto: false,            
            value: 0,
            format: 'd',
            theme: "car",
            duration: 1
        });*/

        //air speed label
        /*this.planeAirSpeedLabelNode = document.createElement('div');
        this.planeAirSpeedLabelNode.className = 'efis_boxed_label';
        this.planeAirSpeedLabelNode.id = 'air_speed_label';
        this.wrapperNode.appendChild(this.planeAirSpeedLabelNode);

        this.planeAirSpeedLabelNode.style.position = 'absolute';
        this.planeAirSpeedLabelNode.style.top = '40%';
        this.planeAirSpeedLabelNode.style.left = '28%';
        this.planeAirSpeedLabelNode.style.zIndex = "9999";       
        this.planeAirSpeedLabelNode.textContent = "AIRSPEED";
        this.planeAirSpeedLabelNode.style.minWidth = "9vw"; // "120px";        
        //*/

        //Air speed  Selected
        this.planeSelectedAirSpeedNode = document.createElement('div');
        this.planeSelectedAirSpeedNode.className = 'efis_boxed_small';
        this.planeSelectedAirSpeedNode.id = 'selected_air_speed';
        this.wrapperNode.appendChild(this.planeSelectedAirSpeedNode);

        this.planeSelectedAirSpeedNode.style.position = 'absolute';
        this.planeSelectedAirSpeedNode.style.top = '20%';
        this.planeSelectedAirSpeedNode.style.left = '28%';
        this.planeSelectedAirSpeedNode.style.zIndex = "9999";
        this.planeSelectedAirSpeedNode.style.minWidth = "4vw"; // "120px";        
        this.planeSelectedAirSpeedNode.textContent = "0";
        this.planeSelectedAirSpeedNode.style.cursor = "n-resize"; 
        //this.planeSelectedAirSpeedNode.style.fontFamily = "digital-7, sans-serif"; 
        //        

        //TAS
        this.planeTasNode = document.createElement('div');
        this.planeTasNode.className = 'efis_boxed_small tastable';
        this.planeTasNode.id = 'tas';
        this.wrapperNode.appendChild(this.planeTasNode);

        this.planeTasNode.style.position = 'absolute';
        this.planeTasNode.style.top = '20%';
        this.planeTasNode.style.left = '28%';
        this.planeTasNode.style.zIndex = "9999";
        this.planeTasNode.style.minWidth = "4vw"; //"135px";        
        this.planeTasNode.textContent = "0";
        this.planeTasNode.style.cursor = "n-resize";
        //this.planeTasNode.style.fontFamily = "digital-7, sans-serif";
        this.planeTasNode.style.color = "navajowhite";
        //this.planeTasNode.style.fontSize = "1.3vw";
        //this.planeTasNode.style.fontWeight = 500;
        //

        //V Speeds Info table
        this.planeVSpeedsInfoNode = document.createElement('table');
        this.planeVSpeedsInfoNode.className = 'vspeeds_table';
        this.planeVSpeedsInfoNode.id = 'vspeeds_info_table';

        for (i = 0; i < 5; i++) {
            var row = this.planeVSpeedsInfoNode.insertRow(i);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);

            switch (i) {
                case 0:
                    cell1.id = "vne_tit";
                    cell2.id = "vne_value";
                    cell1.textContent  = "VNE";
                    cell2.textContent  = "";
                    cell1.style.color = "orangered";                    
                    break
                case 1:
                    cell1.id = "vno_tit";
                    cell2.id = "vno_value";
                    cell1.textContent  = "VNO";
                    cell2.textContent  = "";
                    cell1.style.color = "gold";                    
                    break
                case 2:
                    cell1.id = "vfe_tit";
                    cell2.id = "vfe_value";
                    cell1.textContent  = "VFE";
                    cell2.textContent  = "";
                    cell1.style.color = "khaki";
                    break
                case 3:
                    cell1.id = "vs_tit";
                    cell2.id = "vs_value";
                    cell1.textContent  = "VS";
                    cell2.textContent  = "";
                    cell1.style.color = "gold";
                    break
                case 4:
                    cell1.id = "vso_tit";
                    cell2.id = "vso_value";
                    cell1.textContent  = "VSO";
                    cell2.textContent  = "";
                    cell1.style.color = "red";
                    break
                /*case 5:
                    cell1.id = "tas_tit";
                    cell2.id = "tas_value";
                    cell1.textContent  = "TOA";
                    cell2.textContent  = "";
                    cell1.style.color = "navajowhite";
                    break
                case 6:
                    cell1.id = "gs_tit";
                    cell2.id = "gs_value";
                    cell1.textContent  = "GS";
                    cell2.textContent  = "";
                    cell1.style.color = "navajowhite";
                    break*/

            }

            cell2.style.color = cell1.style.color;
        }

        this.wrapperNode.appendChild(this.planeVSpeedsInfoNode);

        //HSI Source
        /*this.planeSourceNode = document.createElement('div');
        this.planeSourceNode.className = 'efis_boxed';
        this.planeSourceNode.id = 'hsi_source';
        this.wrapperNode.appendChild(this.planeSourceNode);

        this.planeSourceNode.style.position = 'absolute';
        this.planeSourceNode.style.top = '40%';
        this.planeSourceNode.style.left = '28%';
        this.planeSourceNode.style.zIndex = "9999";
        this.planeSourceNode.style.minWidth = "9vw"; // "120px";                
        this.planeSourceNode.style.maxWidth = "9vw"; // "120px"; 
        this.planeSourceNode.textContent = "---";
        this.planeSourceNode.style.textAlign = "center";
        this.planeSourceNode.style.color = "black"; //cornflowerblue
        //this.planeSourceNode.style.fontSize = 2vw";
        //this.planeSourceNode.style.fontFamily = "digital-7, sans-serif"; 
        //

        //HSI Source label
        this.planeSourceLabelNode = document.createElement('div');
        this.planeSourceLabelNode.className = 'efis_boxed_label';
        this.planeSourceLabelNode.id = 'hsi_source_label';
        this.wrapperNode.appendChild(this.planeSourceLabelNode);

        this.planeSourceLabelNode.style.position = 'absolute';
        this.planeSourceLabelNode.style.top = '40%';
        this.planeSourceLabelNode.style.left = '28%';
        this.planeSourceLabelNode.style.zIndex = "9999";
        this.planeSourceLabelNode.textContent = "HSI Source";
        this.planeSourceLabelNode.style.minWidth = "9vw"; // "120px";    
        //

        //HSI Source Info
        this.planeSourceInfoNode = document.createElement('div');
        this.planeSourceInfoNode.className = 'efis_boxed_small';
        this.planeSourceInfoNode.id = 'hsi_info';
        this.wrapperNode.appendChild(this.planeSourceInfoNode);

        this.planeSourceInfoNode.style.position = 'absolute';
        this.planeSourceInfoNode.style.top = '20%';
        this.planeSourceInfoNode.style.left = '28%';
        this.planeSourceInfoNode.style.zIndex = "9999";
        this.planeSourceInfoNode.style.minWidth = "9vw"; // "120px";
        this.planeSourceInfoNode.textContent = "--------";
        this.planeSourceInfoNode.style.textAlign = "center"; 
        //this.planeSourceInfoNode.style.fontFamily = "digital-7, sans-serif"; 
        //

        //HSI DME Time
        this.planeEtaInfoNode = document.createElement('div');
        this.planeEtaInfoNode.className = 'efis_boxed_small';
        this.planeEtaInfoNode.id = 'hsi_eta';
        this.wrapperNode.appendChild(this.planeEtaInfoNode);

        this.planeEtaInfoNode.style.position = 'absolute';
        this.planeEtaInfoNode.style.top = '20%';
        this.planeEtaInfoNode.style.left = '28%';
        this.planeEtaInfoNode.style.zIndex = "9999";
        this.planeEtaInfoNode.style.minWidth = "9vw"; // "120px";
        this.planeEtaInfoNode.textContent = "00:00:00";
        this.planeEtaInfoNode.style.textAlign = "center";
        //this.planeEtaInfoNode.style.fontFamily = "digital-7, sans-serif";
        //*/

        //Altitude
        this.planeAltitudeNode = document.createElement('div');
        this.planeAltitudeNode.className = 'efis_boxed';
        this.planeAltitudeNode.id = 'altitude';
        this.wrapperNode.appendChild(this.planeAltitudeNode);

        this.planeAltitudeNode.style.position = 'absolute';
        this.planeAltitudeNode.style.top = '40%';
        this.planeAltitudeNode.style.left = '80%';
        this.planeAltitudeNode.style.zIndex = "9999";
        this.planeAltitudeNode.style.minWidth = "6vw"; //"135px";        
        this.planeAltitudeNode.textContent = "0";

        this.planeAltitudeNode.style.color = "powderblue";        
        this.planeAltitudeNode.style.backgroundColor = "rgba(42, 42, 42, 0.8)";

        this.planeAltitudeNode.style.fontWeight = 700;
        //

        /*this.odometer_altitude = new Odometer({
            el: this.planeAltitudeNode,
            auto: false,
            value: 0,
            format: 'd',
            theme: "car",
            duration: 1,
        });*/

        //aaltitude label
        /*this.planeAltitudeLabelNode = document.createElement('div');
        this.planeAltitudeLabelNode.className = 'efis_boxed_label';
        this.planeAltitudeLabelNode.id = 'altitude_label';
        this.wrapperNode.appendChild(this.planeAltitudeLabelNode);

        this.planeAltitudeLabelNode.style.position = 'absolute';
        this.planeAltitudeLabelNode.style.top = '40%';
        this.planeAltitudeLabelNode.style.left = '80%';
        this.planeAltitudeLabelNode.style.zIndex = "9999";
        this.planeAltitudeLabelNode.textContent = "ALTITUDE";
        this.planeAltitudeLabelNode.style.minWidth = "10vw"; //"135px";*/
        //

        //Altitude  Selected
        this.planeSelectedAltitudeNode = document.createElement('div');
        this.planeSelectedAltitudeNode.className = 'efis_boxed_small';
        this.planeSelectedAltitudeNode.id = 'selected_altitude';
        this.wrapperNode.appendChild(this.planeSelectedAltitudeNode);

        this.planeSelectedAltitudeNode.style.position = 'absolute';
        this.planeSelectedAltitudeNode.style.top = '20%';
        this.planeSelectedAltitudeNode.style.left = '80%';
        this.planeSelectedAltitudeNode.style.zIndex = "9999";
        this.planeSelectedAltitudeNode.style.minWidth = "6vw"; //"135px";        
        this.planeSelectedAltitudeNode.textContent = "0";
        this.planeSelectedAltitudeNode.style.cursor = "n-resize"; 
        //this.planeSelectedAltitudeNode.style.fontFamily = "digital-7, sans-serif"; 
        //

        //Barometer
        this.planeBarometerNode = document.createElement('div');
        this.planeBarometerNode.className = 'efis_boxed_small barotable';
        this.planeBarometerNode.id = 'barometer';
        this.wrapperNode.appendChild(this.planeBarometerNode);

        this.planeBarometerNode.style.position = 'absolute';
        this.planeBarometerNode.style.top = '20%';
        this.planeBarometerNode.style.left = '80%';
        this.planeBarometerNode.style.zIndex = "9999";
        this.planeBarometerNode.style.minWidth = "3vw"; //"135px";        
        this.planeBarometerNode.textContent = "0";
        this.planeBarometerNode.style.cursor = "n-resize";
        //this.planeBarometerNode.style.fontFamily = "digital-7, sans-serif";
        this.planeBarometerNode.style.color = "navajowhite";    
        //this.planeBarometerNode.style.fontSize = "1.3vw";
        //this.planeBarometerNode.style.fontWeight = 500;
        //

        //OAT
        /*his.planeOatNode = document.createElement('div');
        this.planeOatNode.className = 'efis_boxed_small barotable';
        this.planeOatNode.id = 'oat';
        this.wrapperNode.appendChild(this.planeOatNode);

        this.planeOatNode.style.position = 'absolute';
        this.planeOatNode.style.top = '20%';
        this.planeOatNode.style.left = '80%';
        this.planeOatNode.style.zIndex = "9999";
        this.planeOatNode.style.minWidth = "10vw"; //"135px";        
        this.planeOatNode.textContent = "0";
        this.planeOatNode.style.cursor = "n-resize";
        //this.planeOatNode.style.fontFamily = "digital-7, sans-serif";
        this.planeOatNode.style.color = "navy";
        this.planeOatNode.style.fontSize = "1.3vw";
        //this.planeOatNode.style.fontWeight = 500;
        //

        //DIFF PSI
        this.planeDpsiNode = document.createElement('div');
        this.planeDpsiNode.className = 'efis_boxed_small barotable';
        this.planeDpsiNode.id = 'dpsi';
        this.wrapperNode.appendChild(this.planeDpsiNode);

        this.planeDpsiNode.style.position = 'absolute';
        this.planeDpsiNode.style.top = '20%';
        this.planeDpsiNode.style.left = '80%';
        this.planeDpsiNode.style.zIndex = "9999";
        this.planeDpsiNode.style.minWidth = "10vw"; //"135px";        
        this.planeDpsiNode.textContent = "0";
        this.planeDpsiNode.style.cursor = "n-resize";
        //this.planeDpsiNode.style.fontFamily = "digital-7, sans-serif";
        this.planeDpsiNode.style.color = "navy";
        this.planeDpsiNode.style.fontSize = "1.3vw";
        //this.planeDpsiNode.style.fontWeight = 500;*/
        //

        //local time
        /*this.planeTimeLocalNode = document.createElement('div');
        this.planeTimeLocalNode.className = 'efis_boxed_small timestable';
        this.planeTimeLocalNode.id = 'time-local';
        this.wrapperNode.appendChild(this.planeTimeLocalNode);

        this.planeTimeLocalNode.style.position = 'absolute';
        this.planeTimeLocalNode.style.top = '20%';
        this.planeTimeLocalNode.style.left = '80%';
        this.planeTimeLocalNode.style.zIndex = "9999";
        this.planeTimeLocalNode.style.minWidth = "8vw"; //"135px";        
        this.planeTimeLocalNode.textContent = "00:00:00 L";
        this.planeTimeLocalNode.style.cursor = "n-resize";
        //this.planeTimeLocalNode.style.fontFamily = "digital-7, sans-serif";
        this.planeTimeLocalNode.style.color = "navy";
        this.planeTimeLocalNode.style.fontSize = "1.3vw";
        //this.planeTimeLocalNode.style.fontWeight = 500;
        //


        //utc time 
        this.planeTimeUtcNode = document.createElement('div');
        this.planeTimeUtcNode.className = 'efis_boxed_small timestable';
        this.planeTimeUtcNode.id = 'time-utc';
        this.wrapperNode.appendChild(this.planeTimeUtcNode);

        this.planeTimeUtcNode.style.position = 'absolute';
        this.planeTimeUtcNode.style.top = '20%';
        this.planeTimeUtcNode.style.left = '80%';
        this.planeTimeUtcNode.style.zIndex = "9999";
        this.planeTimeUtcNode.style.minWidth = "8vw"; //"135px";        
        this.planeTimeUtcNode.textContent = "00:00:00 Z";
        this.planeTimeUtcNode.style.cursor = "n-resize";
        //this.planeTimeUtcNode.style.fontFamily = "digital-7, sans-serif";
        this.planeTimeUtcNode.style.color = "navy";
        this.planeTimeUtcNode.style.fontSize = "1.3vw";
        //this.planeTimeUtcNode.style.fontWeight = 500;
        //

        //sys time 
        this.planeTimeSystemNode = document.createElement('div');
        this.planeTimeSystemNode.className = 'efis_boxed_small timestable';
        this.planeTimeSystemNode.id = 'time-system';
        this.wrapperNode.appendChild(this.planeTimeSystemNode);

        this.planeTimeSystemNode.style.position = 'absolute';
        this.planeTimeSystemNode.style.top = '20%';
        this.planeTimeSystemNode.style.left = '80%';
        this.planeTimeSystemNode.style.zIndex = "9999";
        this.planeTimeSystemNode.style.minWidth = "8vw"; //"135px";        
        this.planeTimeSystemNode.textContent = "00:00:00 S";
        this.planeTimeSystemNode.style.cursor = "n-resize";
        //this.planeTimeSystemNode.style.fontFamily = "digital-7, sans-serif";
        this.planeTimeSystemNode.style.color = "navy";
        this.planeTimeSystemNode.style.fontSize = "1.3vw";
        //this.planeTimeSystemNode.style.fontWeight = 500;*/
        //


        //VS
        this.planeVSNode = document.createElement('div');
        this.planeVSNode.className = 'efis_boxed';
        this.planeVSNode.id = 'vertical_speed';
        this.wrapperNode.appendChild(this.planeVSNode);

        this.planeVSNode.style.position = 'absolute';
        this.planeVSNode.style.top = '40%';
        this.planeVSNode.style.left = '80%';
        this.planeVSNode.style.zIndex = "9999";        
        this.planeVSNode.style.minWidth = "4vw"; //"115px";        
        this.planeVSNode.textContent = "0";
        //this.planeVSNode.style.color = "black"; //"dodgerblue";        

        this.planeVSNode.style.color = "deepskyblue"; //"dodgerblue";                
        this.planeVSNode.style.backgroundColor = "rgba(42, 42, 42, 0.8)";

        //this.planeVSNode.style.fontSize = "1.4vw"; 
        //

        /*this.odometer_vs = new Odometer({
            el: this.planeVSNode,
            auto: false,           
            value: 0,
            format: 'd',
            theme: "car",
            duration: 1
        });*/

        //VS label
        /*this.planeVSLabelNode = document.createElement('div');
        this.planeVSLabelNode.className = 'efis_boxed_label';
        this.planeVSLabelNode.id = 'vertical_speed_label';
        this.wrapperNode.appendChild(this.planeVSLabelNode);

        this.planeVSLabelNode.style.position = 'absolute';
        this.planeVSLabelNode.style.top = '40%';
        this.planeVSLabelNode.style.left = '80%';
        this.planeVSLabelNode.style.zIndex = "9999";
        this.planeVSLabelNode.textContent = "VERT SPD";
        this.planeVSLabelNode.style.minWidth = "8vw"; //"115px";*/
        //

        //VS  Selected
        this.planeSelectedVSNode = document.createElement('div');
        this.planeSelectedVSNode.className = 'efis_boxed_small';
        this.planeSelectedVSNode.id = 'selected_vertical_speed';
        this.wrapperNode.appendChild(this.planeSelectedVSNode);

        this.planeSelectedVSNode.style.position = 'absolute';
        this.planeSelectedVSNode.style.top = '30%';
        this.planeSelectedVSNode.style.left = '80%';
        this.planeSelectedVSNode.style.zIndex = "9999";
        this.planeSelectedVSNode.style.minWidth = "4vw"; //"115px";        
        this.planeSelectedVSNode.textContent = "0";
        this.planeSelectedVSNode.style.cursor = "n-resize"; 
        //this.planeSelectedVSNode.style.fontFamily = "digital-7, sans-serif"; 
        //


        docFragment.appendChild(this.wrapperNode);

        this.node.appendChild(docFragment);

        this.createHorizontalDegreesLine();
        this.createHorizontalDegreesMark();      

        //Plane name
        /*this.planeNameNode = document.createElement('div');
        this.planeNameNode.className = 'planename';
        this.planeNameNode.id = 'planename';
        this.wrapperNode.appendChild(this.planeNameNode);*/

        //deflection box
        this.planeDeflectionBoxNode = document.createElement('div');
        this.planeDeflectionBoxNode.className = 'deflection_box';
        this.wrapperNode.appendChild(this.planeDeflectionBoxNode);
        //this.planeHeadingFrameNode.style.zIndex = "11000";     
        this.planeDeflectionBoxNode.id = "deflection_box";
        //this.planeDeflectionBoxNode.style.backgroundColor = "red";


        //Heading frame node
        this.planeHeadingFrameNode = document.createElement('div');
        this.planeHeadingFrameNode.className = 'sksc_efis__HeadingFrame sksc_efis__absolute';
        this.wrapperNode.appendChild(this.planeHeadingFrameNode);
        //this.planeHeadingFrameNode.style.zIndex = "11000";     
        this.planeHeadingFrameNode.id = "heading_frame";


        //AP Info table
        /*this.planeAPInfoNode = document.createElement('table');
        this.planeAPInfoNode.className = 'ap_table';
        this.planeAPInfoNode.id = 'ap_info_table';
        var row = this.planeAPInfoNode.insertRow(0);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        cell1.id = "ap_info_1";
        cell2.id = "ap_info_2";
        cell3.id = "ap_info_3";

        this.planeHeadingFrameNode.appendChild(this.planeAPInfoNode);*/
           

        //HDG value
        this.planeHDGValueNode = document.createElement('div');
        this.planeHDGValueNode.className = 'sksc_efis__HeadingCRS sksc_efis__absolute';
        this.planeHDGValueNode.id = 'hdg_value';
        this.planeHDGValueNode.style.zIndex = "9999";
        this.planeHeadingFrameNode.appendChild(this.planeHDGValueNode);
        this.planeHDGValueNode.textContent = "0";
        this.planeHDGValueNode.style.cursor = "n-resize"; 

        //HDG value label
        this.planeHDGLabelNode = document.createElement('div');
        this.planeHDGLabelNode.className = 'sksc_efis__HeadingCRSLabel sksc_efis__absolute';
        this.planeHDGLabelNode.id = 'hdg_value_label';
        this.planeHDGLabelNode.style.zIndex = "9999";
        this.planeHeadingFrameNode.appendChild(this.planeHDGLabelNode);
        this.planeHDGLabelNode.textContent = "HDG";        
        this.planeHDGLabelNode.style.cursor = "n-resize"; 
        //

        //CRS value
        this.planeCRSValueNode = document.createElement('div');
        this.planeCRSValueNode.className = 'sksc_efis__HeadingCRS sksc_efis__absolute';
        this.planeCRSValueNode.id = 'crs_value';
        this.planeCRSValueNode.style.zIndex = "9999";
        this.planeHeadingFrameNode.appendChild(this.planeCRSValueNode);
        this.planeCRSValueNode.textContent = "0";
        //this.planeCRSValueNode.style.top = '60%';
        this.planeCRSValueNode.style.cursor = "n-resize"; 
        //

        //CRS value label
        this.planeCRSLabelNode = document.createElement('div');
        this.planeCRSLabelNode.className = 'sksc_efis__HeadingCRSLabel sksc_efis__absolute';
        this.planeCRSLabelNode.id = 'crs_value_label';
        this.planeCRSLabelNode.style.zIndex = "9999";
        this.planeHeadingFrameNode.appendChild(this.planeCRSLabelNode);
        this.planeCRSLabelNode.textContent = "CRS";
        this.planeCRSLabelNode.style.cursor = "n-resize"; 
        //
    }

    p.resize = function () {          
        /*if (this.movingWrapperNode.clientWidth <= 900) { //1200
            this.planeMarkNode.style.width = '80%';
            this.planeMarkNode.style.margin = '0 10% 0 10%';
        }
        else {            
            this.planeMarkNode.style.width = '50%';
            this.planeMarkNode.style.margin = '0 25% 0 25%';
        }*/

        this.planeMarkNode.style.width = '80%';
        this.planeMarkNode.style.margin = '0 10% 0 10%';

        //debugger;

        /*var bp = 20;

        if (window.innerHeight < 850) {
            bp = 20 * (window.innerHeight / 850);
        }

        var rp = (1920 / window.innerWidth) < 1 ? 1 : (1920 / window.innerWidth);
        var mp = bp * rp;
        var sp = (100 - mp) /2;*/

        //this.planeHeadingNode.style.width =  mp + 'vw';
        //this.planeHeadingNode.style.margin = '0 ' + sp + 'vw 0 ' + sp + 'vw';

        this.planeHeadingNode.style.width = '24%';
        this.planeHeadingNode.style.margin = '0 38% 0 38%';

        this.planeHeadingIndNode.style.width = this.planeHeadingNode.style.width;
        this.planeHeadingIndNode.style.margin = this.planeHeadingNode.style.margin;       

        this.planeHeadingFrameNode.style.width = this.planeHeadingNode.style.width;
        this.planeHeadingFrameNode.style.margin = this.planeHeadingNode.style.margin;       

        this.planeHDGIndNode.style.width = this.planeHeadingNode.style.width;
        this.planeHDGIndNode.style.margin = this.planeHeadingNode.style.margin;

        this.planeCRSIndNode.style.width = this.planeHeadingNode.style.width;
        this.planeCRSIndNode.style.margin = this.planeHeadingNode.style.margin;

        this.pixelsInDegree = Math.ceil(this.movingWrapperNode.offsetHeight / 90);
        this.refreshVerticalDegreesLine();

        //this.refreshVerticalAltitudeLine();
        //this.refreshVerticalVSLine();

        this.refreshHorizontalMeasurePosition();

        this.refreshAirSpeedPosition();
        this.refreshHSISourcePosition();

        this.refreshVSPosition();
        this.refreshAltitudePosition();

        this.refreshHeadingValuePosition();

        //this.planeDeflectionBoxNode.style.top = this.planeNameNode.offsetTop + this.planeNameNode.offsetHeight + 5 + "px";
        //this.planeDeflectionBoxNode.style.left = this.planeNameNode.offsetLeft; // + this.planeSourceInfoNode.offsetWidth + 5 + "px";
        //this.planeDeflectionBoxNode.style.width = "50px";

        //this.updateAngles(this.horizontalAngle, this.verticalAngle);
        //this.updateAltitude(this.altitudeFeet);

        this.planeHeadingBack.style.top = this.planeHeadingIndImage.offsetTop + "px";
        this.planeHeadingBack.style.left = this.planeHeadingIndImage.offsetLeft + "px";
        this.planeHeadingBack.style.width = this.planeHeadingIndImage.offsetWidth + "px";
        this.planeHeadingBack.style.height = this.planeHeadingIndImage.offsetWidth + "px";
    }

    p.refreshHeadingValuePosition = function () {        
        this.planeHeadingValueNode.style.top = this.planeHeadingImage.offsetTop + 17 + "px";
        this.planeHeadingArrowNode.style.top = this.planeHeadingValueNode.offsetTop + this.planeHeadingValueNode.offsetHeight + "px";
        this.planeHeadingArrowNode.style.left = (Math.round(this.planeHeadingIndNode.offsetWidth - this.planeHeadingArrowNode.offsetWidth) / 2) + "px";  

        //crs
        this.planeCRSValueNode.style.top = this.planeHeadingImage.offsetTop + this.planeHeadingValueNode.offsetHeight + this.planeCRSLabelNode.offsetHeight + "px";
        this.planeCRSValueNode.style.left = this.planeHeadingIndNode.offsetWidth - this.planeCRSValueNode.offsetWidth + "px";

        this.planeCRSLabelNode.style.top = this.planeCRSValueNode.offsetTop - this.planeCRSLabelNode.offsetHeight + "px";
        this.planeCRSLabelNode.style.left = this.planeCRSValueNode.offsetLeft + "px";

        //hdg
        this.planeHDGValueNode.style.top = this.planeHeadingImage.offsetTop + this.planeHeadingValueNode.offsetHeight + this.planeCRSLabelNode.offsetHeight + "px";
        this.planeHDGValueNode.style.left = "0px"; //this.planeHeadingIndNode.offsetLeft + "px";// - this.planeHDGValueNode.offsetWidth + "px";

        this.planeHDGLabelNode.style.top = this.planeHDGValueNode.offsetTop - this.planeHDGLabelNode.offsetHeight + "px";
        this.planeHDGLabelNode.style.left = this.planeHDGValueNode.offsetLeft + "px";

        this.planeSourceInfoNode.style.top = this.planeHeadingIndImage.offsetTop + (this.planeHeadingIndImage.offsetHeight / 4) - 10 + "px";
        
    }

    p.refreshAirSpeedPosition = function () {
        var eg = document.getElementById("efis_ground").offsetTop;
        var ah = document.getElementById("air_speed").clientHeight;        
        
        //var pm = this.planeMarkNode.offsetLeft;
        var pm = this.planeMarkImage.offsetLeft; 
        var aoh = document.getElementById("air_speed").offsetHeight;
        this.planeAirSpeedNode.style.top = (eg - ah + (aoh / 2)) + "px";
        this.planeAirSpeedNode.style.left = pm - (this.planeAirSpeedNode.offsetWidth / 3) + 15 + "px";

        //this.planeAirSpeedLabelNode.style.top = this.planeAirSpeedNode.offsetTop - this.planeAirSpeedLabelNode.clientHeight - 1 + "px";
        //this.planeAirSpeedLabelNode.style.left = this.planeAirSpeedNode.offsetLeft + "px"; 

        this.planeSelectedAirSpeedNode.style.top = this.planeAirSpeedNode.offsetTop - this.planeSelectedAirSpeedNode.clientHeight - 1 + "px";
        this.planeSelectedAirSpeedNode.style.left = this.planeAirSpeedNode.offsetLeft + ((this.planeAirSpeedNode.clientWidth - this.planeSelectedAirSpeedNode.clientWidth) /2) + "px";

        this.planeTasNode.style.top = Math.round(this.planeMarkNode.clientHeight / 2) + 12 + "px"; //this.planeAirSpeedLabelNode.offsetTop + this.planeSelectedAirSpeedNode.clientHeight + this.planeVSpeedsInfoNode.clientHeight +  + "px";
        this.planeTasNode.style.left = this.planeAirSpeedNode.offsetLeft + ((this.planeAirSpeedNode.offsetWidth - this.planeTasNode.offsetWidth) / 2) + "px";
        //this.planeTasNode.style.width = this.planeAirSpeedNode.clientWidth + "px";

        //this.planeVSpeedsInfoNode.style.width = this.planeTasNode.clientWidth + "px";
        this.planeVSpeedsInfoNode.style.top = this.planeAirSpeedNode.offsetTop - Math.round((this.planeVSpeedsInfoNode.clientHeight / 2)) + "px"; //this.planeAirSpeedLabelNode.offsetTop + this.planeSelectedAirSpeedNode.clientHeight + this.planeVSpeedsInfoNode.clientHeight +  + "px";
        this.planeVSpeedsInfoNode.style.left = this.planeAirSpeedNode.offsetLeft - this.planeVSpeedsInfoNode.clientWidth - 10 + "px";
        
    }

    p.refreshHSISourcePosition = function () {
        /*var eg = document.getElementById("efis_ground").offsetTop;
        var aw = document.getElementById("air_speed").clientWidth; 

        var ah = document.getElementById("air_speed").offsetHeight;        
        this.planeSourceNode.style.minHeight = ah + "px";
        var hs = document.getElementById("hsi_source").clientHeight;

        var pm = this.planeMarkNode.offsetLeft;

        this.planeSourceNode.style.top = (eg - hs - 5) + "px";
        this.planeSourceNode.style.left = aw + pm + 1 + "px";
        

        this.planeSourceLabelNode.style.top = this.planeSourceNode.offsetTop - this.planeSourceLabelNode.clientHeight - 1 + "px";
        this.planeSourceLabelNode.style.left = this.planeSourceNode.offsetLeft + "px";

        this.planeSourceInfoNode.style.top = this.planeSourceLabelNode.offsetTop - this.planeSourceInfoNode.clientHeight - 1 + "px";
        this.planeSourceInfoNode.style.left = this.planeSourceNode.style.left;

        this.planeEtaInfoNode.style.top = Math.round(this.planeMarkNode.clientHeight / 2) + 10 + "px";
        this.planeEtaInfoNode.style.left = this.planeSourceNode.style.left;*/
    }



    p.refreshAltitudePosition = function () {
        var eg = document.getElementById("efis_ground").offsetTop;

        var ah = document.getElementById("altitude").offsetHeight;
        var aw = document.getElementById("altitude").offsetWidth;

        var vw = document.getElementById("vertical_speed").offsetWidth;
        var vh = document.getElementById("vertical_speed").offsetHeight;

        var pm = this.planeMarkNode.offsetLeft + (this.planeMarkNode.offsetWidth);

        this.planeAltitudeNode.style.top = (eg - ah + (vh / 2)) + "px";
        this.planeAltitudeNode.style.left = ((pm - aw - vw + 0) - 100) + "px";

        //this.planeAltitudeLabelNode.style.top = this.planeAltitudeNode.offsetTop - this.planeAltitudeLabelNode.offsetHeight + 1 + "px";
        //this.planeAltitudeLabelNode.style.left = this.planeAltitudeNode.offsetLeft + "px"; 

        this.planeSelectedAltitudeNode.style.top = this.planeAltitudeNode.offsetTop - this.planeSelectedAltitudeNode.offsetHeight + 1 + "px";
        this.planeSelectedAltitudeNode.style.left = this.planeAltitudeNode.offsetLeft + ((this.planeAltitudeNode.offsetWidth - this.planeSelectedAltitudeNode.offsetWidth) / 2) + "px";;

        this.planeBarometerNode.style.top = Math.round(this.planeMarkNode.clientHeight / 2) + 10 + "px";
        this.planeBarometerNode.style.left = this.planeAltitudeNode.offsetLeft + ((this.planeAltitudeNode.offsetWidth - this.planeBarometerNode.offsetWidth) /2) + "px";

        /*this.planeOatNode.style.top = Math.round(this.planeMarkNode.clientHeight / 2) + 9 + this.planeBarometerNode.offsetHeight + "px";
        this.planeOatNode.style.left = this.planeAltitudeNode.style.left;

        this.planeDpsiNode.style.top = Math.round(this.planeMarkNode.clientHeight / 2) + 8 + this.planeBarometerNode.offsetHeight + this.planeOatNode.offsetHeight + "px";
        this.planeDpsiNode.style.left = this.planeAltitudeNode.style.left;*/

        //--

        /*this.planeTimeLocalNode.style.top = Math.round(this.planeMarkNode.clientHeight / 2) + 10 + "px";
        this.planeTimeLocalNode.style.left = this.planeVSNode.style.left;

        this.planeTimeUtcNode.style.top = Math.round(this.planeMarkNode.clientHeight / 2) + 9 + this.planeTimeLocalNode.offsetHeight + "px";
        this.planeTimeUtcNode.style.left = this.planeVSNode.style.left;

        this.planeTimeSystemNode.style.top = Math.round(this.planeMarkNode.clientHeight / 2) + 8 + this.planeTimeLocalNode.offsetHeight + this.planeTimeUtcNode.offsetHeight + "px";
        this.planeTimeSystemNode.style.left = this.planeVSNode.style.left;*/
    }

    p.refreshVSPosition = function () {
        var eg = document.getElementById("efis_ground").offsetTop;

        var ah = document.getElementById("vertical_speed").clientHeight;
        var aw = document.getElementById("vertical_speed").offsetWidth;
        var vh = document.getElementById("vertical_speed").offsetHeight;
        var pm = this.planeMarkNode.offsetLeft + (this.planeMarkNode.clientWidth);

        this.planeVSNode.style.top = (eg - ah + (vh / 2) - 2) + "px";
        this.planeVSNode.style.left = ((pm - aw - 1) - 100) + "px";

        /*this.planeVSLabelNode.style.top = this.planeVSNode.offsetTop - this.planeVSLabelNode.clientHeight - 1 + "px";
        this.planeVSLabelNode.style.left = this.planeVSNode.offsetLeft + "px";*/

        this.planeSelectedVSNode.style.top = this.planeVSNode.offsetTop - this.planeSelectedVSNode.clientHeight - 1  + "px";
        this.planeSelectedVSNode.style.left = this.planeVSNode.offsetLeft + ((this.planeVSNode.offsetWidth - this.planeSelectedVSNode.offsetWidth) /2) - 1 + "px";
    }

    p.refreshHorizontalMeasurePosition = function() {
        var wrapperHeight = this.wrapperNode.offsetHeight;
        var neededCentralBlockHeight = this.horizontalDegreesLine.offsetWidth;
        var horizontalLineTop = (wrapperHeight - neededCentralBlockHeight) / 2;
        //this.horizontalDegreesLine.style.top = horizontalLineTop + 'px';

        this.horizontalDegreesLine.style.top = '15%'; //7%

        this.refreshHorizontalMark();
    }

    p.refreshHorizontalMark = function() {
        var length = this.horizontalDegreesLine.offsetWidth;
        this.horizontalDegreesMark.style.height = length + 'px';

        var top = this.horizontalDegreesLine.offsetTop;
        this.horizontalDegreesMark.style.top = top + 'px';
    }

    p.refreshVerticalDegreesLine = function() {
        if (this.verticalMeasurementlineContainer) {
            this.verticalMeasurementline = null;
            this.wrapperNode.removeChild(this.verticalMeasurementlineContainer);
        }

        this.createVerticalDegreesLine();
    }

    p.createHorizontalDegreesLine = function() {
        this.horizontalDegreesLine = document.createElement('div');
        this.horizontalDegreesLine.className = 'AH__horizontalDegreesLine';
        this.wrapperNode.appendChild(this.horizontalDegreesLine);
    }

    p.createHorizontalDegreesMark = function() {
        this.horizontalDegreesMark = document.createElement('div');
        this.horizontalDegreesMark.className = 'AH__horizontalDegreesMark';
        this.wrapperNode.appendChild(this.horizontalDegreesMark);
    }

    p.createVerticalDegreesLine = function() {
        var lineContainer = document.createElement('div');
        lineContainer.className = 'AH__verticalMeasurementLine_container';
        lineContainer.id = this.verticalMeasurementlineId;

        var lineComponent = document.createElement('div');
        lineComponent.className = 'AH__verticalMeasurementLine';

        var divHeight = this.pixelsInDegree * this.degreesPerLine;
        var amountOfLines = (360 / this.degreesPerLine);
        var offsetTop = this.wrapperNode.offsetHeight / 4;

        for (var i = - (amountOfLines / 2); i < amountOfLines; i++) {
            var line = document.createElement('div');
            line.className = 'AH__verticalMeasurementLine__verticalLine';
            line.style.top = (i * divHeight + offsetTop) + 'px';

            var lineValue = i * this.degreesPerLine
            var label = null;

            if (lineValue % 2 === 0){
                label = document.createElement('p');
                label.className = 'AH__verticalMeasurementLine__label';
                label.textContent  = Math.abs(lineValue);
                line.style.width = '100%'
                line.style.marginLeft = '0%'
                line.appendChild(label);               
            }

            var va = Math.abs(lineValue);

            if (va >= 0 && va <= 1) {
                line.style.color = "white";
                if (label) label.style.color = "white";
            }
            else {
                if (va > 1 && va <= 10) {
                    line.style.color = "mediumseagreen";
                    if (label) label.style.color = "mediumseagreen";
                }
                else {
                    if (va > 10 && va <= 20) {
                        line.style.color = "gold";
                        if (label) label.style.color = "gold";
                    }
                    else {
                        line.style.color = "orangered";
                        if (label) label.style.color = "orangered";
                    }
                }
            }

            lineComponent.appendChild(line);
        }

        lineContainer.appendChild(lineComponent);

        this.verticalMeasurementline = lineComponent;
        this.verticalMeasurementlineContainer = lineContainer;

        this.wrapperNode.appendChild(this.verticalMeasurementlineContainer);
    }

    p.updateAngles = function (horizontalAngle, verticalAngle) {
        verticalAngle = parseFloat(verticalAngle).toFixed(2);
        horizontalAngle = parseFloat(horizontalAngle).toFixed(2);

        if (this.verticalAngle != verticalAngle || this.horizontalAngle != horizontalAngle) {

            //Dont move it if variations is unperceptible in the zero pitch area
            //if (Math.abs(verticalAngle) < .5 && Math.abs(this.verticalAngle - verticalAngle) < 02) verticalAngle = this.verticalAngle;

            this.verticalAngle = verticalAngle;
            this.horizontalAngle = horizontalAngle;

            //console.log("updateAngles", horizontalAngle, verticalAngle);

            var verticalAngleLimited = Math.min(verticalAngle, this.maximumVerticalDegrees);
            verticalAngleLimited = Math.max(verticalAngle, this.minimumVerticalDegrees);

            var verticalTransformLimited = verticalAngleLimited * this.pixelsInDegree;
            var verticalTransform = verticalAngle * this.pixelsInDegree;

            this.verticalMeasurementline.style.webkitTransform = 'translate(0, ' + verticalTransform + 'px)';
            this.verticalMeasurementline.style.transform = 'translate(0, ' + verticalTransform + 'px)';

            this.movingWrapperNode.style.webkitTransform = 'rotate(' + (-horizontalAngle) + 'deg) translate(0, ' + verticalTransformLimited + 'px)';
            this.movingWrapperNode.style.transform = 'rotate(' + (-horizontalAngle) + 'deg) translate(0, ' + verticalTransformLimited + 'px)';

            this.horizontalDegreesMark.style.webkitTransform = 'rotate(' + horizontalAngle + 'deg)';
            this.horizontalDegreesMark.style.transform = 'rotate(' + horizontalAngle + 'deg)';

            var va = Math.abs(verticalAngle);

            if (va >= 0 && va <= 1) {
                $(".sksc_efis__planeMark").css("color", "white");
            }
            else {
                if (va > 1 && va <= 10) {
                    $(".sksc_efis__planeMark").css("color", "mediumseagreen");
                }
                else {
                    if (va > 10 && va <= 20) {
                        $(".sksc_efis__planeMark").css("color", "gold");
                    }
                    else {
                        $(".sksc_efis__planeMark").css("color", "orangered");
                    }
                }
            }

            var ha = Math.abs(horizontalAngle); //background-image: url("/img/mark.png");

            if (ha >= 0 && ha <= .5) {
                $(".AH__horizontalDegreesMark").css("background-image", "url('/img/mark_transp.png')");
            }
            else {
                if (ha >= .5 && ha <= 5) {
                    $(".AH__horizontalDegreesMark").css("background-image", "url('/img/mark.png')");
                }
                else {
                    if (ha > 5 && ha <= 20) {
                        $(".AH__horizontalDegreesMark").css("background-image", "url('/img/mark_green.png')");
                    }
                    else {
                        if (ha > 20 && ha <= 30) {
                            $(".AH__horizontalDegreesMark").css("background-image", "url('/img/mark_yellow.png')");
                        }
                        else {
                            $(".AH__horizontalDegreesMark").css("background-image", "url('/img/mark_red.png')");
                        }
                    }
                }
            }

            if (this.fd_enabled) this.updateFD();

        }
    }

    p.updateRollAngle = function (rollAngle) {
        /*if (!this.updatingVH) {
            this.updatingVH = true;

            var i;
            var p = this.horizontalAngle;

            if (rollAngle > p) {
                for (i = p; i <= rollAngle; i++) {
                    this.updateAngles(i, this.verticalAngle);
                };
            }
            else {
                for (i = p; i >= rollAngle; i--) {
                    this.updateAngles(i, this.verticalAngle);
                };
            }

            this.updatingVH = false;
        }*/

        this.updateAngles(rollAngle, this.verticalAngle);
    }

    p.updatePitchAngle = function (pitchAngle) {
        /*if (!this.updatingVH) {
            this.updatingVH = true;

            var i;
            var p = this.verticalAngle;

            if (pitchAngle > p) {
                for (i = p; i <= pitchAngle; i++) {
                    this.updateAngles(this.horizontalAngle, i);
                };
            }
            else {
                for (i = p; i >= pitchAngle; i--) {
                    this.updateAngles(this.horizontalAngle, i);
                };
            }

            this.updatingVH = false;
        }*/

        this.updateAngles(this.horizontalAngle, pitchAngle);
    }
 
    /*p.initMotionListener = function() {
        if (w.DeviceOrientationEvent !== undefined && this.autoUpdate !== false) {
            w.addEventListener('deviceorientation', this.onOrientationChanged.bind(this));
        }
    }*/

    p.onOrientationChanged = function(e) {
        var verticalAngle = e[this.getVerticalAxis()];

        if (window.skscEfis.iOS === true) {
            verticalAngle = -verticalAngle - 90;
        }

        var newHorizontalAngle = this.filterByNoiseBarrier(this.angleHorizontal, e[this.getHorizontalAxis()]);
        var newVerticalAngle = this.filterByNoiseBarrier(this.angleVertical, verticalAngle);

        if (newHorizontalAngle !== this.angleHorizontal) {
            this.angleHorizontal = newHorizontalAngle;
        }

        if (newVerticalAngle !== this.angleVertical) {
            this.angleVertical = newVerticalAngle;
        }

        this.updateAngles(newHorizontalAngle, newVerticalAngle);
    }

    p.getHorizontalAxis = function() {
        if (this.horizontalAxis === undefined) {
            if (window.skscEfis.iOS) {
               this.horizontalAxis = 'beta';
            } else {
               this.horizontalAxis = 'gamma';
            }
        }
        return this.horizontalAxis;
    }

    p.getVerticalAxis = function() {
        if (this.verticalAxis === undefined) {
            if (window.skscEfis.iOS) {
               this.verticalAxis = 'gamma';
            } else {
               this.verticalAxis = 'beta';
            }
        }
        return this.verticalAxis;
    }

    p.filterByNoiseBarrier = function(oldVar, newVar) {
        if (Math.abs(oldVar - newVar) > this.noiseBarrier) {
            oldVar = newVar;
        }
        return oldVar;
    }
    
    p.updateAltitude = function (altitudeFeet) {        
        var sarrow = "";

        if (parseFloat(altitudeFeet) > this.altitudeFeet) {
            sarrow = "&#8593;";
        }
        else if (parseFloat(altitudeFeet) < this.altitudeFeet) {
            sarrow = "&#8595;";
        }
        
        //this.altitudeFeet = parseFloat(altitudeFeet).toFixed(1);
        this.altitudeFeet = parseFloat(altitudeFeet);

        this.planeAltitudeNode.innerHTML = sarrow + " " + Math.round(parseFloat(altitudeFeet) / 10) * 10;               
    }

    p.updateSelectedAltitude = function (altitudeFeet) {        
        this.planeSelectedAltitudeNode.textContent = altitudeFeet;
    }

    p.updateBarometer = function (barometer) {
        this.planeBarometerNode.textContent = barometer;
    }

    /*p.updateOat = function (oat) {
        this.planeOatNode.innerHTML = oat + " &#176;C";
    }

    p.updateDpsi = function (dpsi) {
        this.planeDpsiNode.innerHTML = dpsi;
    }*/

    //--

    p.updateTimeLocal = function (time) {
        //this.planeTimeLocalNode.textContent = time + " L";
    }

    p.updateTimeUtc = function (time) {
        //this.planeTimeUtcNode.textContent = time + " Z";
    }

    p.updateTimeSystem = function (time) {
        //this.planeTimeSystemNode.textContent = time + " S";
    }

    p.updateVS = function (VSFeet) {
        VSFeet = parseFloat(VSFeet);

        var sarrow = "";

        if (parseFloat(VSFeet) > this.VSFeet) {
            sarrow = "&#8593;";
        }
        else if (parseFloat(VSFeet) < this.VSFeet) {
            sarrow = "&#8595;";
        }

        this.VSFeet = parseFloat(VSFeet);

        this.planeVSNode.innerHTML = sarrow + " " + Math.round(parseFloat(VSFeet) / 50) * 50;        
    }

    p.updateVSBug = function (VSBug) {        
        this.planeSelectedVSNode.textContent = VSBug;
    }
    //-----------------------------------------------------------------------------------------------

    p.updateOpacity = function (opacity) {
        this.groundNode.style.opacity = opacity;
        this.skyNode.style.opacity = opacity;
    }
    //-----------------------------------------------------------------------------------------------

    //Heading
    //-----------------------------------------------------------------------------------------------
    p.updateHeading = function (heading) {

        this.planeHeadingValueNode.innerHTML = this.pad(heading, 3) + "&deg;"; //&nbsp;

        this.heading = -heading; //Needs to be negative here to draw it correctly.

        this.planeHeadingImage.style.webkitTransform = 'rotate(' + this.heading + 'deg)';
        this.planeHeadingImage.style.transform = 'rotate(' + this.heading + 'deg)';

        this.updateHDG(this.hdg);
        this.updateCRS(this.crs, this.cdi);
    }

    p.pad = function (num, size) {
        var s = Math.round(num) + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    //HDG
    //-----------------------------------------------------------------------------------------------
    p.updateHDG = function (hdg) {
        this.planeHDGValueNode.innerHTML = this.pad(hdg, 3) + "&deg;";

        this.hdg = hdg;

        var r = this.heading + this.hdg;

        this.planeHDGIndImage.style.webkitTransform = 'rotate(' + r + 'deg)';
        this.planeHDGIndImage.style.transform = 'rotate(' + r + 'deg)';        
    }   

    //CRS
    //-----------------------------------------------------------------------------------------------
    p.updateCRS = function (crs, cdi) {     
        this.planeCRSValueNode.innerHTML = this.pad(crs, 3) + "&deg;";

        this.crs = crs;
        this.cdi = cdi;

        var r = this.heading + this.crs;

        this.planeCRSIndImage.style.webkitTransform = 'rotate(' + r + 'deg)';
        this.planeCRSIndImage.style.transform = 'rotate(' + r + 'deg)';

        if (cdi) {
            this.planeDEFIndImage.style.webkitTransform = 'rotate(' + r + 'deg) translateX(' + cdi + 'px)';
            this.planeDEFIndImage.style.transform = 'rotate(' + r + 'deg) translateX(' + cdi + 'px)';
        }
        else {
            this.planeDEFIndImage.style.webkitTransform = 'rotate(' + r + 'deg)';
            this.planeDEFIndImage.style.transform = 'rotate(' + r + 'deg)';
        }
    }

    p.updateCDI = function (cdi) {
        this.updateCRS(this.crs, cdi);
    }

    p.updateADF = function (adf) {
        //this.planeCRSValueNode.innerHTML = this.pad(crs, 3) + "&deg;";

        this.adf = adf;
        
        var r = this.heading + this.adf;

        this.planeAdfIndImage.style.webkitTransform = 'rotate(' + r + 'deg)';
        this.planeAdfIndImage.style.transform = 'rotate(' + r + 'deg)';       
    }

    //AirSpeed
    //-----------------------------------------------------------------------------------------------
    p.updateAirSpeed = function (speed) {      
        speed = Math.max(0, (parseFloat(speed)));

        var sarrow = "";

        if (parseFloat(speed) > this.air_speed) {
            sarrow = "&#8593;";
        }
        else if (parseFloat(speed) < this.air_speed) {
            sarrow = "&#8595;";
        }

        this.air_speed = speed; //.toFixed(1);
        this.planeAirSpeedNode.innerHTML = sarrow + " " + parseFloat(speed).toFixed(1);;

        //this.planeAirSpeedNode.innerHTML = sarrow + " " + parseFloat(speed).toFixed(1);

        this.planeAirSpeedNode.style.color = "#eee0d3";

        if (this.vso && this.vs && this.vfe && this.vno && this.vne && this.vso > 0 && this.vs > 0 && this.vfe > 0 && this.vno > 0 && this.vne > 0) {
            if (speed <= this.vsow) {
                //this.planeAirSpeedNode.style.backgroundColor = hexToRgbA(document.getElementById("vso_value").style.color, .8);                
                this.planeAirSpeedNode.style.color = document.getElementById("vso_value").style.color;
                this.planeAirSpeedNode.style.borderColor = this.planeAirSpeedNode.style.color;
                this.planeAirSpeedNode.style.boxShadow = "0 0 10px 5px " + this.planeAirSpeedNode.style.color;

                document.getElementById("vso_value").innerHTML = "&rArr; " + this.vso;
                document.getElementById("vs_value").textContent  = this.vs;
                document.getElementById("vfe_value").textContent  = this.vfe;
                document.getElementById("vno_value").textContent  = this.vno;
                document.getElementById("vne_value").textContent  = this.vne;

                document.getElementById("vso_value").style.backgroundColor = "whitesmoke";
                document.getElementById("vs_value").style.backgroundColor = "";
                document.getElementById("vfe_value").style.backgroundColor = "";
                document.getElementById("vno_value").style.backgroundColor = "";
                document.getElementById("vne_value").style.backgroundColor = "";
            }
            else
                if (speed > this.vso && speed <= this.vsw) {
                    //this.planeAirSpeedNode.style.backgroundColor = hexToRgbA(document.getElementById("vs_value").style.color,.9);
                    //this.planeAirSpeedNode.style.color = "black";

                    this.planeAirSpeedNode.style.color = document.getElementById("vs_value").style.color;
                    this.planeAirSpeedNode.style.borderColor = this.planeAirSpeedNode.style.color;
                    this.planeAirSpeedNode.style.boxShadow = "0 0 10px 5px " + this.planeAirSpeedNode.style.color;

                    document.getElementById("vso_value").textContent  = this.vso;
                    document.getElementById("vs_value").innerHTML = "&rArr; " + this.vs;
                    document.getElementById("vfe_value").textContent  = this.vfe;
                    document.getElementById("vno_value").textContent  = this.vno;
                    document.getElementById("vne_value").textContent  = this.vne;

                    document.getElementById("vso_value").style.backgroundColor = "";
                    document.getElementById("vs_value").style.backgroundColor = "whitesmoke";
                    document.getElementById("vfe_value").style.backgroundColor = "";
                    document.getElementById("vno_value").style.backgroundColor = "";
                    document.getElementById("vne_value").style.backgroundColor = "";
                }
                else
                    if (speed > this.vsw && ((this.flaps == 0 && speed <= this.vnow) || (this.flaps > 0 && speed <= this.vfew))) {

                        //this.planeAirSpeedNode.style.backgroundColor = '';
                        this.planeAirSpeedNode.style.color = "#eee0d3";                        
                        this.planeAirSpeedNode.style.borderColor = "green";
                        this.planeAirSpeedNode.style.boxShadow = "0 0 5px 1px green";
                        
                        document.getElementById("vso_value").textContent  = this.vso;
                        document.getElementById("vs_value").textContent  = this.vs;
                        document.getElementById("vfe_value").textContent  = this.vfe;
                        document.getElementById("vno_value").textContent  = this.vno;
                        document.getElementById("vne_value").textContent  = this.vne;

                        document.getElementById("vso_value").style.backgroundColor = "";
                        document.getElementById("vs_value").style.backgroundColor = "";
                        document.getElementById("vfe_value").style.backgroundColor = "";
                        document.getElementById("vno_value").style.backgroundColor = "";
                        document.getElementById("vne_value").style.backgroundColor = "";
                    }
                    else
                        if (this.flaps > 0 && (speed > this.vfew && speed <= this.vnow)) {
                            //this.planeAirSpeedNode.style.backgroundColor = document.getElementById("vfe_value").style.color;
                            //this.planeAirSpeedNode.style.color = "black";

                            this.planeAirSpeedNode.style.color = document.getElementById("vfe_value").style.color;
                            this.planeAirSpeedNode.style.borderColor = this.planeAirSpeedNode.style.color;
                            this.planeAirSpeedNode.style.boxShadow = "0 0 10px 5px " + this.planeAirSpeedNode.style.color;


                            document.getElementById("vso_value").textContent = this.vso;
                            document.getElementById("vs_value").textContent  = this.vs;
                            document.getElementById("vfe_value").innerHTML = "&rArr; " + this.vfe;
                            document.getElementById("vno_value").textContent  = this.vno;
                            document.getElementById("vne_value").textContent  = this.vne;

                            document.getElementById("vso_value").style.backgroundColor = "";
                            document.getElementById("vs_value").style.backgroundColor = "";
                            document.getElementById("vfe_value").style.backgroundColor = "whitesmoke";
                            document.getElementById("vno_value").style.backgroundColor = "";
                            document.getElementById("vne_value").style.backgroundColor = "";
                        }
                        else
                            if (speed > this.vnow && speed <= this.vnew) {
                                //this.planeAirSpeedNode.style.backgroundColor = document.getElementById("vno_value").style.color;
                                //this.planeAirSpeedNode.style.color = "black";

                                this.planeAirSpeedNode.style.color = document.getElementById("vno_value").style.color;
                                this.planeAirSpeedNode.style.borderColor = this.planeAirSpeedNode.style.color;
                                this.planeAirSpeedNode.style.boxShadow = "0 0 10px 5px " + this.planeAirSpeedNode.style.color;

                                document.getElementById("vso_value").textContent = this.vso;
                                document.getElementById("vs_value").textContent  = this.vs;
                                document.getElementById("vfe_value").textContent  = this.vfe;
                                document.getElementById("vno_value").innerHTML = "&rArr; " + this.vno;
                                document.getElementById("vne_value").textContent  = this.vne;

                                document.getElementById("vso_value").style.backgroundColor = "";
                                document.getElementById("vs_value").style.backgroundColor = "";
                                document.getElementById("vfe_value").style.backgroundColor = "";
                                document.getElementById("vno_value").style.backgroundColor = "whitesmoke";
                                document.getElementById("vne_value").style.backgroundColor = "";
                            }
                            else
                                if (speed > this.vnew) {
                                    //this.planeAirSpeedNode.style.backgroundColor = document.getElementById("vne_value").style.color;

                                    this.planeAirSpeedNode.style.color = document.getElementById("vne_value").style.color;
                                    this.planeAirSpeedNode.style.borderColor = this.planeAirSpeedNode.style.color;
                                    this.planeAirSpeedNode.style.boxShadow = "0 0 10px 5px " + this.planeAirSpeedNode.style.color;

                                    document.getElementById("vso_value").textContent = this.vso;
                                    document.getElementById("vs_value").textContent  = this.vs;
                                    document.getElementById("vfe_value").textContent  = this.vfe;
                                    document.getElementById("vno_value").textContent  = this.vno;
                                    document.getElementById("vne_value").innerHTML = "&rArr; " + this.vne;

                                    document.getElementById("vso_value").style.backgroundColor = "";
                                    document.getElementById("vs_value").style.backgroundColor = "";
                                    document.getElementById("vfe_value").style.backgroundColor = "";
                                    document.getElementById("vno_value").style.backgroundColor = "";
                                    document.getElementById("vne_value").style.backgroundColor = "whitesmoke";
                                }
        }
    }

    p.updateSelectedAirSpeed = function (speed) {
        this.planeSelectedAirSpeedNode.textContent = speed;
    }    

    p.updateTas = function (tas) {
        this.planeTasNode.innerHTML = "<small style='color: navajowhite;'>TAS:</small>&nbsp;" + parseInt(tas); //parseFloat(tas).toFixed(1);
    }

    //HSI Source
    //-----------------------------------------------------------------------------------------------
    p.updateHSISource = function (source) {
        //this.planeSourceNode.textContent = source;
    }

    p.updateHSISourceInfo = function (sourceInfo) {
        this.planeSourceInfoNode.textContent = sourceInfo;
    }

    p.updateHSIEtaInfo = function (eta) {
       // this.planeEtaInfoNode.textContent = eta;
    }

    //AP Info
    //-----------------------------------------------------------------------------------------------
    p.updateAPInfo1 = function (info) {
        document.getElementById("ap_info_1").textContent = info;
    }
    p.updateAPInfo2 = function (info) {
        document.getElementById("ap_info_2").textContent = info;
    }
    p.updateAPInfo3 = function (info) {
        document.getElementById("ap_info_3").textContent = info;
    }

    //FD
    //-----------------------------------------------------------------------------------------------
    p.updateFDVisible = function (visible) {
        if (visible) {
            this.planeFDCommandNode.style.display = "block";
            this.fd_enabled = true;
        }
        else {
            this.planeFDCommandNode.style.display = "none";
            this.fd_enabled = false;
        }
    }

    p.updateFDRoll = function (fd_roll) {
        this.fd_roll = fd_roll; 

        //this.updateFD();        
    }

    p.updateFDPitch = function (fd_pitch) {
        this.fd_pitch = -fd_pitch;        

        //this.updateFD();        
    }

    p.updateFD = function () {
        var pitch = parseFloat(indicator.fd_pitch) + parseFloat(indicator.verticalAngle);
        var roll = parseFloat(indicator.fd_roll) - parseFloat(indicator.horizontalAngle);

        /*var verticalAngleLimited = Math.min(pitch, this.maximumVerticalDegrees);
        verticalAngleLimited = Math.max(pitch, this.minimumVerticalDegrees);

        var verticalTransformLimited = (verticalAngleLimited * (this.pixelsInDegree));*/
        var verticalTransform = (pitch * (this.pixelsInDegree));

        this.planeFDCommandImage.style.webkitTransform = 'rotate(' + roll + 'deg) translate(0, ' + verticalTransform + 'px)';
        this.planeFDCommandImage.style.transform = 'rotate(' + roll + 'deg) translate(0, ' + verticalTransform + 'px)';
    }

    //Fix Vxx misunderstandings
    p.chckVxx = function () {
        //Turbo comander vno and vfe are swapped
        if (this.vno > 0 && this.vfe > 0 && this.vno < this.vfe) {           
            [this.vno, this.vfe] = [this.vfe, this.vno];
        }

        //TBM900 vno is 999
        if (this.vno == 999 && this.vfe > 0 ) {
            this.vno = this.vfe;
        }

        this.vnew = this.vne * this.vxw;
        this.vnow = this.vno * this.vxw;
        this.vfew = this.vfe * this.vxw;
        this.vsw = this.vs * this.vyw;
        this.vsow = this.vso * this.vyw;

        document.getElementById("vne_value").innerHTML = this.vne;
        document.getElementById("vno_value").innerHTML = this.vno;
        document.getElementById("vfe_value").innerHTML = this.vfe;
        document.getElementById("vs_value").innerHTML = this.vs;
        document.getElementById("vso_value").innerHTML = this.vso;
    }

    p.updateVNE = function (vne) {
        this.vne = Math.round(vne);        

        this.chckVxx();        
    }

    p.updateVNO = function (vno) {
        this.vno = Math.round(vno);

        this.chckVxx();        
    }

    p.updateVFE = function (vfe) {
        this.vfe = Math.round(vfe);

        this.chckVxx();        
    }

    p.updateVSX = function (vs) {
        this.vs = Math.round(vs);

        this.chckVxx();        
    }

    p.updateVSO = function (vso) {
        this.vso = Math.round(vso);

        this.chckVxx();        
    }

    p.updateTAS = function (tas) {
        document.getElementById("tas_value").innerHTML = tas;
    }

    p.updateGS = function (gs) {
        document.getElementById("gs_value").innerHTML = gs;
    }

    p.updateFlaps = function (flaps) {
        this.flaps = parseFloat(flaps);        
    }

})(window);

//Styles initialization
var head = document.getElementsByTagName('head')[0];
var styleTag = document.createElement('link');
var scripts = document.getElementsByTagName("script");
var src = scripts[scripts.length-1].src.substring(0, scripts[scripts.length-1].src.lastIndexOf('/') + 1);
styleTag.href = src + 'sksc_efis.css?' + Math.random();
styleTag.rel   = 'stylesheet';
styleTag.type  = 'text/css';
head.appendChild(styleTag);

window.skscEfis.path = src;
window.skscEfis.iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );

// Mozilla bind polyfill
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}