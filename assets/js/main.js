/**
*
* @author Deux Huit Huit / Solutions Nitriques
*
* Requires: jPlayer 2.1.0+
*
* A simple plugin that extends the jPlayer object with a fadeTo/fadeIn/fadeOut method
* to control the sound.
* 
* It supports a basic method and concurrents call. The latest specified target will always be applied.
*
* You can use it 2 way
* @static
* $.jPlayer.fadeTo(player, // jQuery or DOM
*			duration, // time in ms
*			from, // starting volume ratio
*			to, //	ending volume ratio
*			callback, // @optional, function
*			debug, // @optional, making the plugin verbose in the console
*			);
* @instance
* $(id).jPlayerFade(debug // @optional
*					  ).to(duration, // time in ms
*						from, // starting volume ratio
*						to, // ending volume ratio
*						callback, // @optional, function
*					   );
* N.B. the debug parameter is set in the jPlayerFade function
* 
* fadeIn and fadeOut provide a better interface for dealing with fadeIn/Out
* The from and to couple are optional.
* The values used are 0 and the volume set in the constructor of the jPlayer
* i.e. $(id).jPlayerFade().out(2000); // will reduce to volume from the original volume
*									  // to 0 in 2 seconds. 
**/

(function ($, undefined) {
	
	"use strict";
	
	var
	
	assurePlayerSound = function (player) {
		// assure we have a jQuery object
		player = $(player);
		
		// assure we have the 'normal' volume
		if (isNaN(player.data('org-vol'))) {
			player.data('org-vol', player.jPlayer('option','volume'));
		}
		
		return player;
	},
	
	consoleLog = function (msg, debug) {
		if (!!console && !!console.log && debug) {
			console.log(msg);
		}
	},
	
	setVolume = function (player, v) {
		player.jPlayer('volume', v);
		player.data('volume', v);
	},
	
	fadeToPlayer = function (player, dur, from, to, callback, debug) {
		
		player = assurePlayerSound(player);
		
		// fade in...?
		if (to > from && !isNaN(player.data('volume')) && player.data('volume') > from) {
			// starting ahead
			from = player.data('volume');
		}
		
		// fade out...?
		if (from > to && !isNaN(player.data('volume')) && player.data('volume') < from) {
			// starting much too low
			from = player.data('volume');
		}
		
		// bunch of vars
		var // diffenrence between the to values
			diff = to - from,
			// number of frames
			limit = dur < 1 ? -1 : dur / 100,
			// time interval between each pass
			int = limit < 1  ? 0 : dur / limit,
			// delta
			m = diff / limit,
			// current position in the progress
			x = 0,
		
		// actual fade step
		fade = function () {
			// are we still in the 'anim' zone
			if (x <= limit) {
				var v = from + m*x;
				
				player.data('is-fading', true);
				
				if (isNaN(v)) {
					consoleLog ('[player] #' + player.attr('id') + ' ***NaN', debug);
				} else {
					
					// set the new volume
					setVolume(player, v);
					
					player.data('fadeout', setTimeout(fade, int));
					
					consoleLog ('[player] #' + player.attr('id') + ' volume set to ' + v, debug);
				}
				
				// increment step counter
				x++;
				
			// reach the end
			} else {
				setVolume(player, to);
				
				consoleLog ('[player] #' + player.attr('id') + ' volume set to ' + to + ' -- end', debug);
				
				player.data('is-fading', false);
				
				if ($.isFunction(callback)) {
					callback.call(player);
				}
			}
		};
		
		// do have a diff
		if (diff !== 0 && !isNaN(diff)) {
			
			// clear old fadeout 
			clearTimeout(player.data('fadeout'));
			
			fade();
			
		} else {
			consoleLog ('[player] #' + player.attr('id') + ' fade out skipped', debug);
			
			// assure we call the callback here too
			if ($.isFunction(callback)) {
				callback.call(player);
			}
		}
		
		return player;
	},
	
	// quick fade out
	fadeOutPlayer = function (player, dur, _in, _out, callback, debug) {
		player = assurePlayerSound(player);
		
		_in  = _in  != null && !isNaN(_in)  ? _in : parseFloat(player.data('org-vol'), 10);
		_out = _out != null && !isNaN(_out) ? _out : 0;
		
		return fadeToPlayer(player, dur, _in, _out, callback, debug);
	},
	
	// quick fade in (note, it's inverted fade out, so _in must be less than _out)
	fadeInPlayer = function (player, dur, _in, _out, callback, debug) {
		player = assurePlayerSound(player);
		
		_in  = _in  != null && !isNaN(_in)  ? _in : 0;
		_out = _out != null && !isNaN(_out) ? _out : parseFloat(player.data('org-vol'), 10);
		
		return fadeToPlayer(player, dur, _in, _out, callback, debug);
	},
	
	playerIsFading = function (player) {
		return !!player.data('is-fading');
	};
	
	
	// actual plugin
	if ($.isFunction($.jPlayer) && !$.isFunction($.jPlayer.fadeTo)) {
		// static function, making them public
		$.extend($.jPlayer, {
			fadeTo:     fadeToPlayer,
			fadeOut:    fadeOutPlayer,
			fadeIn:     fadeInPlayer,
			isFading:   playerIsFading
		});
		// add function to a new object JPlayerFade
		if (!$.fn.jPlayerFade) {
			$.extend($.fn, {
				jPlayerFade: function (debug) {
					// capture jQuery object
					var t = $(this);
					return {
						to: function (dur, from, to, callback) {
							return $.jPlayer.fadeTo(t, dur, from, to, callback, debug);
						},
						'in': function (dur, from, to, callback) {
							return $.jPlayer.fadeIn(t, dur, from, to, callback, debug);
						},
						out: function (dur, from, to, callback) {
							return $.jPlayer.fadeOut(t, dur, from, to, callback, debug);
						},
						isFading: function () {
							return playerIsFading(t);
						}
					};
				}
			});
		}
	} // end if
	
	
})(jQuery);	

