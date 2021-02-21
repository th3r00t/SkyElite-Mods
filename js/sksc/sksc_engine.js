(function (w) {    
    //engineGauge, engineTable, engineType, engineDisplay, engineTickInterval, engineFactor, engineValueCorrector

    w.sksc_engine = function (options) {
        this.nm_factor = 1.35581794884;
        this.is_lbft = false;

        this.enginePosition = options.enginePosition;

        this.engineGauge = options.hasOwnProperty('engineGauge') ? options.engineGauge : null;        
        this.engineTable = options.hasOwnProperty('engineTable') ? options.engineTable : null;       
        
        this.engineType = options.hasOwnProperty('engineType') ? options.engineType : "LBFT";  
        this.engineDisplay = options.hasOwnProperty('engineDisplay') ? options.engineDisplay : 0;       //0 Value, 1 %
        this.engineTitle = options.hasOwnProperty('engineTitle') ? options.engineTitle : this.engineType;  
        this.engineTickInterval = options.hasOwnProperty('engineTickInterval') ? options.engineTickInterval : 10;  
        this.engineFactor = options.hasOwnProperty('engineFactor') ? options.engineFactor : 1;  
        this.engineValueCorrector = options.hasOwnProperty('engineValueCorrector') ? options.engineValueCorrector : 1; ; //TMB looks like is x 3 or more of the indicated 

        this.engineTypeOriginal = this.engineType;
        this.is_lbft = (this.engineType == this.engines.TRQ_LBFT);
        if (!this.is_lbft) this.nm_factor = 1; 
        if (this.engineType == this.engines.TRQ_LBFT || this.engineType == this.engines.TRQ_NM) this.engineType = this.engines.TRQ;

        this.engine_max_percent = 100;
        this.engine_min_value = options.hasOwnProperty('engine_min_value') ? options.engine_min_value : 0;  

        this.engineOverride = options.hasOwnProperty('engineOverride') ? options.engineOverride : 0;  

        if (this.engineOverride && options.hasOwnProperty('override_min') && options.hasOwnProperty('override_red') && options.hasOwnProperty('override_green') && options.hasOwnProperty('override_max')) {
            this.engine_min = options.override_min;
            this.engine_red = options.override_red;
            this.engine_green = options.override_green;
            this.engine_max = options.override_max;

            this.engine_max_percent = options.hasOwnProperty('override_max_percent') ? options.override_max_percent : 100;  
        }
        else {
            this.engineOverride == 0;
        }

        if (!this.engineOverride) {

            switch (this.engineType) {
                case this.engines.EPR:
                    this.engine_min = 1;
                    this.engine_red = 2;
                    this.engine_green = 2;
                    this.engine_max = 2;

                    break;

                case this.engines.N1:
                case this.engines.N2:
                    this.engine_min = 0;
                    this.engine_red = 100;
                    this.engine_green = 100;
                    this.engine_max = 100;

                    break;

                default:
                    this.engine_min = 0;
                    this.engine_red = 0;
                    this.engine_green = 0;
                    this.engine_max = -1;

                    break;
            }
        }

        this.acf_num_engines = 0;
        this.acf_num_engines_done = false;
        this.engine_values = new Array(4);

        var i;
        for (i = 0; i < this.engine_values.length; i++) {
            this.engine_values[i] = 0;
        }

        this.engine_color = ["whitesmoke", "yellowgreen", "darkorange", "orangered"];

        window.addEventListener('resize', this.resize.bind(this));

        var that = this;

        setTimeout(function () {
            that.refreshValues();            
            
            console.log("timeout refreshValues");
        }, 3000); 


        /*this.engineInitInterval;

        var that = this;

        setTimeout(function () {
            that.engineInitInterval = setInterval(function () {                           
                console.log("here ", that.engineInitInterval, that.engineTable);

                if (that.engineInitInterval != undefined && parseFloat(stored_data["sim/aircraft/engine/acf_num_engines"]) > 0) {
                    
                    clearInterval(that.engineInitInterval);

                    that.set_acf_num_engines(parseFloat(stored_data["sim/aircraft/engine/acf_num_engines"]));
                    that.engineInitInterval = undefined;
                    console.log("here1 ", that.engineInitInterval, that.engineTable);
                }
            }, 100);       
        }, 500);       */
    }

    var p = w.sksc_engine.prototype;

    p.resize = function () {
        this.engineGauge.option("size.width", this.vh(20));
        this.engineGauge.option("size.height", this.vh(13));
    }    

    p.engines = {
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

    p.set_acf_num_engines = function (value) {
        console.log("set_acf_num_engines", value)

        this.acf_num_engines = value;

        //this.resize_array(this.engine_values, value);
        this.engine_values.length = value;

        this.engineGauge.subvalues(this.engine_values); 

        this.refresh_ENGN_scales();
    }

    p.resize_array = function (c_array, n_len) {
        var t_array = c_array;
        this.engine_values = new Array(n_len);

        var i;
        for (i = 0; i < this.engine_values.length; i++) {
            this.engine_values[i] = t_array[i];
        }
    }

    p.engines_avg = function () {
        var filtered = this.engine_values.filter(item => item > 0);

        if (filtered && filtered.length) {
            return filtered.reduce((a, b) => a + b) / filtered.length;
        }
        else
            return 0;
    }

    p.refresh_ENGN_scales = function () 
    {
        if (this.acf_num_engines > 0) {
            this.engineGauge.option("scale.tickInterval", this.engineTickInterval);

            /*if (this.engineDisplay == 1) {
                this.engineGauge.option("title.text", "%");
            } else {
                this.engineGauge.option("title.text", this.engineType);
            }*/

            this.engineGauge.option("title.text", this.engineTitle);

            switch (this.engineDisplay) {
                case 1:
                    this.engineGauge.option("scale.startValue", this.engine_min);
                    this.engineGauge.option("scale.endValue", this.engine_max_percent);

                    this.engineGauge.option("rangeContainer.ranges[0].startValue", this.engine_min);
                    this.engineGauge.option("rangeContainer.ranges[0].endValue", this.engine_green);

                    this.engineGauge.option("rangeContainer.ranges[1].startValue", this.engine_green);
                    this.engineGauge.option("rangeContainer.ranges[1].endValue", this.engine_red);


                    this.engineGauge.option("rangeContainer.ranges[2].startValue", this.engine_red);
                    this.engineGauge.option("rangeContainer.ranges[2].endValue", this.engine_max_percent);

                    break;

                default:
                    this.engineGauge.option("scale.startValue", this.engine_min);
                    this.engineGauge.option("scale.endValue", this.engine_max);

                    this.engineGauge.option("rangeContainer.ranges[0].startValue", this.engine_min);
                    this.engineGauge.option("rangeContainer.ranges[0].endValue", this.engine_green);

                    this.engineGauge.option("rangeContainer.ranges[1].startValue", (this.engine_green));
                    this.engineGauge.option("rangeContainer.ranges[1].endValue", this.engine_red);


                    this.engineGauge.option("rangeContainer.ranges[2].startValue", (this.engine_red));
                    this.engineGauge.option("rangeContainer.ranges[2].endValue", this.engine_max);

                    break;
            }

            $(this.engineGauge._$element).find('.dxg-subvalue-indicator').eq(3).first().attr("fill", this.engine_color[3]);
            $(this.engineGauge._$element).find('.dxg-subvalue-indicator').eq(2).first().attr("fill", this.engine_color[2]);
            $(this.engineGauge._$element).find('.dxg-subvalue-indicator').eq(1).first().attr("fill", this.engine_color[1]);
            $(this.engineGauge._$element).find('.dxg-subvalue-indicator').eq(0).first().attr("fill", this.engine_color[0]);                                  

            $(this.engineTable).find('td').eq(0).first().show();
            $(this.engineTable).find('td').eq(1).first().show();
            $(this.engineTable).find('td').eq(2).first().show();
            $(this.engineTable).find('td').eq(3).first().show();

            $(this.engineTable).find('td').eq(0).first().css("color", this.engine_color[0]);
            $(this.engineTable).find('td').eq(1).first().css("color", this.engine_color[1]);
            $(this.engineTable).find('td').eq(2).first().css("color", this.engine_color[2]);
            $(this.engineTable).find('td').eq(3).first().css("color", this.engine_color[3]);

            var i;
            for (i = this.acf_num_engines; i < 4; i++) {
                $(this.engineTable).find('td').eq(i).first().hide();
            }

            this.acf_num_engines_done = true;            
        }
    }

    p.set_ENGN_green = function (value) 
    {
        if (Number.isNaN(value)) return false;

        if (value == 0) value = this.engine_max;

        switch (this.engineType) {
            case this.engines.N1:
            case this.engines.N2:
            case this.engines.EPR:
            
                if (value > this.engine_green) {
                    console.log("ENGINE set_ENGN_green " + this.engineType + " "  + value);

                    this.engine_green = value * this.engineFactor;

                    if (this.engine_max < this.engine_green) this.engine_max = this.engine_green;
                }

                break;

            case this.engines.EGT:
            case this.engines.OILP:
            case this.engines.OILT:
            case this.engines.CHT:
            case this.engines.ITT:            
            case this.engines.PROP:
            case this.engines.MAP:            
                if (this.engine_green == 0) {                
                    console.log("ENGINE set_ENGN_green " + value);

                    this.engine_green = value * this.engineFactor;

                }

                break;

            case this.engines.TRQ:
                if (this.engine_green == 0) {
                    console.log("ENGINE set_ENGN_green " + value);

                    this.engine_green = (value / this.nm_factor) * this.engineFactor;
                }

                break;
        }

        this.refresh_ENGN_scales();
    }

    p.set_ENGN_red = function (value)
    {
        if (Number.isNaN(value)) return false;

        if (value == 0) value = this.engine_max;

        switch (this.engineType) {
            case this.engines.N1:
            case this.engines.N2:
            case this.engines.EPR:            
                if (value > this.engine_red) {
                    console.log("ENGINE set_ENGN_red " + this.engineType + " " + value);

                    this.engine_red = value * this.engineFactor;

                    if (this.engine_max < this.engine_red) this.engine_max = this.engine_red;
                }

                break;

            case this.engines.EGT:
            case this.engines.OILP:
            case this.engines.OILT:
            case this.engines.CHT:
            case this.engines.ITT:            
            case this.engines.PROP:
            case this.engines.MAP:
                if (this.engine_red == 0) {                
                    console.log("ENGINE set_ENGN_red " + value);

                    this.engine_red = value * this.engineFactor;
                }

                break;

            case this.engines.TRQ:
                if (this.engine_red == 0) {
                    console.log("ENGINE set_ENGN_red " + value);

                    this.engine_red = (value / this.nm_factor) * this.engineFactor;
                }

                break;
        }

        this.refresh_ENGN_scales();
    }


    p.set_ENGN_max = function (value)
    {
        if (Number.isNaN(value)) return false;

        switch (this.engineType) {
            case this.engines.N1:
            case this.engines.N2:
            case this.engines.EPR:            
                if (value > this.engine_max) {
                    console.log("ENGINE set_ENGN_max " + this.engineType + " " + value);

                    this.engine_max = value * this.engineFactor;
                }

                break;

            case this.engines.EGT:
            case this.engines.OILP:
            case this.engines.OILT:
            case this.engines.CHT:
            case this.engines.ITT:            
            case this.engines.PROP:
            case this.engines.MAP:
                if (this.engine_max <= 0) {                
                    console.log("ENGINE set_ENGN_max " + value);

                    this.engine_max = value * this.engineFactor;
                }

                break;
            case this.engines.TRQ:
                if (this.engine_max <= 0) {
                    console.log("ENGINE set_ENGN_max " + value);

                    this.engine_max = (value / this.nm_factor) * this.engineFactor;
                }

                break;
        }

        /*if (this.engine_green <= 0) this.engine_green = this.engine_max;
        if (this.engine_red <= 0) this.engine_red = this.engine_max;*/

        console.log("ENGINE set_ENGN_max " + this.engine_max + " " + this.engine_green + " " + this.engine_red);

        this.refresh_ENGN_scales();
    }

    p.reset_ENGN_RPM = function () {
        if (this.engineType == this.engines.PROP && this.engine_max <= 0) {
            var pmax = parseFloat(stored_data["sim/aircraft/controls/acf_RSC_redline_prp"]) * 30 / Math.PI;
            this.set_ENGN_green(pmax);
            this.set_ENGN_red(pmax);
            this.set_ENGN_max(pmax);
        }
    }

    p.refreshValues = function ()
    {
        if (this.acf_num_engines <= 0 && parseFloat(stored_data["sim/aircraft/engine/acf_num_engines"]) > 0) {
            this.set_acf_num_engines(parseFloat(stored_data["sim/aircraft/engine/acf_num_engines"]));
        }

        this.reset_ENGN_RPM();

        var i;
        for (i = 0; i < this.engine_values.length; i++) {
            this.set_ENGN_value(this.engine_values[i], i);
        }
    }

    p.set_ENGN_value = function (value, index)
    {
        if (value >= 0 && (this.acf_num_engines == 0 || this.acf_num_engines > 0 && index < this.acf_num_engines)) {
            var eval = 0;
            value = Math.max(value, this.engine_min_value);

            switch (this.engineType) {                
                case this.engines.N1:
                case this.engines.N2:
                case this.engines.EPR:
                case this.engines.EGT:
                case this.engines.OILP:
                case this.engines.OILT:
                case this.engines.CHT:
                case this.engines.ITT:
                case this.engines.PROP:
                case this.engines.MAP:
                    eval = parseFloat(value) * this.engineFactor;

                    break;

                case this.engines.TRQ:
                    eval = (value / this.nm_factor) * this.engineFactor;

                    break;
            }

            if (this.engineDisplay == 1) eval = (eval / this.engine_max) * 100;

            eval = eval * this.engineValueCorrector;

            this.engine_values[index] = eval;

            if (this.acf_num_engines_done) {
                this.engineGauge.subvalues(this.engine_values);
                this.engineGauge.value(this.engines_avg());

                switch (this.engineType) {
                    case this.engines.EGT:
                    case this.engines.OILP:
                    case this.engines.OILT:
                    case this.engines.CHT:
                    case this.engines.ITT:                    
                    case this.engines.PROP:                    
                        $(this.engineTable).find('td').eq(index).first().text(Math.round(eval));
                        break;
                    case this.engines.MAP:
                    case this.engines.EPR:
                        $(this.engineTable).find('td').eq(index).first().text(eval.toFixed(2));
                        break;
                    case this.engines.TRQ:
                        if (this.engineDisplay == 1) {
                            $(this.engineTable).find('td').eq(index).first().text(Math.round(eval) + " %");
                        }
                        else {
                            if (!this.is_lbft) {
                                $(this.engineTable).find('td').eq(index).first().text(eval.toFixed(1));
                            }
                            else {
                                $(this.engineTable).find('td').eq(index).first().text(Math.round(eval));
                            }
                        }
                        break;
                    default:
                        $(this.engineTable).find('td').eq(index).first().text(eval.toFixed(1));
                        break;
                }                
            }
        }
    }

    p.vh = function (v)
    {
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        return (v * h) / 100;
    }

    p.vw = function (v)
    {
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        return (v * w) / 100;
    }

})(window);
