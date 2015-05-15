// Clock
var clockClass = function(conf){return this.init(conf);};
clockClass.prototype = {
	init : function(conf){
		this.set(conf);

		this.cnv = document.getElementById(this.setting.id);

		this.c = this.cnv.getContext('2d');

		this.render(0,0,10);

		return this;
	},
	set : function(conf){
		this.setting = $.extend({
			id : '',
			colorBack : '#FFF',
			colorMiddle : '#DDD',
			colorFront : '#29F',
			shadow : false
		},conf);
		return this;
	},
	render : function(num,timeCurrent,timeTotal){
		var r = this.cnv.width/2,
			r1 = 0.8*(Math.round(.98*r)),
			r2 = 0.8*(Math.round(.6*r)),
			a = 2*Math.PI*timeCurrent/timeTotal;
		
		this.c.fillStyle = this.setting.colorBack;
		this.c.fillRect(0,0,2*r,2*r);
		
		this.c.translate(r, r);
		this.c.rotate(-Math.PI/2);		

		if(this.setting.shadow != false){
			var sh = this.setting.shadow.split(' ');
			this.c.shadowOffsetX = parseInt(sh[0]);
			this.c.shadowOffsetY = parseInt(sh[1]);
			this.c.shadowBlur = parseInt(sh[2]);
			this.c.shadowColor = sh[3];
		}

		this.c.fillStyle = this.setting.colorMiddle;
		this.c.beginPath();
		this.c.arc(0, 0, r1, 0, (Math.PI/180)*360, false);
		this.c.fill();
		this.c.closePath();		

		if(this.setting.shadow != false){
			this.c.shadowOffsetX = 0;
			this.c.shadowOffsetY = 0;
			this.c.shadowBlur = 0;			
		}

		this.c.fillStyle = this.setting.colorFront;
		this.c.beginPath();
		this.c.moveTo(0, 0);
		this.c.lineTo(r+r1, 0);
		this.c.arc(0, 0, r1, 0, a, false);
		this.c.fill();
		this.c.closePath();

		this.c.fillStyle = this.setting.colorBack;
		this.c.beginPath();
		this.c.arc(0, 0, r2, 0, (Math.PI/180)*360, false);
		this.c.fill();
		this.c.closePath();
		this.c.setTransform(1,0,0,1,0,0);

		this.c.font = 'bold '+1.1*r2+'px sans-serif';

		var met = this.c.measureText(''+num);		

		this.c.fillStyle = this.setting.colorFront;
		this.c.fillText (''+num, r-met.width/2, r*1.2);
		return this;
	}

};
// MODALS
var modalsClass = function(app){return this.init(app);};
modalsClass.prototype = {
	init : function(app){
		this.app = app;
		this.$dimmer = $('#dimmer');

		this.modalConfiguration().modalStopPractice().modalResults().modalPostResults().modalAutosize().modalPreferences().modalHelp().modalWelcome().helpCorners();

		this.clockPostConfiguration = new clockClass({id : 'post-configure-new-practice-clock',colorMiddle : '#EEE'});

		return this;
	},
	toggle : function(id,flag){		
		if(flag){
			if(this.app.scene != 'modal'){
				this.app.prevScene = this.app.scene;
				this.app.scene = 'modal';
			}
			$('#'+id).add(this.$dimmer).addClass('visible');			
		}else{
			this.app.scene = this.app.prevScene;
			$('#'+id).add(this.$dimmer).removeClass('visible');
		}
		return this;
	},
	modalConfiguration : function(){
		var	self = this,
			$startNewPracticeBTN = $('#start-practice');

		// Set Drodowns
		this.dropCountSketch = new dropdownClass({
			id : 'input-num-model',
			options : ['10 sketches','15 sketches','20 sketches','35 sketches','50 sketches','75 sketches','100 sketches'],
			values : ['10','15','20','35','50','75','100'],
			inputId : 'input-save-number',
			current : 0
		});
		this.dropCountTime = new dropdownClass({
			id : 'input-num-time',
			options : ['10 seconds','15 seconds','30 seconds','1 minute','2 minutes','5 minutes','10 minutes'],
			values : ['10','15','30','60','120','300','600'],
			inputId : 'input-save-duration',
			current : 2
		});

		var cat = this.app.cat,
			$categories = $('#categories'),
			$inputSaveCat = $('#input-save-cat'),
			$mainUl = $('<ul class="main-ul-cat"></ul>').appendTo($categories),
			testWidth = function(){				
				var lev = 1;
				$mainUl.find('>li.with-child.active').each(function(){
					lev++;
					$(this).find('>ul>li.with-child.active').each(function(){
						lev++;					
					});
				});
				$('#categories').width(200*lev);
			},
			saveSelected = function(){
				var v = '';
				$categories.find('.main-ul-cat > li.active,li.active > ul > li.active').each(function(){
					v += $(this).attr('id')+',';
				});
				$inputSaveCat.val(v.substring(0,v.length-1));
			},
			idCat = 0,
			renderUl = function($ul,arrayList){
				// View all
				var $span = $('<span rel="">View all</span>'),
					$li = $('<li class="view-all" rel="" id="catId-'+idCat+'"></li>').appendTo($ul).append($span);
					idCat++;
				$span.click(function(){
					$(this).parent().addClass('active').siblings().removeClass('active');
					testWidth();
					saveSelected();		
				});
				for(var i=0;i<arrayList.length;i++){
					var txt = arrayList[i][0].split('+'),
						$span = $('<span>'+txt[0]+'</span>'),
						$li = $('<li rel="'+txt[1]+'" id="catId-'+idCat+'"></li>').appendTo($ul).append($span);
						idCat++;
					$span.click(function(){
						$(this).parent().find('>ul>li').removeClass('active').eq(0).addClass('active');
						$(this).parent().addClass('active').siblings().removeClass('active');
						testWidth();
						saveSelected();				
					});
					if(typeof arrayList[i][1] != 'undefined'){
						var $newUl = $('<ul></ul>').appendTo($li.addClass('with-child'));
						renderUl($newUl,arrayList[i][1]);
					}
				}				
			},
			restoreSelected = function(){
				var arrID = $inputSaveCat.val().split(',');
				for(var i=0;i<arrID.length;i++){
					$('#'+arrID[i]).addClass('active');
				}
			};

			renderUl($mainUl,cat);
			restoreSelected();
			testWidth();

		// Buttons
		$('#cancel-practice').click(function(){
			self.toggle('configure-new-practice-modal',false);
			self.app.scene = self.app.prevScene;
		});

		$startNewPracticeBTN.click(function(){
			if(!$(this).hasClass('disable')){
				var catSelect = '';				
				$mainUl.find('>li.active').each(function(){
					catSelect += $(this).attr('rel');
					$(this).find('>ul>li.active').each(function(){
						var rel = $(this).attr('rel');
						if(rel!='') catSelect += '/'+rel;
						$(this).find('>ul>li.active').each(function(){
							var rel = $(this).attr('rel');
							if(rel!='') catSelect += '/'+rel;							
						});						
					});
				});

				var conf = {
					tags : '',
					cat : catSelect,
					length : self.dropCountSketch.val,
					duration : self.dropCountTime.val							
				};

				self.app.practice.setNew(conf);
				self.toggle('configure-new-practice-modal',false).toggle('post-configure-new-practice-modal',true).startPostModalConfiguration();
			}			
		});

		return this;
	},
	startPostModalConfiguration : function(){
		$('#post-configure-new-practice-modal').removeClass('error');
		var self = this,
			num = 3,
			t = 0,
			timer = setInterval(function(){
				self.clockPostConfiguration.render('',t,20);
				t++;
				if(t>20){
					t=0;
				}
				if(self.app.photo.loaded){
					self.toggle('post-configure-new-practice-modal',false);
					self.app.scene = 'practice';
					self.app.practice.togglePlay();
					clearInterval(timer);
					timer = null;
				}
			},50);

		$('#try-again-load').click(function(){
			self.toggle('post-configure-new-practice-modal',false).toggle('configure-new-practice-modal',true);
		});

		return this;
	},
	modalStopPractice : function(){
		var self = this;
		// Buttons
		$('#continue-practice').click(function(){
			self.toggle('stop-modal',false);		
		});
		$('#stop-practice').click(function(){
			self.toggle('stop-modal',false);
			self.app.practice.stop();	
		});
		return this;
	},
	toggleImageFinal : function(flag){
		if(flag){
			$('#result-image-container').fadeIn(300);
		}else{
			$('#result-image-container').fadeOut(300);
		}
		return this;
	},
	modalResults : function(){
		var self = this;
		$('#close-result-container').click(function(){
			self.toggle('results-modal',false).toggle('post-results-modal',true);
		});
		$('#close-result-image-container').click(function(){
			self.toggleImageFinal(false);
		});
		return this;
	},
	modalPostResults : function(){
		var self = this;
		$('#cancel-post-result').click(function(){
			self.toggle('post-results-modal',false);
		});
		$('#ok-post-result').click(function(){
			self.toggle('post-results-modal',false).toggle('configure-new-practice-modal',true);
		});
		return this;
	},
	modalAutosize : function(){
		var $window = $(window),
			$modals = $('.modal[autosize]'),
			autosizeCtrl = function(){
				$modals.each(function(){
					var windowHeigth = $window.height() - 20,
						modalHeigth = parseInt($(this).attr('autosize'));
					if(windowHeigth < modalHeigth){
						$(this).addClass('fixsize');
					}else{
						$(this).removeClass('fixsize');
					}
				});
			};

		autosizeCtrl();
		$window.resize(autosizeCtrl);
		return this;
	},
	modalPreferences : function(){
		var self = this,
			$checkbox = $('.checkbox').each(function(){
			var ch = $(this);
			ch.parent('p').addClass('label-checkbox').click(function(){
				ch.toggleClass('true');
			});
		});

		$('#ok-preferences').click(function(){			
			self.app.ui.toggleLeft($('#ch-use-left').hasClass('true'));
			self.app.ui.toggleOwn($('#ch-use-own').hasClass('true'));
			self.toggle('preferences-modal',false);
		});

		if(this.app.leftHanded) $checkbox.eq(0).toggleClass('true');
		if(this.app.ownApp) $checkbox.eq(1).toggleClass('true');



		return this;
	},
	modalHelp : function(){
		var self = this,			
			$linkHelpPrev = $('.link-help.prev'),
			$linkHelpNext = $('.link-help.next');

			this.$helpSection = $('.help-section');
			this.$helpMenuLi = $('.help-menu li');

			this.$helpMenuLi.each(function(index){
				$(this).click(function(){
					self.modalHelpChangeSection(index);
				});
			});
			$linkHelpPrev.each(function(index){
				$(this).click(function(e){
					e.preventDefault();					
					self.modalHelpChangeSection(index);
				});
			});
			$linkHelpNext.each(function(index){
				$(this).click(function(e){
					e.preventDefault();					
					self.modalHelpChangeSection(index+1);
				});
			});

		$('.welcome-text').clone().appendTo('.welcome-text-content');
		$('#ok-help').click(function(){
			self.toggle('help-modal',false);
		});

		return this;
	},
	modalHelpChangeSection : function(index){
		this.$helpMenuLi.removeClass('current').eq(index).addClass('current');
		this.$helpSection.removeClass('current').eq(index).addClass('current');
		return this;
	},
	modalWelcome : function(index){
		var self = this;
		$('#welcome-start').click(function(){
			self.toggle('welcome-modal',false).toggle('configure-new-practice-modal',true);
		});
		return this;
	},
	helpCorners : function(index){
		var self = this;
		$('.help-corner').click(function(){
			var num = parseInt($(this).attr('rel')) || 0;
			self.modalHelpChangeSection(num).toggle('help-modal',true);
		});
		return this;
	}
};
// COLOR
var colorClass = function(parent){
	return this.init(parent);
};
colorClass.prototype = {
	init : function(parent){
		this.app = parent;
		this.colEdit = 0;
		this.canvasSV = document.getElementById('color-cnv-gradient-sat-val');
		this.canvasH = document.getElementById('color-cnv-gradient-hue');
		
		this.cSV = this.canvasSV.getContext('2d');
		this.cH = this.canvasH.getContext('2d');
		
		this.cursorSV = document.getElementById('color-sat-val-cursor');
		this.cursorH = document.getElementById('color-hue-cursor');

		this.$foreSample = $('#foreground-color-sample');
		this.$backSample = $('#background-color-sample');
		this.$toolColor = $('#tool-color');
		this.$canvasSection = $('#paint-section');
		
		
		
		this.valGr = this.cSV.createLinearGradient(0, 0, 0, 140);
		this.valGr.addColorStop(0,'rgba(0,0,0,0)');
		this.valGr.addColorStop(1,'rgba(0,0,0,1)');	
		
		// Hue Gradient
		var gr = this.cH.createLinearGradient(0, 0, 0, 140);
		gr.addColorStop(0,'rgb(255,0,0)');
		gr.addColorStop(1/6,'rgb(255,255,0)');
		gr.addColorStop(1/3,'rgb(0,255,0)');
		gr.addColorStop(0.5,'rgb(0,255,255)');
		gr.addColorStop(2/3,'rgb(0,0,255)');
		gr.addColorStop(5/6,'rgb(255,0,255)');
		gr.addColorStop(1,'rgb(255,0,0)');			
		this.cH.fillStyle = gr;		
		this.cH.fillRect(0,0,20,140);
		// end Hue Gradient
		
		
		this.setEvents();
		this.update();	
		
		return this;
	},
	setForeOrBackColor : function(i){
		this.colEdit = i;
		this.update();
		return this;
	},
	setColor : function(col){		
		this.app.paint.colors[this.colEdit].color(col);
		this.update();
		return this;
	},
	update : function(){
		this
		.updateInfo()
		.drawSV()
		.updateCursors();
		return this;
	},
	updateInfo : function(){
		this.$foreSample.css('background-color',this.app.paint.colors[0].hex());
		this.$backSample.add(this.$canvasSection).css('background-color',this.app.paint.colors[1].hex());
		this.app.paint.updatePickerCanvas();
		return this;
	},
	drawSV : function(){
		var col = this.app.paint.colors[this.colEdit].hsvToRgb({'h':this.app.paint.colors[this.colEdit].h(),'s':1,'v':1})
		this.satGr = this.cSV.createLinearGradient(0, 0, 140, 0);
		this.satGr.addColorStop(0,'rgb(255,255,255)');
		this.satGr.addColorStop(1,'rgb('+col.r+','+col.g+','+col.b+')');		
		this.cSV.fillStyle = this.satGr;		
		this.cSV.fillRect(0,0,140,140);
		this.cSV.fillStyle = this.valGr;		
		this.cSV.fillRect(0,0,140,140);		
		return this;
	},
	updateCursors : function(){
		this.cursorH.style.top = Math.round(this.app.paint.colors[this.colEdit].h()*140) + 'px';
		this.cursorSV.style.top = (140-Math.round(this.app.paint.colors[this.colEdit].v()*140)) + 'px';
		this.cursorSV.style.left = Math.round(this.app.paint.colors[this.colEdit].s()*140) + 'px';
		return this;
	},
	setHueFromMouse : function(e){		
		var posY = e.pageY - this.canvasH.getBoundingClientRect().top;
		if(posY < 0) posY = 0;
		if(posY > 140) posY = 140;
		this.cursorH.style.top = posY + 'px';
		this.app.paint.colors[this.colEdit].h(posY/140);
		this.update();
	},
	setSVFromMouse : function(e){
		var posX = e.pageX - this.canvasSV.getBoundingClientRect().left,
			posY = e.pageY - this.canvasSV.getBoundingClientRect().top;
		if(posX < 0) posX = 0;
		if(posX > 140) posX = 140;
		if(posY < 0) posY = 0;
		if(posY > 140) posY = 140;
		this.cursorSV.style.left = posX + 'px';
		this.cursorSV.style.top = posY + 'px';
		this.app.paint.colors[this.colEdit].s(posX/140).v(1 - posY/140);
		this.update();
	},
	setEvents : function(){
		var self = this,
			draggingSV = false,
			draggingH = false,
			onMousedownH = function(e){
				draggingH = true;
				self.setHueFromMouse(e);
			},
			onMousedownSV = function(e){
				draggingSV = true;
				self.setSVFromMouse(e);
			},
			onMousemove = function(e){
				if(draggingH){
					self.setHueFromMouse(e);
				}
				if(draggingSV){
					self.setSVFromMouse(e);
				}
			},
			onMouseup = function(){
				if(draggingH){
					draggingH = false;
				}
				if(draggingSV){
					draggingSV = false;
				}
			};			
		this.canvasH.addEventListener('mousedown', function(e){onMousedownH(e);},false);
		this.cursorH.addEventListener('mousedown', function(e){onMousedownH(e);},false);
		this.canvasSV.addEventListener('mousedown', function(e){onMousedownSV(e);},false);
		this.cursorSV.addEventListener('mousedown', function(e){onMousedownSV(e);},false);
		document.body.addEventListener('mousemove', function(e){onMousemove(e);},false);
		document.body.addEventListener('mouseup', function(){onMouseup();},false);

		/* Show or hide color-ctrl */
		var overColorCtrl = false,
			colorCtrlOpen = false,
			closeColorCtrl = function(){
				if(colorCtrlOpen && !overColorCtrl){
					self.$toolColor.removeClass('open');
					colorCtrlOpen = false;
				}
				overColorCtrl = false;
			};


		this.$foreSample.click(function(){
			self.setForeOrBackColor(0);
			self.$toolColor.addClass('open').removeClass('for-background');
			colorCtrlOpen = true;
			overColorCtrl = true;
		});
		this.$backSample.click(function(){
			self.setForeOrBackColor(1);
			self.$toolColor.addClass('open').addClass('for-background');
			colorCtrlOpen = true;
			overColorCtrl = true;
		});
		$('#color-ctrl').click(function(){
			overColorCtrl = true;
		});

		$('body').click(closeColorCtrl);
		$('#draw-canvas').mousedown(closeColorCtrl);
		return this;
	}
};
// TOOLS
var toolsClass = function(parent){return this.init(parent);};
toolsClass.prototype = {
	init : function(parent){
		this.app = parent;

		this.player().setEventBrush();		
		return this;
	},
	setEventBrush : function(){
		var self = this;
		$('.tool.brush').each(function(index){
			$(this).click(function(){
				self.app.paint.setPreset(index);
			});
		});
		$('.tool.picker').click(function(){
			self.app.paint.setPicker();
		});
		return this;
	},
	player : function(){		
		this.$title = $('#title-player-canvas');
		this.titleText = '';
		this.prevTitleText = '';
		this.$cnv = $('#player-canvas');
		this.c = this.$cnv[0].getContext('2d');
		this.width = this.$cnv.width();
		this.height = this.$cnv.height();
		this.hitAreaWidth = this.width/3;
		this.hover = 0;
		this.color = '#FFF';
		this.hoverColor = '#29F';
		this.c.shadowBlur = 3;
		this.c.shadowColor = 'rgba(0,0,0,.5)';
		this.c.shadowOffsetY = 1;
		this.renderPlayer().setEventPlayer();
		return this;
	},
	renderPlayer : function(){
		var p1x = 11,
			p1y = 11,
			p2x = 43,
			p2y = 11,
			p3x = 79,
			p3y = 11;
		this.c.clearRect(0,0,this.width,this.height);
		this.c.fillStyle = (this.hover == 1) ? this.hoverColor : this.color;
		if(!this.app.practice.playing){
			this.c.beginPath();
			this.c.moveTo(p1x+0, p1y+0);
			this.c.lineTo(p1x+12, p1y+6);
			this.c.lineTo(p1x+0, p1y+12);
			this.c.lineTo(p1x+0, p1y+0);
			this.c.fill();
			this.c.closePath();
		}else{
			this.c.beginPath();
			this.c.moveTo(p1x+0, p1y+0);
			this.c.lineTo(p1x+5, p1y+0);
			this.c.lineTo(p1x+5, p1y+12);
			this.c.lineTo(p1x+0, p1y+12);
			this.c.lineTo(p1x+0, p1y+0);
			this.c.fill();
			this.c.closePath();
			this.c.beginPath();
			this.c.moveTo(p1x+7, p1y+0);
			this.c.lineTo(p1x+12, p1y+0);
			this.c.lineTo(p1x+12, p1y+12);
			this.c.lineTo(p1x+7, p1y+12);
			this.c.lineTo(p1x+7, p1y+0);
			this.c.fill();
			this.c.closePath();
		};
		this.c.fillStyle = (this.hover == 2) ? this.hoverColor : this.color;
		this.c.beginPath();
		this.c.moveTo(p2x+0, p2y+0);
		this.c.lineTo(p2x+8, p2y+6);
		this.c.lineTo(p2x+0, p2y+12);
		this.c.lineTo(p2x+0, p2y+0);
		this.c.fill();
		this.c.closePath();
		this.c.beginPath();
		this.c.moveTo(p2x+8, p2y+0);
		this.c.lineTo(p2x+16, p2y+6);
		this.c.lineTo(p2x+8, p2y+12);
		this.c.lineTo(p2x+8, p2y+0);
		this.c.fill();
		this.c.closePath();

		this.c.fillStyle = (this.hover == 3) ? this.hoverColor : this.color;
		this.c.beginPath();
		this.c.moveTo(p3x+0, p3y+0);
		this.c.lineTo(p3x+12, p3y+0);
		this.c.lineTo(p3x+12, p3y+12);
		this.c.lineTo(p3x+0, p3y+12);
		this.c.lineTo(p3x+0, p3y+0);
		this.c.fill();
		this.c.closePath();

		if(this.titleText != this.prevTitleText){
			this.$title.text(this.titleText);
			this.prevTitleText = this.titleText;
		}
		return this
	},
	setEventPlayer : function(){
		var self = this,
			xmouse = function(e){
				return e.pageX - self.$cnv.offset().left;
			},
			render = function(e){
				var x = xmouse(e);
				if(x < self.hitAreaWidth){
					self.hover = 1;
					if(!self.app.practice.playing){
						self.titleText = 'Play (SPACEBAR)';
					}else{
						self.titleText = 'Pause (SPACEBAR)';
					}
				}else if(x > (2*self.hitAreaWidth)){
					self.hover = 3;
					self.titleText = 'Stop';
					
				}else{
					self.hover = 2;
					self.titleText = 'Next model (RIGHT ARROW)';
				}
				self.renderPlayer();
			};
			
		this.$cnv.mousemove(function(e){
			render(e);
		}).mouseout(function(){
			self.hover = 0;
			self.renderPlayer();
		}).click(function(e){
			render(e);
			switch(self.hover){
				case 1:
					if(self.app.practice.enabled) self.app.practice.togglePlay();
					break;
				case 2:
					if(self.app.practice.enabled) self.app.practice.forceNext();
					break;
				case 3:
					if(self.app.practice.enabled) self.app.ui.modals.toggle('stop-modal',true);
					break;
			}
		});



		return this
	}
};
// Keyboard
var keyboardClass = function(app){return this.init(app);};
keyboardClass.prototype = {
	init : function(app){
		this.app = app;

		this.setKey();

		return this;
	},
	setKey : function(){
		var self = this,
			pressed = false;
		document.addEventListener('keydown', function(e){
			if(!pressed){
				pressed = true;
				var unicode = e.keyCode? e.keyCode : e.charCode;				
				switch(self.app.scene){
					case 'practice': 
						switch(unicode){
							case 18: self.app.paint.setPicker(); break;// Alt
						}
					break;
				}			
			}			
		},false);
		document.addEventListener('keyup', function(e){			
			pressed = false;
			var unicode = e.keyCode? e.keyCode : e.charCode;
			switch(self.app.scene){
				case 'practice': 
					switch(unicode){
						case 80: self.app.paint.setPreset(0); break;// P
						case 69: self.app.paint.setPreset(1); break;// E
						case 79: self.app.paint.setPreset(2); break;// O
						case 87: self.app.paint.setPreset(3); break;// W
						case 65: self.app.paint.setPreset(4); break;// A
						case 66: self.app.paint.setPreset(5); break;// B
						case 73: self.app.paint.setPicker(); break;// I
						case 18: self.app.paint.setPreset(self.app.paint.presetPreviousPicker); break;// Alt

						case 32: self.app.practice.togglePlay(); break;// SPACEBAR
						case 39: self.app.practice.forceNext(); break;// RIGHT ARROW
					}
				break;
			}
			//console.log(unicode);
		},false);
		return this;
	}
};
// DRODOWN
var dropdownClass = function(opt){return this.init(opt);};
dropdownClass.prototype = {	
	init : function(opt){
		this.setting = $.extend({
			id : '',
			options : ['1 opt','2 opt','3 opt','4 opt'],
			values : ['1','2','3','4'],
			inputId : '',
			current : 0,
			callback : function(){}
		},opt);

		this.open = false;
		this.current = -1;
		this.val = 0;

		this.$dropdown = $('#'+this.setting.id);

		this.render().setEvents();

		this.$input = null;
		if(this.setting.inputId != ''){
			this.$input = $('#'+this.setting.inputId);
			this.updateByInput();
		};


		return this;
	},
	render : function(){
		if(this.$dropdown.length>0){
			this.$dropdown.html('');
			this.$result = $('<span class="dropdown-result"></span>').appendTo(this.$dropdown);
			this.$list = $('<span class="dropdown-list"></span>').appendTo(this.$dropdown);
			for(var i = 0;i<this.setting.options.length;i++){
				$('<span class="dropdown-list-option" rel="'+i+'">'+this.setting.options[i]+'</span>').appendTo(this.$list);
			}
			this.$options = this.$list.find('.dropdown-list-option');
			this.setCurrent(this.setting.current);

		}
		return this;
	},
	setEvents : function(){
		if(this.$dropdown.length>0){
			var self = this,
				overdropdown = false;
			this.$dropdown.click(function(){
				if(!self.open){
					self.$dropdown.addClass('open');
					self.$list.fadeIn(150);
					self.open = true;
					overdropdown = true;
				}
			});
			$('body').click(function(){
				if(self.open && !overdropdown){
					self.$dropdown.removeClass('open');
					self.$list.fadeOut(150);
					self.open = false;
				}
				overdropdown = false;
			});
			this.$options.click(function(){
				var index = parseInt($(this).attr('rel'));
				if(index != self.current){
					self.setCurrent(index);
					self.setting.callback();
				}				
			});



		}
		return this;
	},
	updateByInput : function(){
		for(var i = 0;i<this.setting.values.length;i++){
			if(this.setting.values[i]==this.$input.val()){
				if(i != this.current){
					this.setCurrent(i);
				}	
			}
		}
		return this;
	},
	setCurrent : function(num){		
		this.current = num;
		this.$options.removeClass('current').eq(num).addClass('current');
		this.$result.html(this.setting.options[num]);
		this.val = parseInt(this.setting.values[num]);
		if(this.$input != null) this.$input.val(this.val);
		this.$dropdown.attr('val',this.val);
		return this;
	}
};
// Menu
var menuClass = function(app){return this.init(app);};
menuClass.prototype = {
	init : function(app){
		this.app = app;

		this.open = false;

		this.$menu = $('#main-menu');


		this.setEventMenu().setEventBtn();



		return this;
	},
	setEventMenu : function(){
		var self = this,
			opening = false;

		$('#main-menu-trigger').click(function(){
			if(!self.open){
				self.$menu.addClass('open');
				self.open = true;
				opening = true;
			}
		});

		$('body').click(function(){
			if(self.open && !opening){
				self.$menu.removeClass('open');
				self.open = false;
			}
			opening = false;
		});



		return this;
	},
	setEventBtn : function(){
		var self = this;
		$('#menu-new').click(function(){
			self.app.ui.modals.toggle('configure-new-practice-modal',true);
		});
		$('#menu-preferences').click(function(){
			self.app.ui.modals.toggle('preferences-modal',true);
		});

		$('#menu-help').click(function(){
			self.app.ui.modals.toggle('help-modal',true).modalHelpChangeSection(0);
		});

		$('#menu-about').click(function(){
			self.app.ui.modals.toggle('help-modal',true).modalHelpChangeSection(7);
		});

		return this;
	}

};
// UI
var uiClass = function(app){return this.init(app);};
uiClass.prototype = {
	init : function(app){
		this.app = app;

		// Set preferences
		this.$inputLeftHanded = $('#input-save-left-handed');
		this.$inputOwnApp = $('#input-save-own-app');
		if(this.$inputLeftHanded.val()=='true'){this.toggleLeft(true);}
		if(this.$inputOwnApp.val()=='true'){this.toggleOwn(true);}

		// Set objects		
		this.color = new colorClass(this.app);
		this.modals = new modalsClass(this.app);
		this.tools = new toolsClass(this.app);
		this.keyboard = new keyboardClass(this.app);
		this.menu = new menuClass(this.app);		

		// Start application
		var self = this;
		setTimeout(function(){
			$('#presentation').fadeOut(400,function(){
				self.modals.toggle('welcome-modal',true);
			});
		},2000);	

		return this;
	},
	toggleLeft : function(flag){
		if(flag){
			$('#application').addClass('left-handed');
		}else{
			$('#application').removeClass('left-handed');
		}
		this.$inputLeftHanded.val(flag);
		this.app.leftHanded = flag;
		return this;
	},
	toggleOwn : function(flag){
		if(flag){
			$('#application').addClass('own-app');
			$('#main-menu').appendTo('#photo-section .tools');
		}else{
			$('#application').removeClass('own-app');
			$('#main-menu').appendTo('#paint-section');
		}
		this.$inputOwnApp.val(flag);
		this.app.ownApp = flag;
		return this;
	}

};
// PHOTO
var photoClass = function(app){return this.init(app);};
photoClass.prototype = {
	data : null,
	length : 0,
	current : 0,
	currentContainer : 0,
	loaded : false,
	tags : '',
	init : function(app){
		this.app = app;
		this.$containers = $('.photo-container');
		this.$images = $('.photo-image');
		this.$imageInfos = $('.photo-info');		
		return this;
	},
	getPhotos : function(tags,cat){
		this.loaded = false;
		this.tags = tags;
		this.cat = cat;
		this.$containers.removeClass('visible');
		var self = this;
		setTimeout(function(){
			self.$images.attr('src','');
		},500);	
		this.numAjaxCall = 0;
		this.ajaxCall();
		return this;
	},
	ajaxCall : function(){
		var self = this,
			urlXML = 'http://backend.deviantart.com/rss.xml?type=deviation&q=boost%3Apopular';			

			if(this.cat!=''){
				urlXML += '+in%3A'+encodeURIComponent(this.cat);
			}
			if(this.tags!=''){
				urlXML += '+'+this.tags;
			}

		//console.log(urlXML);
			

		$.ajax({
			// ajax request to yql public json url 
		    url : 'http://query.yahooapis.com/v1/public/yql',
		    jsonp : 'callback',
		    dataType : 'jsonp',
		    data : {
		        q : 'select * from rss where url ="'+urlXML+'"',
		        format : 'json'
		    },
		    success : function(data) {
		    	self.successData(data);
		    },
		    error: function(data){
		        self.errorData(data);
		    } 
		});
		return this;
	},
	successData : function(data){
		if(data.query.results != null){
			this.data = data.query.results.item;
			this.length = data.query.results.item.length;
			this.setCurrentNum();
			this.currentContainer = 0;
			this.loaded = true;
			this.loadImage();			
		}else{
			this.errorData();
		}
		return this;
	},
	setCurrentNum : function(){
		var newCurr = Math.round(Math.random()*this.length)-1;
		if(newCurr<0){newCurr = 0;}
		if(newCurr == this.current){
			newCurr--;
			if(newCurr<0){newCurr = 0;}
		}
		this.current = newCurr;
		return this;
	},
	errorData : function(data){
		this.numAjaxCall++;
		if(this.numAjaxCall < 3){
			this.ajaxCall();
		}else{
			$('#post-configure-new-practice-modal').addClass('error');
		}
		return this;
	},
	loadImage : function(){
		var urlImage;
		for(var i=0;i<1000;i++){
			if(typeof this.data[this.current].content != 'undefined'){
				if(typeof this.data[this.current].content.url != 'undefined'){
					urlImage = this.data[this.current].content.url;
					i = 1000;
				}else{
					this.current++;
				}
			}else{
				this.current++;
			}
			if(this.current >=this.length) this.current = 0;
		}


		this.$images.eq(this.currentContainer).attr('src',urlImage);
		this.putUserInfo(this.current);
		this.setCurrentNum();
		return this;
	},
	putUserInfo : function(num){	
		var txt = this.data[num].copyright.content + '. <a href="'+this.data[num].copyright.url+'" target="_blank" title="Go to profile in DeviantART">Link</a>.';		
		this.$imageInfos.eq(this.currentContainer).html(txt);
		return this;
	},
	show : function(){
		this.$containers.removeClass('visible').eq(this.currentContainer).addClass('visible');
		this.currentContainer++;
		if(this.currentContainer > 1) this.currentContainer = 0;
		var self = this;
		setTimeout(function(){
			self.loadImage();
		},600);
		return this;
	}
};
// Hypercolor
var hypercolor = function(c){
	return this.init(c);
};
hypercolor.prototype = {
	init : function(c){
		this.values = {
			r : 0,
			g : 0,
			b : 0,
			h : 0,
			s : 0,
			v : 0,
			hex : '#000000'
		};
		this.color(c);
		return this;
	},
	color : function(c){
		if(c != undefined){
			var d;
			if(typeof c == 'string'){
				if(c.indexOf('#')>-1){
					this.hex(c);
				}
				if(c.indexOf('rgb')>-1){					
					this.rgb(c);
				}
				if(c.indexOf('hsv')>-1){
					this.hsv(c);
				}
			}else{
				if(c.r != undefined){
					this.rgb(c);
				}
				if(c.h != undefined){
					this.hsv(c);
				}
			}			
			return this;
		}else{
			return this.values;
		}
	},
	merge : function(obj){
		this.values = $.extend(this.values,obj);
		return this;
	},
	hex : function(c){
		if(c != undefined && typeof c == 'string'){
			this.merge({hex : c}).merge(this.hexToRgb(c)).merge(this.hexToHsv(c));
			return this;
		}else{
			return this.values.hex;
		}
	},
	rgb : function(c){
		if(c != undefined){
			if(typeof c == 'string'){
				var arr = c.substring(4,c.length-1).split(',');
				c = {'r':parseInt(arr[0]),'g':parseInt(arr[1]),'b':parseInt(arr[2])};
			}
			this.merge({hex : this.rgbToHex(c)}).merge(this.rgbToHsv(c)).merge(c);
			return this;
		}else{
			return {'r':this.values.r,'g':this.values.g,'b':this.values.b};
		}
	},
	hsv : function(c){
		if(c != undefined){
			if(typeof c == 'string'){
				var arr = c.substring(4,c.length-1).split(',');
				c = {'h':parseFloat(arr[0]),'s':parseFloat(arr[1]),'v':parseFloat(arr[2])};
			}
			this.merge({hex : this.hsvToHex(c)}).merge(this.hsvToRgb(c)).merge(c);
			return this;
		}else{
			return {'h':this.values.h,'s':this.values.s,'v':this.values.v};
		}
	},
	r : function(c){
		if(c != undefined){
			this.rgb({'r':c,'g':this.values.g,'b':this.values.b});
			return this;
		}else{
			return this.values.r;
		}
	},
	g : function(c){
		if(c != undefined){
			this.rgb({'r':this.values.r,'g':c,'b':this.values.b});
			return this;
		}else{
			return this.values.g;
		}
	},
	b : function(c){
		if(c != undefined){
			this.rgb({'r':this.values.r,'g':this.values.g,'b':c});
			return this;
		}else{
			return this.values.b;
		}
	},
	h : function(c){
		if(c != undefined){
			this.hsv({'h':c,'s':this.values.s,'v':this.values.v});
			return this;
		}else{
			return this.values.h;
		}
	},
	s : function(c){
		if(c != undefined){
			this.hsv({'h':this.values.h,'s':c,'v':this.values.v});
			return this;
		}else{
			return this.values.s;
		}
	},
	v : function(c){
		if(c != undefined){
			this.hsv({'h':this.values.h,'s':this.values.s,'v':c});
			return this;
		}else{
			return this.values.v;
		}
	},
	rgbString : function(){
		return 'rgb('+this.values.r+','+this.values.g+','+this.values.b+')';
	},
	rgbaHalfString : function(){
		return 'rgba('+this.values.r+','+this.values.g+','+this.values.b+',';
	},
	hexToRgb : function(hex) {
    	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
	        return r + r + g + g + b + b;
	    });	
	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
	},
	hexToHsv : function(hex){
		return this.rgbToHsv(this.hexToRgb(hex));
	},		
	rgbToHex : function(obj) {
		var componentToHex = function(c) {
			    var hex = c.toString(16);
			    return hex.length == 1 ? "0" + hex : hex;
			},
			r = obj.r,
			g = obj.g,
			b = obj.b;
	    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	},
	hsvToHex : function(obj) {
		return this.rgbToHex(this.hsvToRgb(obj));
	},
	rgbToHsv : function(obj) {
		var r = obj.r,
			g = obj.g,
			b = obj.b;			
		r /= 255, g /= 255, b /= 255;		 
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, v = max;		 
		var d = max - min;
		s = max == 0 ? 0 : d / max;		 
		if (max == min) {
			h = 0; // achromatic
		} else {
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}		
			h /= 6;
		}		 
		return {'h' : h,'s' : s,'v' : v};
	},
	hsvToRgb : function(obj) {
		var h = parseFloat(obj.h),
			s = parseFloat(obj.s),
			v = parseFloat(obj.v);
		var r, g, b; 
		var i = Math.floor(h * 6);
		var f = h * 6 - i;
		var p = v * (1 - s);
		var q = v * (1 - f * s);
		var t = v * (1 - (1 - f) * s);
		switch (i % 6) {
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
		return {'r': Math.round(r * 255), 'g': Math.round(g * 255), 'b': Math.round(b * 255)};		
	}
};
// BRUSH PRESET
var brushPresets = function(){
	return [
		//Pencil',
		{
			"radius":3,
			"spacing":0.13,
			"opacity":0.7,
			"hardness":0.86,
			"rotation":0,
			"roundness":0.51,
			"blending":0,
			"dirtcolor":false,
			"randomOpacity":0.39,
			"randomHardness":0.5,
			"randomRotation":1,
			"randomRoundness":0,
			"randomRadius":0.12,
			"randomScattering":0,
			"velocityRadius" : [-1,.2],// [1,12]
			"velocityOpacity" : [-1,.5] //[1,60]
		},
		//Eraser'
		{
			"radius":20,
			"spacing":0.19,
			"opacity":0.75,
			"hardness":0.8,
			"rotation":0,
			"roundness":1,
			"blending" :0,					
			"dirtcolor" : false,
			"randomOpacity":0,
			"randomHardness":0,
			"randomRotation":0,
			"randomRoundness":0,
			"randomRadius":0,
			"randomScattering":0,
			"velocityRadius" : false, //[-1,2] [1,12]
			"velocityOpacity" : false //[-1,2] [1,60]
		},
		// Oil
		{
			"radius":15,
			"spacing":0.15,
			"opacity":1,
			"hardness":0.8,
			"rotation":0,
			"roundness":1,
			"blending":0.62,
			"dirtcolor":true,
			"randomOpacity":0,
			"randomHardness":0,
			"randomRotation":0,
			"randomRoundness":0,
			"randomRadius":0,
			"randomScattering":0,
			"velocityRadius" : [1,2],
			"velocityOpacity" : false
		},				
		//watercolor',
		{
			"radius":10,
			"spacing":0.08,
			"opacity":0.2,
			"hardness":0.71,
			"rotation":0,
			"roundness":1,
			"blending":0.6,
			"dirtcolor":false,
			"randomOpacity":0.11,
			"randomHardness":0,
			"randomRotation":0,
			"randomRoundness":0,
			"randomRadius":0.02,
			"randomScattering":0,
			"velocityRadius" : [1,9],
			"velocityOpacity" : false
		},
		//'Airbrush',
		{
			"radius":100,
			"spacing":0.21,
			"opacity":0.42,
			"hardness":0.2,
			"rotation":0,
			"roundness":1,
			"blending" :0,
			"dirtcolor" : false,
			"randomOpacity":0,
			"randomHardness":0,
			"randomRotation":0,
			"randomRoundness":0,
			"randomRadius":0,
			"randomScattering":0,
			"velocityRadius" : false, //[-1,2] [1,12]
			"velocityOpacity" : false //[-1,2] [1,60]
		},
		//'Blender',
		{
			"radius":7,
			"spacing":0.15,
			"opacity":0.14,
			"hardness":0.62,
			"rotation":0,
			"roundness":1,
			"blending":1,
			"dirtcolor":false,
			"randomOpacity":0,
			"randomHardness":0,
			"randomRotation":0,
			"randomRoundness":0,
			"randomRadius":0,
			"randomScattering":0.02,
			"velocityRadius" : [1,10], //[-1,2] [1,12]
			"velocityOpacity" : false //[-1,2] [1,60]
		}	
	];
};
// Picker
var pickerClass = function(parent){
	return this.init(parent);
};
pickerClass.prototype = {
	rgb : {'r':0,'g':0,'b':0},
	imageData : null,
	w : 0,
	init : function(parent){
		this.paint = parent;
		this.$sample = $('#picker-sample');
		return this;
	},
	pick : function(x,y){
		var i = 4 * (x + y * this.paint.width);
		this.rgb = 'rgb('+this.paint.currentImageData.data[i]+','+this.paint.currentImageData.data[i + 1]+','+this.paint.currentImageData.data[i + 2]+')';	
		this.$sample.css({
			'top':y + 'px',
			'left':x + 'px',
			'background-color' : this.rgb,
			'display' : 'block'
		});
		return this;
	},
	setColor : function(){
		this.paint.app.ui.color.setForeOrBackColor(0).setColor(this.rgb);
		this.$sample.css({'display' : 'none'});
		return this;
	}	
};
// BRUSH
var brushClass = function(parent){return this.init(parent);};
brushClass.prototype = {	
	init : function(parent){
		this.paint = parent;
		this.setting = {
			radius : 20,
			spacing : .15,
			opacity : 1,
			hardness : 1,
			rotation : 0,
			roundness : 1,
			blending :0,
			dirtcolor : false,			
			randomOpacity : 0,
			randomHardness : 0,
			randomRotation : 0,
			randomRoundness : 0,
			randomRadius : 0,
			randomScattering : 0,
			velocityRadius : false, //[-1,2] [1,12]
			velocityOpacity : false //[-1,2] [1,60]
		};
		return this;
	},
	set : function(opt){
		this.setting = $.extend(this.setting,opt);
		return this;
	},
	update : function(){
		this.spacingPx = 2 * this.setting.spacing * this.setting.radius;
		this.velRadius = 0;
		this.velOpacity = 0;
		// Tool Type
		if(this.paint.eraserMode){
			this.paint.c.globalCompositeOperation = "destination-out";
		}else{
			this.paint.c.globalCompositeOperation = "source-over";			
		}
		return this;
	},
	draw : function(x,y,velFinal){
		var m = this.m(x,y,velFinal);
		this.paint.c.translate(x+m.rsX,y+m.rsY);
		this.paint.c.rotate(m.rotation * Math.PI / 180);
		this.paint.c.scale(1,m.roundness);		

		this.paint.c.fillStyle = m.radgrad;
		this.paint.c.fillRect(-m.radius,-m.radius,2*m.radius,2*m.radius);		
		this.paint.c.setTransform(1,0,0,1,0,0);
		return this;
	},
	dirtColor : function(){
		if(this.setting.dirtcolor){
			this.paint.app.ui.color.setForeOrBackColor(0).setColor(this.dirtFore);
		}		
		return this;
	},
	m : function(x,y,velFinal){
		var opacity = this.setting.opacity,
			rotation = this.setting.rotation,
			roundness = this.setting.roundness,
			hardness = this.setting.hardness,
			radius = this.setting.radius,
			rsX = 0,
			rsY = 0,
			blending = this.setting.blending,
			ablend = 1,			
			rgb = 'rgba('+this.paint.colors[0].r()+','+this.paint.colors[0].g()+','+this.paint.colors[0].b()+',';			

		this.dirtFore = 'rgb('+this.paint.colors[0].r()+','+this.paint.colors[0].g()+','+this.paint.colors[0].b()+')';

		// Random
		if(this.setting.randomOpacity>0){opacity += this.setting.randomOpacity*(2*Math.random()-1);}
		if(this.setting.randomRotation>0){rotation += 180*this.setting.randomRotation*(2*Math.random()-1);}
		if(this.setting.randomRoundness>0){
			roundness += this.setting.randomRoundness*(2*Math.random()-1);
			if(roundness<0.01) roundness = 0.01;if(roundness>1) roundness = 1;
		}
		if(this.setting.randomHardness>0){
			hardness += this.setting.randomHardness*(2*Math.random()-1);
			if(hardness<0.1) hardness = 0.1;if(hardness>0.99) hardness = 0.99;
		}
		if(this.setting.randomRadius>0){radius += this.setting.radius*this.setting.randomRadius*(2*Math.random()-1);}
		if(this.setting.randomScattering>0){
			rsX = radius * this.setting.randomScattering*50*(2*Math.random()-1);
			rsY = radius * this.setting.randomScattering*50*(2*Math.random()-1);
		}

		if(this.setting.velocityRadius != false){
			this.velRadius = this.velRadius + .05*((this.setting.velocityRadius[1]*velFinal) - this.velRadius);				
			radius = Math.round(radius*(1+(this.setting.velocityRadius[0]*this.velRadius/100)));
			if(radius < 1) radius = 1;
			this.spacingPx = 2 * this.setting.spacing * radius;
		}

		if(this.setting.velocityOpacity != false){
			this.velOpacity = this.velOpacity + .01*((this.setting.velocityOpacity[1]*velFinal) - this.velOpacity);				
			opacity = opacity*(1+(this.setting.velocityOpacity[0]*this.velOpacity/100));
			if(opacity < 0) opacity = 0;
			if(opacity > 1) opacity = 1;
		}
		

		// Color
		if(blending > 0){
			var rCurrent = this.paint.colors[0].r(),
				gCurrent = this.paint.colors[0].g(),
				bCurrent = this.paint.colors[0].b(),
				len = this.paint.currentBlendingImageData.data.length,
				fact = Math.round(0.7*radius),
				xInit = x -fact,
				yInit = y -fact,
				col = 0,
				count = 0,
				countAlpha = 0,
				rp=0,
				gp=0,
				bp=0,
				ap=0,
				num=0;
			for(var i=0;i<9;i++){
				num = 4 * (xInit + yInit * this.paint.width);
				if(num>0 && num < len){
					var alp = this.paint.currentBlendingImageData.data[num+3];						
					ap += alp;
					countAlpha++;
					if(alp > 0){
						rp += this.paint.currentBlendingImageData.data[num];
						gp += this.paint.currentBlendingImageData.data[num+1];
						bp += this.paint.currentBlendingImageData.data[num+2];
						count++;
					}						
				}
				col++;
				xInit += fact;
				if(col>=3){
					xInit = x -fact;
					yInit += fact;
					col = 0;
				}
			}
			var r = rCurrent,
				g = gCurrent,
				b = bCurrent;
			if(count>0){
				r = Math.round(rCurrent - blending*(rCurrent - rp/count));
				g = Math.round(gCurrent - blending*(gCurrent - gp/count));
				b = Math.round(bCurrent - blending*(bCurrent - bp/count));					
			}
			if(countAlpha>0){
				ablend = Math.round((opacity - blending*(opacity - ((ap/countAlpha)/255)))*100)/100;
			}
			rgb = 'rgba('+r+','+g+','+b+',';
			this.dirtFore = 'rgb('+r+','+g+','+b+')';		
		}


		var radgrad = this.paint.c.createRadialGradient(0,0,0,0,0,radius);
		radgrad.addColorStop(0, rgb+(hardness*ablend*opacity)+')');
		radgrad.addColorStop(hardness, rgb+(hardness*ablend*opacity)+')');
		radgrad.addColorStop(1, rgb+'0)');

		return {
			'opacity' : opacity,
			'rotation' : rotation,
			'roundness' : roundness,
			'hardness' : hardness,
			'radius' : radius,
			'rsX' : rsX,
			'rsY' : rsY,		
			'radgrad' : radgrad
		}
	}
};