var songList = [
	{"songmid":"003EaT0t07rmUN", start: 1, "title":"可爱女人XXX"},
	{"songmid":"0014mJPB40JKiy", start: 648, "title":"星晴"},
	{"songmid":"002aZJzd1bgQlH", start: 77, "title":"鞋子特大号"},
	{"songmid":"003XDrJm08gZIc", start: 4, "title":"爱在西元前"},
	{"songmid":"003BZh8L1mxVEV", start: 4, "title":"烟花易冷"},
	{"songmid":"004TLcwW2nrvyN", start: 8, "title":"稻香"},
	{"songmid":"001ClZea1xSfga", start: 2, "title":"七里香"},
	{"songmid":"001EGsoB2ToMQs", start: 53, "title":"红尘客栈"},
	{"songmid":"003SAFY70Nu60A", start: 143, "title":"我不配"},
	{"songmid":"0003fuoS2k6RxQ", start: 41, "title":"夜的第七章"},
	{"songmid":"004JuHVz4IRw52", start: 22, "title":"告白气球"},
	{"songmid":"003XKCE246C59j", start: 69, "title":"还在流浪"},
	{"songmid":"000NGbcX0US4zg", start: 29, "title":"以父之名"},
	{"songmid":"003Dg9ea0iCkDo", start: 2, "title":"夜曲"},
	{"songmid":"000IUfiM1NhnWK", start: 67, "title":"轨迹"},
	{"songmid":"003dteeP4GvTF6", start: 2, "title":"迷魂曲"},
	{"songmid":"003mr2AI3uh4m9", start: 2, "title":"半岛铁盒"},
	{"songmid":"003hYSIf3mKOac", start: 34, "title":"霍元甲"}
]
function switchSong (info) {
	console.log('switchSong: ', info)
	var myPlayer = $("#jpId");
	var duration = 1000;
	myPlayer.jPlayerFade().out(duration)
	setTimeout(function () {
		myPlayer.jPlayer("setMedia", {
			mp3: "https://kainy.cn/api/meting/?server=tencent&type=url&id=" + info.songmid
		});
		myPlayer.jPlayer("play", info.start); // Begins playing 42 seconds into the media.
		myPlayer.jPlayerFade().in(duration)
	}, duration)
	
}

$(document).ready(function() {
  $("#jpId").jPlayer( {
    ready: function () {
			console.log('play ready')
      
    }
  });
	$('body').on('mouseup', '.item', function(e) {
		var index = $(this).data('index')
		console.log('index: ', index)
		if (index && index>0) {
			switchSong(songList[index])
		}
	})
});


