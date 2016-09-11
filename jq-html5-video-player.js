var html5VideoPlayer = function(element,options){
	/* define class name */
	var prefix = "h5vp";
	var className = {"target" : prefix,
                     "Video_control" : prefix + "_Video_control",
					 "controlBar" : prefix+"_controlBar",
					 "panel" : prefix+"_panel",
					 "panel_play" : prefix+"_panel_play",
					 "panel_Timeline" : prefix+"_panel_Timeline",
					 "panel_speaker" : prefix+"_panel_speaker",
					 "panel_Chapter" : prefix+"_panel_Chapter",

                     "Noti_Box" : prefix+"_Noti_Box",

					 "btn_player" : prefix+"_btn_player",

					 "Timeline_Contenter":prefix+"_Timeline_Contenter",
					 "TimelineBar":prefix+"_TimelineBar",
                     "TimelineBar_NoneClick":prefix+"_TimelineBar_NoneClick",
                     "TimelineOrgBar":prefix+"_TimelineOrgBar",
                     "TimelineLoading" : prefix+"_TimelineLoading",

					 "TimeBarClickArea" : prefix+"_TimeBarClickArea",
					 "TimeBarNoneClickArea" : prefix+"_TimeBarNoneClickArea",
					 "TimeBarLimitBracket" : prefix+"_TimeBarLimitBracket",
                     "TimelineBar_Ball" : prefix+"_TimelineBar_Ball",
                     "TimelineBar_CallbackSetMark" : prefix + "_TimelineBar_CallbackSetMark",

                     "PlayStatus": prefix+"_PlayStatus",
                     "PlayStatus_icon": prefix+"_PlayStatus-icon",

                     "speaker_Box" : prefix+"_speaker_Box",
                     "speaker_Control" : prefix+"_speaker_Control",
                     "speaker_Bar" : prefix+"_speaker_Bar",

                     "Chapter_BT" : prefix+"_Chapter_BT",
                     "Chapter_Area" : prefix+"_Chapter_Area",
                     "Chapter_One_BT" : prefix+"_Chapter_One_BT",

                     "Bubble_Area" : prefix+"_Bubble_Area",
                     "Bubble_Container" : prefix+"_Bubble_Container",
                     "Bubble_Triangle" : prefix+"_Bubble_Triangle",
					};

    var lang = {"Volume_value":" Volume : ##Volume_value##%",
                "chapter_show" :"chapter : ##chapter_key##",
                "PlayStatus_Play":"Play",
                "PlayStatus_Pause":"Pause",
                };


    var callbackSet = {};

    var callback = function( returnCode ){
                    console.log(returnCode);
                };

    /* DOM */
	var target_ele = null;
	var target = null;
    var Video_control = null;


	var controlBar = null;
	var panel_play_div = null;
    var panel_Timeline_div = null;
    var panel_speaker_div = null;
    var panel_Chapter_div = null;

	var player_button = null;

	var TimelineBar = null;
    var TimelineLoading = null;
    var TimelineLoading_timer = null;
	var Timeline_Contenter = null;
	var TimeBarClickArea = null;
    var TimelineBar_Ball = null;

    var Chapter_Area = null;

    var panel_Chapter_BT = null;

    var Noti_Box = null;

    var Bubble_Area = null;


	var DEFAULTS = {
		controlbarFloating :false,
        chapter:{},
        canSelectChapter :false,


        callbackSet_need_reset : true,
        callbackSet:null,
        callback : function( returnCode ){
                    // console.log(returnCode);
                },
        lang : null
	};

    var chapter = {};

	var videoInfo = {"duration":0 ,// video length
					 "startTime":0,
					 "endTime":0,
					}


    var init_flag = false;
    var Limit_init_flag = false;

    var focus_callbackSet_key = 0;
    var focus_callbackSet_error_key = -1;
    var focus_callbackSet_Timer = null;


	var init = function(){
		options = $.extend({}, DEFAULTS, options || {});


        if( options.lang != null  ){
            var lang_len = Object.keys( options.lang ).length;
            if( lang_len > 0){
                for(var key in options.lang){
                    if( typeof( lang[key] ) != "undefined" ){
                        lang[key] = options.lang[key];
                    }
                }
            }
        }

        if( typeof( options.chapter )!="undefined"){
            var chapter_len = Object.keys( options.chapter ).length;
            if( chapter_len > 0){
                for(var i in options.chapter){
                    key = options.chapter[i]["key"];
                    name = options.chapter[i]["name"];
                    startTime = options.chapter[i]["start"];
                    endTime = options.chapter[i]["end"];;

                    setchapterData(i,key,name,startTime,endTime);
                }
            }
        }

        // if( typeof( options.callbackSet )!="undefined"){
        //     var callbackSet_len = Object.keys( options.callbackSet ).length;
        //     if( callbackSet_len > 0){
        //         for(var i in options.callbackSet){
        //             key = options.callbackSet[i]["key"];
        //             time = options.callbackSet[i]["time"];
        //             // todo
        //             var new_time = TimeToSecond(time);
        //             if( !isNaN(new_time) && new_time >= 0){
        //                 callbackSet[new_time] = key;
        //             }

        //         }
        //         callbackSet = ksort(callbackSet);
        //     }
        // }



		target_ele = $(element).eq(0);
		if( trim(target_ele[0].tagName.toLowerCase()) != "video" ){
			alert("this is not a video");
			return false;
		}

		target_ele.removeAttr("controls");

        var autoplay = typeof(target_ele.attr("autoplay")) == "undefined"?false:true;


		target = $( "<div class='" + className["target"] + "'></div>" );
		target_ele.after(target);
		target_ele.appendTo(target);

		controlBar = $( "<div class='"+ className["controlBar"]  +"'></div>");
		target.append(controlBar);


        Noti_Box = $( "<div class='"+ className["Noti_Box"]  +"'></div>");
        Noti_Box_str = $( "<div class='show'>111</div>").addClass("opacity_h");
        Noti_Box.append(Noti_Box_str);
        Noti_Box.hide();
        target.append(Noti_Box);


        Video_control = $("<div class='"+className["Video_control"]+"'></div>");
        target.append(Video_control);
        Video_control.click(function(){
            player_button.trigger("click");
        });



		panel = $("<div class='p_t'><div class='p_r'></div></div>").addClass(className["panel"]);
		controlBar.html(panel);
		panel = panel.find(".p_r");

		panel_play_div = $("<div class='p_c'>1<div>").addClass(className["panel_play"]);
		panel.append(panel_play_div);

		panel_Timeline_div = $("<div class='p_c'>2<div>").addClass(className["panel_Timeline"]);
		panel.append(panel_Timeline_div);

		panel_speaker_div = $("<div class='p_c'>3<div>").addClass(className["panel_speaker"]);
		panel.append(panel_speaker_div);

        if( options.canSelectChapter && Object.keys( chapter ).length > 0 ){
            panel_Chapter_div = $("<div class='p_c'>4<div>").addClass(className["panel_Chapter"]);
            panel_Chapter_BT = $("<div class='"+className["Chapter_BT"]+"'><div>");
            panel_Chapter_BT.addClass("btn icon-list");
            panel_Chapter_div.html(panel_Chapter_BT);
            panel.append(panel_Chapter_div);

            Chapter_Area = $("<div class='"+className["Chapter_Area"]+"'><div class='contenter'></div><div>");
            Chapter_Area.hide();
            target.append(Chapter_Area);
            Chapter_Area_bottom = controlBar.outerHeight() ;
            Chapter_Area.css({"bottom":Chapter_Area_bottom});


            Chapter_Area.addClass("opacity_h");
            panel_Chapter_BT.click(function(){
                action_Chapter_Area();
            });
        }

        // Bubble_Area = $("<div class='"+className["Bubble_Area"]+"'></div>");
        // Bubble_Area.hide();
        // var Bubble_Container = $("<div class='"+className["Bubble_Container"]+"'>111</div>");
        // var Bubble_Triangle = $("<div class='"+className["Bubble_Triangle"]+"'></div>");
        // Bubble_Area.append(Bubble_Container).append(Bubble_Triangle);
        // target.append(Bubble_Area);



		// START : Play Button
		set_PlayButton();
		//  END  : Play Button


		/* START : Set Timeline */
        set_TimeLine();
        /*  END  : Set Timeline */




		target_ele.bind("loadedmetadata", function () {
			;
	        //var target_ele_w = this.videoWidth > $(this).width()? this.videoWidth : $(this).width();
	        //var target_ele_h = this.videoHeight > $(this).height()? this.videoHeight:$(this).height() ;
	        var target_ele_w = $(this).width();
	        var target_ele_h = $(this).height();
	        if( !options.controlbarFloating ) {
	        	target_ele_h = target_ele_h + controlBar.height();
	        }else{
	        	controlBar.addClass("opacity_h");
                setControlBarHover();
	        }

	    	videoInfo.duration = $(this)[0].duration;

			target.width(target_ele_w);
			target.height(target_ele_h);

            Video_control.width(target_ele.width());
            Video_control.height(target_ele.height());

            init_flag = true;

            setCallbackSet();
            setLimitPlayArea(0);

	    });

        setSoundVolume();

        if( autoplay ){
            target_ele[0].play();
        }else{
            showPlayStatus("stop");
        }

	};



	init();




    /* START : action_Chapter_Area*/
    var showChapter_Area_flag = false;
    var close_Chapter_Area = function() {
      Chapter_Area.fadeOut();
      target.unbind('click',close_Chapter_Area);
      showChapter_Area_flag = false;

      panel_Chapter_BT.removeClass("selected");
    };
    function action_Chapter_Area(){
        if( options.canSelectChapter ){

            if( Chapter_Area.is(":visible") ){
                close_Chapter_Area();
            }else{
                panel_Chapter_BT.addClass("selected");

                var Chapter_Area_h = target.height() - controlBar.height() - Chapter_Area.css("padding-top").replace("px","");
                var Chapter_Area_w = target.width() *0.5;

                Chapter_Area.find('.contenter').css({"height": Chapter_Area_h ,"width":Chapter_Area_w });

                var contenter = Chapter_Area.find(".contenter");
                contenter.html("");
                var count = 0;
                for( var i in chapter){
                    count += 1;
                    if(  chapter[i]["end"] > chapter[i]["start"]  && chapter[i]["start"] <= videoInfo.duration){
                        var Chapter_One_BT = $("<div class='"+className["Chapter_One_BT"]+"'>"+count+"."+i+"</div>");
                        Chapter_One_BT.data({"key":i}).attr({"key":i});
                        Chapter_One_BT.html( chapter[i]["name"] );
                        contenter.append(Chapter_One_BT);
                    }
                }

                Chapter_Area.unbind('click').bind('click',function(event){
                    event.stopPropagation();
                });

                var Chapter_One_BT =$("."+className["Chapter_One_BT"]);

                Chapter_One_BT.click(function(event){
                    var key = $(this).data("key");
                    close_Chapter_Area();
                    gotochapter(key);
                });

                showChapter_Area_flag = true;
                Chapter_Area.fadeIn();
                setTimeout(function(){
                    target.bind('click',close_Chapter_Area);
                },10);

            }



        }
    }
    /*  END  : action_Chapter_Area*/
    function setSoundVolume(){
        default_sound_level = 5;
        panel_speaker_div.html("");

        var speaker_Box = $("<div class='"+className["speaker_Box"]+"'></div>");
        // speaker_Box.css({"background":"#FCF"});
        speaker_Box.data({"firstSet":1});
        panel_speaker_div.append(speaker_Box);

        for (i = 0; i <  default_sound_level  ; i++) {
            var speaker_bar = $("<div class='"+className["speaker_Bar"]+"'></div>");
            speaker_bar.attr({"rel":i});
            speaker_Box.append(speaker_bar);
        }


        var speaker_Control = $("<div class='"+className["speaker_Control"]+"'></div>");
        speaker_Control.width(speaker_Box.width());
        speaker_Control.height(speaker_Box.height());
        speaker_Box.append(speaker_Control);





        var sb_w = speaker_Box.width();
        var m_r = $("."+className["speaker_Bar"]+":last").css("margin-right").replace("px","");
        var m_h = $("."+className["speaker_Bar"]+":last").height();

        var sb_b_w = ((sb_w - m_r * ( default_sound_level - 1 ) )/default_sound_level) ;
        sb_b_w = Math.floor(sb_b_w);

        $("."+className["speaker_Bar"]).width( sb_b_w );


        for( i = 0;  i <  default_sound_level ; i++){
            var one_h = ( (i+1) / default_sound_level) *100;
            $("."+className["speaker_Bar"]).eq(i).height(one_h+"%");
            $("."+className["speaker_Bar"]).eq(i).css({"left":(i/default_sound_level)*100+"%"});
        }

        var soundBarFlag = false;
        speaker_Control.on('mousedown touchstart', function(e){
            var clickPos = pointerEventToXY(e);
            var targetPos = speaker_Box.offset();
            var relativePos = clickPos.x - targetPos.left;


            var Volume_percent = relativePos / speaker_Box.width();
            setSoundVolume_ByPercent(Volume_percent);

            //target_ele[0].currentTime = new_time;

            soundBarFlag = true;
        });


        speaker_Control.on('mousemove touchmove', function(e){
            if( soundBarFlag ){
                var clickPos = pointerEventToXY(e);
                var targetPos = speaker_Box.offset();
                var relativePos = clickPos.x - targetPos.left;

                var Volume_percent = relativePos / speaker_Box.width();
                setSoundVolume_ByPercent(Volume_percent);


                //target_ele[0].currentTime = new_time;
            }

            //target_ele[0].play();
        })

        speaker_Control.on('mouseup mouseover touchend', function(e){
            soundBarFlag = false;
        });

        function setSoundVolume_ByPercent( Volume_percent ){
            // var Volume_level = 0;
            // for( var i = 0 ; i < default_sound_level;i++){
            //     if( Volume_percent <= (i+1)/default_sound_level ){
            //         Volume_level = i/default_sound_level;
            //         break;
            //     }
            // }
            Volume_percent = Volume_percent>0?Volume_percent:0;
            target_ele[0].volume = Volume_percent;
        }

        target_ele.bind("volumechange", function () {
            var speaker_Bar = $("."+className["speaker_Bar"]);
            speaker_Bar.removeClass("selected");
            var volume = target_ele[0].volume;

            for( var i = 0 ; i < default_sound_level;i++){
                speaker_Bar.eq(i).addClass("selected");
                if( volume <= (i+1)/default_sound_level ){
                    break;
                }
            }

            if(speaker_Box.data("firstSet") == 0){
                var string = lang.Volume_value;
                string = string.replace("##Volume_value##",Math.round(volume*100));
                showNotify(string);
            }else{
                speaker_Box.data({"firstSet":0});
            }


        }).trigger("volumechange");

    }


    /* START : About Time line */
    function set_TimeLine(){
        Timeline_Contenter = $("<div class='"+className["Timeline_Contenter"]+"'></div>");
        Timeline_Contenter.html("");
        panel_Timeline_div.html(Timeline_Contenter);
        panel_Timeline_div_h = panel_Timeline_div.innerHeight() -5;
        Timeline_Contenter.height(panel_Timeline_div_h);
        Timeline_Contenter_w = Timeline_Contenter.width() - (Timeline_Contenter.css("margin-right").replace("px",""));
        Timeline_Contenter.width(Timeline_Contenter_w);
        Timeline_Contenter_h = Timeline_Contenter.height();

        TimelineOrgBar = $("<div class='"+className["TimelineOrgBar"]+"'></div>");
        // TimelineOrgBar.height(Timeline_Contenter_h);
        Timeline_Contenter.append(TimelineOrgBar);

        TimelineBar = $("<div class='"+className["TimelineBar"]+"'></div>");
        // TimelineBar.height(Timeline_Contenter_h);
        Timeline_Contenter.append(TimelineBar);

        TimelineBar_Ball = $("<div class='"+className["TimelineBar_Ball"]+"'></div>");
        Timeline_Contenter.append(TimelineBar_Ball);

        Bubble_Area = $("<div class='"+className["Bubble_Area"]+"'></div>");
        Bubble_Area.hide();
        var Bubble_Container = $("<div class='"+className["Bubble_Container"]+"'>111</div>");
        var Bubble_Triangle = $("<div class='"+className["Bubble_Triangle"]+"'></div>");
        Bubble_Area.append(Bubble_Container).append(Bubble_Triangle);
        Timeline_Contenter.append(Bubble_Area);


        // Timeline_Contenter = $("<div class='"+className["Timeline_Contenter"]+"'></div>");
        // Timeline_Contenter.html("");
        // panel_Timeline_div.html(Timeline_Contenter);
        // panel_Timeline_div_h = panel_Timeline_div.innerHeight() -10;

        // Timeline_Contenter.height(panel_Timeline_div_h);


        // Timeline_Contenter_w = Timeline_Contenter.width() - (Timeline_Contenter.css("margin-right").replace("px",""));
        // Timeline_Contenter.width(Timeline_Contenter_w);
        // Timeline_Contenter_h = Timeline_Contenter.height();


        // TimelineLoading = $("<div class='"+className["TimelineLoading"]+"'></div>");
        // TimelineLoading.height(Timeline_Contenter_h);
        // Timeline_Contenter.append(TimelineLoading);


        // TimelineBar = $("<div class='"+className["TimelineBar"]+"'></div>");
        // TimelineBar.height(Timeline_Contenter_h);
        // Timeline_Contenter.append(TimelineBar);


    }


    function setCallbackSet(){
        if( typeof( options.callbackSet )!="undefined"){
            var height = $("."+className["TimelineOrgBar"]).height();
            var C_height = $("."+className["Timeline_Contenter"]).height();
            var top = (C_height - height) /2;

            var callbackSet_len = Object.keys( options.callbackSet ).length;
            if( callbackSet_len > 0){
                var duration = videoInfo.duration;
                callbackSet = [];
                for(var i in options.callbackSet){
                    key = options.callbackSet[i]["key"];
                    time = options.callbackSet[i]["time"];

                    // todo
                    var new_time = TimeToSecond(time);
                    if( !isNaN(new_time) && new_time >= 0  && new_time <=duration){
                        //callbackSet[new_time] = key;
                        callbackSet[   Object.keys( callbackSet ).length] = {"time":new_time,"key":key};
                    }
                }

                callbackSet = callbackSet.sort(function (a, b) {
                    return a.time > b.time ;
                });

                for(var i in callbackSet){
                    var time = callbackSet[i]["time"];
                    var key = callbackSet[i]["key"];
                    var left = time / duration *100;
                    var TimelineBar_CallbackSetMark = $("<div class='"+className["TimelineBar_CallbackSetMark"]+"'></div>");
                    Timeline_Contenter.append(TimelineBar_CallbackSetMark);
                    TimelineBar_CallbackSetMark.css({"top":top,"height":height,"left":left+'%'}).data({"key":key,"time":time}).attr({"key":key,"time":time});
                }

            }
        }

    }





	/**
	 * TimeBarClickArea set Click Area and non-Click Area
	 */
	function setLimitPlayArea( startTime, endTime){
		$("."+className["TimeBarClickArea"]).remove();
		$("."+className["TimeBarNoneClickArea"]).remove();
        $("."+className["TimelineBar_NoneClick"]).remove();

		endTime = typeof(endTime)=="undefined"?videoInfo.duration:endTime;
        endTime = (endTime == 0) ? videoInfo.duration : endTime;
		endTime = endTime> videoInfo.duration ? videoInfo.duration :endTime;


		target_ele[0].currentTime = startTime;
		videoInfo.startTime = startTime;
		videoInfo.endTime = endTime;


		var Timeline_Contenter_x = Timeline_Contenter.width() * (startTime/videoInfo.duration);

		var Timeline_Contenter_w = Timeline_Contenter.width() *((endTime - startTime) / videoInfo.duration);


		TimeBarClickArea = $("<div class='"+className["TimeBarClickArea"]+"'></div>");
		TimeBarClickArea.height(Timeline_Contenter_h);
		TimeBarClickArea.css({left:Timeline_Contenter_x});
		TimeBarClickArea.width( Timeline_Contenter_w);

		Timeline_Contenter.append(TimeBarClickArea);

        Timeline_StartPos_x = Timeline_Contenter_x;
        Timeline_EndPos_x = Timeline_Contenter_x+Timeline_Contenter_w;


		if( startTime != 0 ){
			var TimeBarNoneClickArea_left = $("<div class='"+className["TimeBarNoneClickArea"]+"'></div>");
			TimeBarNoneClickArea_left.height(Timeline_Contenter_h);
			var TimeBarNoneClickArea_left_w = Timeline_Contenter.width() * (startTime/videoInfo.duration);
			TimeBarNoneClickArea_left.width(TimeBarNoneClickArea_left_w);
			// TimeBarNoneClickArea_left.addClass("opacity_h");
			TimeBarNoneClickArea_left.addClass("start");
			Timeline_Contenter.append(TimeBarNoneClickArea_left);


            var TimelineBar_NoneClick_left = $("<div class='"+className["TimelineBar_NoneClick"]+"'></div>");
            TimelineBar_NoneClick_left.width(TimeBarNoneClickArea_left_w);
            TimelineBar_NoneClick_left.addClass("start");
            Timeline_Contenter.append(TimelineBar_NoneClick_left);
		}

		if( endTime < videoInfo.duration ){
			var TimeBarNoneClickArea_right = $("<div class='"+className["TimeBarNoneClickArea"]+"'></div>");
			TimeBarNoneClickArea_right.height(Timeline_Contenter_h);

			var TimeBarNoneClickArea_right_w = Timeline_Contenter.width() *(( videoInfo.duration - endTime ) / videoInfo.duration);
			TimeBarNoneClickArea_right.width(TimeBarNoneClickArea_right_w);

			var Timeline_Contenter_x = Timeline_Contenter.width() *(endTime / videoInfo.duration);
			TimeBarNoneClickArea_right.css({"left":Timeline_Contenter_x});

			// TimeBarNoneClickArea_right.addClass("opacity_h");
			TimeBarNoneClickArea_right.addClass("end");
			Timeline_Contenter.append(TimeBarNoneClickArea_right);

            var TimelineBar_NoneClick_right = $("<div class='"+className["TimelineBar_NoneClick"]+"'></div>");
            TimelineBar_NoneClick_right.css({"left":Timeline_Contenter_x});
            TimelineBar_NoneClick_right.width(TimeBarNoneClickArea_right_w);
            TimelineBar_NoneClick_right.addClass("end");
            Timeline_Contenter.append(TimelineBar_NoneClick_right);
		}

        var TimeBarFlag = false;
        TimeBarClickArea.on('mousedown touchstart', function(e){
            var clickPos = pointerEventToXY(e);
            var targetPos = Timeline_Contenter.offset();
            var relativePos = clickPos.x - targetPos.left;

            if( Timeline_StartPos_x > relativePos){
                relativePos = Timeline_StartPos_x;
            }else if( Timeline_EndPos_x < relativePos){
                relativePos = Timeline_EndPos_x;
            }


            var Time_percent = relativePos / Timeline_Contenter.width();

            var new_time = videoInfo.duration * Time_percent;
            target_ele[0].currentTime = new_time;

            new_Time = SecondToTime(new_time);
            //showNotify(new_Time);
            showBubbleTime();

            focus_callbackSet_key = focus_callbackSet_error_key;
            TimeBarFlag = true;
        });


		TimeBarClickArea.on('mousemove touchmove', function(e){
            if( TimeBarFlag ){
                var clickPos = pointerEventToXY(e);
                var targetPos = Timeline_Contenter.offset();
                var relativePos = clickPos.x - targetPos.left;

                if( Timeline_StartPos_x > relativePos){
                    relativePos = Timeline_StartPos_x;
                }else if( Timeline_EndPos_x < relativePos){
                    relativePos = Timeline_EndPos_x;
                }

                var Time_percent = relativePos / Timeline_Contenter.width();

                var new_time = videoInfo.duration * Time_percent;
                target_ele[0].currentTime = new_time;

                new_Time = SecondToTime(new_time);
                //showNotify(new_Time);
                showBubbleTime();
                focus_callbackSet_key = focus_callbackSet_error_key;

            }

		  	//target_ele[0].play();
		})

        TimeBarClickArea.on('mouseup mouseover touchend', function(e){
            TimeBarFlag = false;
        });


		TimeBarClickArea.dblclick(function(){
			if( target_ele[0].paused ){
				target_ele[0].play();
			}else if( target_ele[0].played ){
				target_ele[0].pause();
			}
		});
        Limit_init_flag = true;
	}
    /*  END  : About Time line */



	function VideoTimeUpdate(){
		var currentTime = target_ele[0].currentTime;

		if( currentTime >= videoInfo.endTime  ){
            showPlayStatus("replay");
			target_ele[0].pause();

            if(options.controlbarFloating){
                showControlBar_flag = true;
            }
		}
		var duration = videoInfo.duration;

		var TL_p = TimelineBar.parent();
		var TimeLine_w =  TL_p.width() * (   currentTime / duration);
		TimelineBar.width(TimeLine_w);
        var pos_left =  TimeLine_w ;

        TimelineBar_Ball.css({"left": pos_left - TimelineBar_Ball.outerWidth()/2 });

        var new_time = SecondToTime(currentTime);
        Bubble_Area.find("."+className["Bubble_Container"]).html(new_time);
        Bubble_Area.css({"left":  pos_left,"margin-left":  ((Bubble_Area.width() /2)*-1) });


        // check callback
        if( typeof(callbackSet) != "undefined" && currentTime > 0 && currentTime < duration ){
            if( focus_callbackSet_key != focus_callbackSet_error_key){
                 while (1) {
                    if( typeof( callbackSet[focus_callbackSet_key] ) != "undefined" ){
                        if( callbackSet[focus_callbackSet_key]["time"] > currentTime ){
                            break;
                        }else{
                            options.callback(  callbackSet[focus_callbackSet_key]["key"] );
                            focus_callbackSet_key = focus_callbackSet_key + 1;
                        }
                    }else{
                        break;
                    }
                }
            }else{
                //callbackSet_need_reset

                var tmp_focus_callbackSet_key = null;
                for(var i in callbackSet){
                    if(callbackSet[i]["time"] > currentTime){
                        tmp_focus_callbackSet_key = parseInt(i);
                        break;
                    }
                }

                if( options.callbackSet_need_reset ){
                    focus_callbackSet_key = tmp_focus_callbackSet_key;
                }else{
                    if( focus_callbackSet_key > tmp_focus_callbackSet_key){
                        focus_callbackSet_key = tmp_focus_callbackSet_key;
                    }
                }


            }
        }
	}

	/* START : Set TimeLine */

	/* START : Set Play button */
	function set_PlayButton(){
		player_button = $("<span class='"+className["btn_player"]+"'></span>");
		panel_play_div.html(player_button);

		player_button.addClass("btn").addClass("icon-play")
									 .data({"status":0})
									 .data({"defaultClass":"icon-stop","hoverClass":"icon-play"});

		// player_button.hover(function(){
		// 	var defaultClass = $(this).data("defaultClass");
		// 	var hoverClass = $(this).data("hoverClass");

		// 	$(this).removeClass(defaultClass).addClass(hoverClass);
		// },function(){
		// 	var defaultClass = $(this).data("defaultClass");
		// 	var hoverClass = $(this).data("hoverClass");
		// 	$(this).removeClass(hoverClass).addClass(defaultClass);
		// });

		player_button.click(function(){

			if( target_ele[0].paused ){
                if(videoInfo.startTime > target_ele[0].currentTime){
                    target_ele[0].currentTime = videoInfo.startTime;
                }
                if( target_ele[0].currentTime >= videoInfo.endTime  ){
                    target_ele[0].currentTime = videoInfo.startTime;

                }
                target_ele[0].play();
                showNotify( lang["PlayStatus_Play"] );
                showPlayStatus("play");
			}else if( target_ele[0].played ){
				target_ele[0].pause();
                showNotify( lang["PlayStatus_Pause"] );
                showPlayStatus("pause");
			}
		});


		target_ele[0].ontimeupdate = function() {
			VideoTimeUpdate();
		};

		target_ele[0].onplaying = function(){
			player_button.removeClass("icon-play icon-pause icon-stop");
			player_button.addClass("icon-play")
				   		 .data({"status": 1})
				   		 .data({"defaultClass":"icon-play","hoverClass":"icon-pause"});

            $("."+className["PlayStatus"]).remove();
		};

		target_ele[0].onended = function(){
			player_button.removeClass("icon-play icon-pause icon-stop");
			player_button.addClass("icon-stop")
				  	     .data({"status": 0})
				   		 .data({"defaultClass":"icon-stop","hoverClass":"icon-play"});;
		}

		target_ele[0].onpause = function(){
			player_button.removeClass("icon-play icon-pause icon-stop");
			player_button.addClass("icon-pause")
				  	     .data({"status": -1})
				   		 .data({"defaultClass":"icon-pause","hoverClass":"icon-play"});


		}

	}
	/*  END  : Set Play button */


    /* START : Control Bar flag */

    var showControlBar_flag = false;
    function setControlBarHover(){
        controlBar.data({"show":true});
        setInterval(showControlBar,500);
        var showControlBar_Timer = null;

        function showControlBar(){
            if( showControlBar_flag || showChapter_Area_flag ){
                if( controlBar.data("show") == false ){
                    controlBar.animate({"opacity":"0.9"},100);
                    controlBar.data({"show":true});
                }

            }else{

                if( controlBar.data("show") == true ){
                    controlBar.animate({"opacity":"0"},500);
                    controlBar.data({"show":false});
                }
            }
        }

        var detectTarget = target;
        clearTimeout(showControlBar_Timer);
        detectTarget.hover(function(){
            showControlBar_flag = true;
        },function(){

            showControlBar_Timer = setTimeout(function(){
                showControlBar_flag = false;
            },100);
        });

    }
    /*  END  : Control Bar flag */

	/*  function */
    function gotochapter(key){
        if(init_flag){
            if( typeof( chapter[key] ) !="undefined"){
                var name = chapter[key]["name"];
                var start = chapter[key]["start"];
                var end = chapter[key]["end"];

                var string = lang["chapter_show"]
                string = string.replace("##chapter_key##",name);

                showNotify(string,3000);
                setLimitPlayArea(start,end);
            }
        }else{
            setTimeout(function(){
                gotochapter(key);
            },100);
        }

    }

    var gotochapter_Timer
    this.gotochapter = function(key){
        gotochapter(key);
    }

    function setchapterData(i,key,name,startTime,endTime){
        var flag = true;
        i = typeof(i)=="undefined"?null:i;
        typeof(key)=="undefined"?flag = false:"";
        typeof(name)=="undefined"?flag = false:"";
        typeof(startTime)=="undefined"?flag = false:"";
        typeof(endTime)=="undefined"?flag = false:"";

        if(flag){
            startTime = TimeToSecond(startTime);
            endTime = TimeToSecond(endTime);
            chapter[key] = {"name":name,"start":startTime,"end":endTime}
        }else{
            alert('error');
        }

    }

    function updateVideoLoadingBuffered(){
        var Timeline_Contenter_w = Timeline_Contenter.width();


        var r = target_ele[0].buffered;

        var start = r.start( r.length -1) / videoInfo.duration;
        var end = r.end(r.length-1) / videoInfo.duration;


        var left = Timeline_Contenter_w * start;
        var w = Timeline_Contenter_w * (end - start);
        //TimelineLoading.css({"left":left}).width(w);
    }

    var Notify_Timer = null;
    function showNotify( string ,time){
        time = typeof(time)=="number"?time:1000;

        clearTimeout(Notify_Timer);
        Noti_Box.find(".show").html(string);
        Noti_Box.fadeIn();


        Notify_Timer = setTimeout(function(){
            Noti_Box.fadeOut();
        },time);
    }

    var showBubbleTime_Timer = null;
    function showBubbleTime(){
        //Bubble_Area.animate({"opacity":0.9});
        Bubble_Area.fadeIn();
        clearTimeout(showBubbleTime_Timer);
        showBubbleTime_Timer = setTimeout(function(){
            Bubble_Area.fadeOut();
        },3000);
    }


    function TimeToSecond(time){
        var time_arr = time.split(":");
        var second = 0;

        for( var i = 0; i < time_arr.length;i++){
            var target = time_arr[ (time_arr.length-1) - i ];
            if(!isNaN( target ) && target !="" ){
                second += parseFloat(target) * Math.pow(60,i);
            }
        }
        return second;
    }

    function SecondToTime( time , microSecond){
        microSecond = typeof(microSecond)== "boolean"?microSecond:false;

        var h = Math.floor(time / 3600);

        var m = Math.floor(( time - h * 3600 )/60);
        var s = 0;
        if( microSecond ){
            s = Math.floor(( time - h * 3600 ) % 60 * 100 )/100;
        }else{
            s = Math.floor(( time - h * 3600 ) % 60 );
        }

        m = padLeft(m, 2);
        s = padLeft(s, 2);

        var newTime = [h,m,s].join(" : ");

        return newTime;
    }

    function showPlayStatus( status){
        $("."+className["PlayStatus"]).remove();
        var showPlayStatus = $("<div class='"+className["PlayStatus"]+"'></div>");
        showPlayStatus.addClass("ico");
        var showPlayStatus_icon = $("<div class='"+className["PlayStatus_icon"]+"'></div>");
        var showPlayStatus_icon_w = target.width() * 0.2;
        showPlayStatus_icon_w = showPlayStatus_icon_w > 128 ?128 : showPlayStatus_icon_w;
        showPlayStatus_icon.width(showPlayStatus_icon_w).height(showPlayStatus_icon_w);

        showPlayStatus.append( showPlayStatus_icon );
        switch(status){
            case "replay":
                showPlayStatus_icon.addClass("icon-replay-128 ico opacity_h");

            break;
            case "stop":
                showPlayStatus_icon.addClass("icon-play-128 ico opacity_h");

            break;
            case "pause":
                showPlayStatus_icon.addClass("icon-pause-128 btn ico opacity_h");

                setTimeout(function(){
                    showPlayStatus.removeClass("animated fadeIn");
                    showPlayStatus.addClass("animated fadeOut");
                },500);
            break;
        }
        showPlayStatus.show()
        target.append(showPlayStatus);
        showPlayStatus.addClass("animated fadeIn");

        var left = (target_ele.width() - showPlayStatus_icon.width() )/2;
        var top = (target_ele.height() - showPlayStatus_icon.height() )/2;



        showPlayStatus.css({left:left,top:top});
    }

	function trim(x) {
	    return x.replace(/^\s+|\s+$/gm,'');
	};

    function padLeft(str,lenght){
        str = typeof(str)=="number"? str.toString(): str;
        if(str.length >= lenght)
            return str;
        else
            return padLeft("0" +str,lenght);
    }

	function pointerEventToXY(e){
      var out = {x:0, y:0};
      if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        out.x = touch.pageX;
        out.y = touch.pageY;
      } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
        out.x = e.pageX;
        out.y = e.pageY;
      }
      return out;
    };



}