// PAINT
var paintClass = function(app){return this.init(app);};
paintClass.prototype = {
	init : function(app){
		this.app = app;
		this.onPaint = false;
		this.tool = 'brush';
		this.eraserMode = false;

		this.enabled = true;

		this.currentImageData = null;
		this.currentBlendingImageData = null;

		this.$inputForecolor = $('#input-save-forecolor');
		this.$inputBackcolor = $('#input-save-backcolor');

		var forecolor = this.$inputForecolor.val(),
			backcolor = this.$inputBackcolor.val();

		this.colors = [new hypercolor(forecolor),new hypercolor(backcolor)];

		this.$paintSection = $('#paint-section');
		this.$canvas = this.$paintSection.find('canvas.to-draw');

		this.resizeCanvas();

		this.cnv = this.$canvas[0];
		this.cnvBlending = this.$canvas[1];
		this.cnvPicker = this.$canvas[2];

		this.c = this.cnv.getContext('2d');
		this.cBlending = this.cnvBlending.getContext('2d');
		this.cPicker = this.cnvPicker.getContext('2d');

		this.$inputTool = $('#input-save-tool');
		this.picker = new pickerClass(this);
		this.brush = new brushClass(this);
		this.brushPresets = brushPresets();
		this.presetPreviousPicker = parseInt(this.$inputTool.val());
		this.updatePickerCanvas().setPreset(this.presetPreviousPicker).setEvents();

		return this;
	},
	resizeCanvas : function(){
		this.width = this.$paintSection.width();
		this.height = this.$paintSection.height();
		this.$canvas.attr({
			'width' : this.width,
			'height' : this.height
		});
		return this;
	},
	saveColors : function(){
		this.$inputForecolor.val(this.colors[0].hex());
		this.$inputBackcolor.val(this.colors[1].hex());
		return this;
	},
	setPreset : function(num){		
		
		this.presetPreviousPicker = num;
		this.tool = 'brush';
		this.eraserMode = (num == 1) ? true : false;
		$('.tool').removeClass('current').eq(num).addClass('current');

		this.brush.set(this.brushPresets[num]);
		this.$inputTool.val(num);
		return this;
	},
	setPicker : function(){
		this.tool = 'picker';
		$('.tool.brush').removeClass('current');
		$('.tool.picker').addClass('current');
		return this;
	},
	updatePickerCanvas : function(){
		this.cPicker.fillStyle = this.colors[1].hex();
		this.cPicker.fillRect(0,0,this.width, this.height);
		this.cPicker.drawImage(this.cnv, 0, 0, this.width, this.height);
		this.currentImageData = this.cPicker.getImageData(0, 0, this.width, this.height);

		this.cBlending.clearRect(0,0,this.width, this.height);
		this.cBlending.drawImage(this.cnv, 0, 0, this.width, this.height);
		this.currentBlendingImageData = this.cBlending.getImageData(0, 0, this.width, this.height);
		return this;
	},
	setEvents : function(){

		var self = this,
			active = false,
			prevX = null,
			prevY = null,
			pixelCount = 0,
			pos = null,
			hideTool = false,
			hideMenu = false,
			limitHideMenu = this.width - 90,
			mousePos = function(e){
				return {
					x : e.pageX - self.$paintSection.offset().left,
					y : e.pageY - self.$paintSection.offset().top
				}
			};

		this.$canvas.eq(0).mousedown(function(e){
			
			if(self.enabled && self.app.practice.enabled){
				pos = mousePos(e);
				limitHideMenu = this.width - 90;
				active = true; 
				switch(self.tool){
					case 'brush':
						self.brush.update().draw(pos.x,pos.y,0);
						self.app.practice.wasPainted = true;
						self.saveColors();
						break;
					case 'picker':
						self.picker.pick(pos.x,pos.y);
						break;
				}
			}
		});

		this.$paintSection.mousemove(function(e){
			if(active && self.enabled && self.app.practice.enabled){
				pos = mousePos(e);
				if(!hideTool && pos.x < 90){
					self.$paintSection.addClass('hide-tool');
					hideTool = true;
				}
				if(hideTool && pos.x >= 90){
					self.$paintSection.removeClass('hide-tool');
					hideTool = false;
				}
				if(!hideMenu && pos.x > limitHideMenu){
					self.$paintSection.addClass('hide-menu');
					hideMenu = true;
				}
				if(hideMenu && pos.x <= limitHideMenu){
					self.$paintSection.removeClass('hide-menu');
					hideMenu = false;
				}
				switch(self.tool){
					case 'brush':						
						if(prevX == null) prevX = pos.x;
						if(prevY == null) prevY = pos.y;
						var segmentX = (pos.x - prevX),
							segmentY = (pos.y - prevY),
							segment = Math.sqrt(segmentX*segmentX + segmentY*segmentY);	
						pixelCount += segment;						

						if(pixelCount >= self.brush.spacingPx){
							var countStep = Math.round(segment/self.brush.spacingPx);				
							if(countStep != 0){
								var sX = segmentX/countStep,
									sY = segmentY/countStep;
							}else{
								var sX = segmentX,
									sY = segmentY;
							}			
							for(var i = 0; i <= countStep;i++){					
								self.brush.draw(Math.round(prevX + sX*i),Math.round(prevY + sY*i),segment);
							}
							pixelCount = 0;				
						}								
						prevX = pos.x;
						prevY = pos.y;
						break;
					case 'picker':
						self.picker.pick(pos.x,pos.y);
						break;
				}
			}
		});
		$('body').mouseup(function(){
			if(active){
				
				hideTool = false;
				hideMenu = false;
				prevX = null;
				prevY = null;

				switch(self.tool){
					case 'brush':
						self.brush.dirtColor();
						self.$paintSection.removeClass('hide-tool').removeClass('hide-menu');
						self.updatePickerCanvas();
						break;
					case 'picker':
						self.picker.setColor();
						break;
				}				
			}
			active = false;
		});
		return this;
	}
};