/*
	Parallelism by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$main = $('#main'),
		settings = {

			// Keyboard shortcuts.
				keyboardShortcuts: {

					// If true, enables scrolling via keyboard shortcuts.
						enabled: true,

					// Sets the distance to scroll when using the left/right arrow keys.
						distance: 50

				},

			// Scroll wheel.
				scrollWheel: {

					// If true, enables scrolling via the scroll wheel.
						enabled: true,

					// Sets the scroll wheel factor. (Ideally) a value between 0 and 1 (lower = slower scroll, higher = faster scroll).
						factor: 1

				},

			// Scroll zones.
				scrollZones: {

					// If true, enables scrolling via scroll zones on the left/right edges of the scren.
						enabled: true,

					// Sets the speed at which the page scrolls when a scroll zone is active (higher = faster scroll, lower = slower scroll).
						speed: 15

				}

		};

	// Breakpoints.
		breakpoints({
			xlarge:  [ '1281px',  '1680px' ],
			large:   [ '981px',   '1280px' ],
			medium:  [ '737px',   '980px'  ],
			small:   [ '481px',   '736px'  ],
			xsmall:  [ null,      '480px'  ],
		});

	// Tweaks/fixes.

		// Mobile: Revert to native scrolling.
			if (browser.mobile) {

				// Disable all scroll-assist features.
					settings.keyboardShortcuts.enabled = false;
					settings.scrollWheel.enabled = false;
					settings.scrollZones.enabled = false;

				// Re-enable overflow on main.
					$main.css('overflow-x', 'auto');

			}

		// IE: Fix min-height/flexbox.
			if (browser.name == 'ie')
				$wrapper.css('height', '100vh');

		// iOS: Compensate for address bar.
			if (browser.os == 'ios')
				$wrapper.css('min-height', 'calc(100vh - 30px)');

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Items.

		// Assign a random "delay" class to each thumbnail item.
			$('.item.thumb').each(function() {
				$(this).addClass('delay-' + Math.floor((Math.random() * 6) + 1));
			});

		// IE: Fix thumbnail images.
			if (browser.name == 'ie')
				$('.item.thumb').each(function() {

					var $this = $(this),
						$img = $this.find('img');

					$this
						.css('background-image', 'url(' + $img.attr('src') + ')')
						.css('background-size', 'cover')
						.css('background-position', 'center');

					$img
						.css('opacity', '0');

				});

	// Poptrox.
		$main.poptrox({
			onPopupOpen: function() { 
				$body.addClass('is-poptrox-visible'); 
			},
			onPopupClose: function() { 
				$body.removeClass('is-poptrox-visible'); 
				$('#jpId').jPlayerFade().out(789)
			},
			overlayColor: '#1a1f2c',
			overlayOpacity: 0.75,
			popupCloserText: '',
			popupLoaderText: '',
			selector: '.item.thumb a.image',
			caption: function($a) {
				return $a.prev('h2').html();
			},
			usePopupDefaultStyling: false,
			usePopupCloser: false,
			usePopupCaption: true,
			usePopupNav: true,
			windowMargin: 50
		});

		breakpoints.on('>small', function() {
			$main[0]._poptrox.windowMargin = 50;
		});

		breakpoints.on('<=small', function() {
			$main[0]._poptrox.windowMargin = 0;
		});

	// Keyboard shortcuts.
		if (settings.keyboardShortcuts.enabled)
			(function() {

				$window

					// Keypress event.
						.on('keydown', function(event) {

							var scrolled = false;

							if ($body.hasClass('is-poptrox-visible'))
								return;

							switch (event.keyCode) {

								// Left arrow.
									case 37:
										$main.scrollLeft($main.scrollLeft() - settings.keyboardShortcuts.distance);
										scrolled = true;
										break;

								// Right arrow.
									case 39:
										$main.scrollLeft($main.scrollLeft() + settings.keyboardShortcuts.distance);
										scrolled = true;
										break;

								// Page Up.
									case 33:
										$main.scrollLeft($main.scrollLeft() - $window.width() + 100);
										scrolled = true;
										break;

								// Page Down, Space.
									case 34:
									case 32:
										$main.scrollLeft($main.scrollLeft() + $window.width() - 100);
										scrolled = true;
										break;

								// Home.
									case 36:
										$main.scrollLeft(0);
										scrolled = true;
										break;

								// End.
									case 35:
										$main.scrollLeft($main.width());
										scrolled = true;
										break;

							}

							// Scrolled?
								if (scrolled) {

									// Prevent default.
										event.preventDefault();
										event.stopPropagation();

									// Stop link scroll.
										$main.stop();

								}

						});

			})();

	// Scroll wheel.
		if (settings.scrollWheel.enabled)
			(function() {

				// Based on code by @miorel + @pieterv of Facebook (thanks guys :)
				// github.com/facebook/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
					var normalizeWheel = function(event) {

						var	pixelStep = 10,
							lineHeight = 40,
							pageHeight = 800,
							sX = 0,
							sY = 0,
							pX = 0,
							pY = 0;

						// Legacy.
							if ('detail' in event)
								sY = event.detail;
							else if ('wheelDelta' in event)
								sY = event.wheelDelta / -120;
							else if ('wheelDeltaY' in event)
								sY = event.wheelDeltaY / -120;

							if ('wheelDeltaX' in event)
								sX = event.wheelDeltaX / -120;

						// Side scrolling on FF with DOMMouseScroll.
							if ('axis' in event
							&&	event.axis === event.HORIZONTAL_AXIS) {
								sX = sY;
								sY = 0;
							}

						// Calculate.
							pX = sX * pixelStep;
							pY = sY * pixelStep;

							if ('deltaY' in event)
								pY = event.deltaY;

							if ('deltaX' in event)
								pX = event.deltaX;

							if ((pX || pY)
							&&	event.deltaMode) {

								if (event.deltaMode == 1) {
									pX *= lineHeight;
									pY *= lineHeight;
								}
								else {
									pX *= pageHeight;
									pY *= pageHeight;
								}

							}

						// Fallback if spin cannot be determined.
							if (pX && !sX)
								sX = (pX < 1) ? -1 : 1;

							if (pY && !sY)
								sY = (pY < 1) ? -1 : 1;

						// Return.
							return {
								spinX: sX,
								spinY: sY,
								pixelX: pX,
								pixelY: pY
							};

					};

				// Wheel event.
					$body.on('wheel', function(event) {

						// Disable on <=small.
							if (breakpoints.active('<=small'))
								return;

						// Prevent default.
							event.preventDefault();
							event.stopPropagation();

						// Stop link scroll.
							$main.stop();

						// Calculate delta, direction.
							var	n = normalizeWheel(event.originalEvent),
								x = (n.pixelX != 0 ? n.pixelX : n.pixelY),
								delta = Math.min(Math.abs(x), 150) * settings.scrollWheel.factor,
								direction = x > 0 ? 1 : -1;

						// Scroll page.
							$main.scrollLeft($main.scrollLeft() + (delta * direction));

					});

			})();

	// Scroll zones.
		if (settings.scrollZones.enabled)
			(function() {

				var	$left = $('<div class="scrollZone left"></div>'),
					$right = $('<div class="scrollZone right"></div>'),
					$zones = $left.add($right),
					paused = false,
					intervalId = null,
					direction,
					activate = function(d) {

						// Disable on <=small.
							if (breakpoints.active('<=small'))
								return;

						// Paused? Bail.
							if (paused)
								return;

						// Stop link scroll.
							$main.stop();

						// Set direction.
							direction = d;

						// Initialize interval.
							clearInterval(intervalId);

							intervalId = setInterval(function() {
								$main.scrollLeft($main.scrollLeft() + (settings.scrollZones.speed * direction));
							}, 25);

					},
					deactivate = function() {

						// Unpause.
							paused = false;

						// Clear interval.
							clearInterval(intervalId);

					};

				$zones
					.appendTo($wrapper)
					.on('mouseleave mousedown', function(event) {
						deactivate();
					});

				$left
					.css('left', '0')
					.on('mouseenter', function(event) {
						activate(-1);
					});

				$right
					.css('right', '0')
					.on('mouseenter', function(event) {
						activate(1);
					});

				$body
					.on('---pauseScrollZone', function(event) {

						// Pause.
							paused = true;

						// Unpause after delay.
							setTimeout(function() {
								paused = false;
							}, 500);

					});

			})();

})(jQuery);