// PRACTICE
var practiceClass = function(app){return this.init(app);};
practiceClass.prototype = {

	current : 0,
	playing : false,
	miliseconds : 0,
	milisecondsTotal : 0,
	seconds : 0,
	enabled : false,
	started : false,
	resultList : [],
	wasPainted : false,

	init : function(app){
		this.app = app;
		this.setting = {
			tags : '',
			length : 5,
			duration : 5
		};

		this.$results = $('#result-list');
		this.$resultImage = $('#result-image');


		this.clock = new clockClass({
			id : 'clock-canvas',
			colorBack : '#CCC',
			colorMiddle : '#AAA',
			colorFront : '#FFF',
			shadow : '0 1px 2px rgba(0,0,0,.5)'
		});

		// Timer
		var self = this;

		setInterval(function(){
			if(self.playing && self.enabled && self.app.scene == 'practice'){
				self.miliseconds++;
				self.milisecondsTotal++;
				if(self.miliseconds == 20){
					self.miliseconds = 0;
					self.seconds++;					
					if(self.seconds == self.setting.duration){
						self.seconds = 0;
						self.milisecondsTotal = 0;
						self.next();
					}
				}
				self.clock.render(self.current,self.milisecondsTotal,self.setting.duration*20);
			}
		},50);

		return this;
	},
	resetTimer : function(){
		this.miliseconds = 0;
		this.milisecondsTotal = 0;
		this.seconds = 0;
		return this;
	},
	setNew : function(obj){
		this.setting = $.extend({
			tags : '',
			cat : '',
			length : 5,
			duration : 5
		},obj);
		this.current = 0;
		this.resultList = [];

		this.enabled = true;
		this.playing = false;
		this.started = false;
		this.resetTimer();

		this.app.photo.getPhotos(this.setting.tags,this.setting.cat);
		return this;
	},
	togglePlay : function(flag){
		if(typeof flag != 'undefined'){
			this.playing = !flag;
		}

		if(this.playing){
			this.playing = false;
		}else{
			if(!this.started){
				this.app.paint.resizeCanvas();
				this.next();				
			}
			this.playing = true;
		}
		this.app.ui.tools.renderPlayer();
		return this;
	},
	stop : function(){
		this.togglePlay(false);
		this.enabled = false;
		this.app.ui.tools.renderPlayer();
		this.saveResult().renderResults();
	},
	next : function(){		
		this.current++;
		if(this.current > this.setting.length){
			this.stop();
			this.current--;
		}else{
			this.app.photo.show();			
			this.app.ui.tools.renderPlayer();
			if(this.started){
				this.saveResult();
			}			
			this.started = true;
		}

		return this;
	},
	forceNext : function(){
		this.seconds = 0;
		this.miliseconds = 0;
		this.milisecondsTotal = 0;
		this.playing = true;
		this.next();
		return this;
	},
	saveResult : function(){
		var self = this,
			$nextSketch = $('#next-sketch');
		this.app.paint.enabled = false;
		this.app.paint.updatePickerCanvas();

		if(this.wasPainted){
			this.resultList.push(this.app.paint.currentImageData);
		}
		this.wasPainted = false;


		this.app.paint.resizeCanvas();
		this.app.paint.$canvas.eq(0).fadeOut(250,function(){
			self.app.paint.c.clearRect(0,0,self.app.paint.width,self.app.paint.height);
			self.app.paint.updatePickerCanvas();
			$(this).show();
			self.app.paint.enabled = true;					
		});
		$nextSketch.fadeIn(250,function(){
			setTimeout(function(){
				$nextSketch.fadeOut(200);	
			},1000);
		});	
		return this;
	},
	renderResults : function(){
		if(!this.app.ownApp){
			var len = this.resultList.length,
				w = 258,
				h = 100,
				scale = 1,
				width = 500,
				height = 500,
				self = this;
			this.$results.html('');

			if(len > 0){			
				for(var i = 0; i<len; i++){
					width = this.resultList[i].width;
					height = this.resultList[i].height;

					scale = w/width;
					h = Math.round(scale*height);

					this.app.paint.$canvas.eq(2).attr({
						'width' : width,
						'height' : height
					});

					this.app.paint.cPicker.putImageData (this.resultList[i], 0, 0);
					var $canvas = $('<canvas width="'+w+'" height="'+h+'" rel="'+i+'"></canvas>');
					this.$results.append($canvas);
					var c = $canvas[0].getContext('2d');
					c.scale(scale,scale);
					c.drawImage(this.app.paint.cnvPicker, 0, 0);
					$canvas.click(function(){
						self.renderImageFinal(parseInt($(this).attr('rel')));
					});
				};
			}else{
				this.$results.append($('<div class="no-sketches">No sketches</div>'));
			}
			this.app.ui.modals.toggle('results-modal',true);
		}else{
			this.app.ui.modals.toggle('post-results-modal',true);
		}
		
		return this;
	},
	renderImageFinal : function(num){
		this.app.paint.cPicker.putImageData (this.resultList[num], 0, 0);
		this.$resultImage.attr('src',this.app.paint.cnvPicker.toDataURL('image/png'));

		this.app.ui.modals.toggleImageFinal(true);

		return this;
	}
};

// APP
var appClass = function(){return this.init();};
appClass.prototype = {
	tags : 'animal man woman architecture art car motorcycle anatomy nature tree flowers culture naked music objects design sports illustration fashion costume technology kid products tatoo landscape people travel horse dragon ship manga comic face hands foot eye mountain sea',

	cat : 	[
				[
					'Photography+photography',
					[
						['Animals, Plants & Nature+nature',[['Wild Animals+wild'],['Domesticated Animals+domestic'],['Aquatic Life+underwater'],['Birds+birds'],['Reptiles & Amphibians+reptiles'],['Invertebrates+insects'],['Flowers, Trees & Plants+flora'],['Landscapes+landscapes'],['Waterscapes+waterscapes'],['Weather and Sky+sky']]],
						['Architecture+architecture',[['Bridges & Structures+bridges'],['Statues & Monuments+statues'],['Exterior+exterior'],['Interior+interior']]],
						['Macro+macro',[['Human+human'],['Nature+nature'],['Objects+objects']]],
						['People & Portraits+people',[['Body Art+bodyart'],['Classic Portraits+portraits'],['Self-Portraits+selfportrait'],['Spontaneous Portraits+spontaneous'],['Emotive Portraits+emotive'],['Expressive+expressive'],['Fashion Portraits+fashion'],['Glamour Portraits+glamour'],['Children+children'],['Pin-up+pinup']]],
						['Photojournalism+journalism',[['Military+military'],['People+people'],['Performing Arts+performing'],['Political+political'],['Sports+sports']]],
						['Still Life+still',[['Plant Arrangement+arrangements'],['Dolls and Figures+figures'],['Food and Drink+food']]],
						['Transportation+transportation'],
						['Urban & Rural+civilization',[['Cityscapes & Skylines+cityscape'],['Country Life+country'],['Gardens & Parks+gardens'],['Industrial+industrial']]]
					]
				],
				[		
					'Manga & Anime+manga',
					[
						['Digital Media+digital',[['3D+3d'],['Drawings+drawings'],['Manga (comics)+manga'],['Paintings+paintings']]],
						['Traditional Media+traditional',[['Drawings+drawings'],['Manga (comics)+manga'],['Paintings+paintings']]]
					]
				],
				[
					'Images+resources/stockart',
					[
						['3D & Renders+3drenders'],		
						['Animals+animals',[['Mammals+mammals']]],			
						['Plants+plants'],		
						['Human+model',[['Children+children'],['Female+women'],['Male+men'],['Groups+people']]],			
						['Nature+nature',[['Landscapes+landscapes'],['Waterscapes+waterscapes'],['Skies+skies']]],			
						['Objects+objects'],		
						['Places+places']
					]
				]
			],
	leftHanded : false,
	ownApp : false,

	init : function(){return this;},
	start : function(){

		// SCENE
		// presentation, modal, practice
		this.prevScene = 'presentation';
		this.scene = 'presentation';
		
		this.photo = new photoClass(this);
		this.paint = new paintClass(this);
		this.practice = new practiceClass(this);
		this.ui = new uiClass(this);





		return this;
	}
};
var app = new appClass();
$('document').ready(function(){app.start();});