(function(){

	"use strict";
	var app = angular.module('ap.lateralSlideMenu', []);
	var StatusBar = StatusBar || false;
	
	app.constant('menuConfig', {
		openClass: 'lateral-slide-menu-is-open',
		inTransitionClass: 'lateral-slide-menu-in-transition'
	});
	
	app.service('menuService', ['$document', function($document) {
		var openScope = null;

		this.open = function( menuScope ) {
			if (window.StatusBar !== undefined) StatusBar.hide();
			if ( !openScope ) {
				$document.bind('click', closeMenu);
				$document.bind('keydown', escapeKeyBind);
			}

			if ( openScope && openScope !== menuScope ) {
					openScope.isOpen = false;
			}

			openScope = menuScope;
		};

		this.close = function( menuScope ) {
			if ( openScope === menuScope ) {
				openScope = null;
				$document.unbind('click', closeMenu);
				$document.unbind('keydown', escapeKeyBind);
			}
			if (window.StatusBar !== undefined) StatusBar.show();
		};

		var closeMenu = function( event ) {
			// This method may still be called during the same mouse event that
			// unbound this event handler. So check openScope before proceeding.
			if (!openScope) { return; }
		};
		
		var openMenu = function( event ) {
			// This method may still be called during the same mouse event that
			// unbound this event handler. So check openScope before proceeding.
			if (!openScope) { return; }

			var toggleElement = openScope.getToggleElement();
			if ( event && toggleElement && toggleElement[0].contains(event.target) ) {
					return;
			}

			openScope.$apply(function() {
				openScope.isOpen = false;
			});
		};
		
		var escapeKeyBind = function( evt ) {
			if ( evt.which === 27 ) {
				openScope.focusToggleElement();
				closeMenu();
			}
		};

	}]);
	
	app.controller('MenuController', ['$scope', '$attrs', '$parse', 'menuConfig', 'menuService','$timeout', '$animate', '$window', function($scope, $attrs, $parse, menuConfig, menuService, $timeout, $animate, $window) {
		var self = this,
				scope = $scope.$new(), // create a child scope so we are not polluting original one
				openClass = menuConfig.openClass,
				inTransitionClass = menuConfig.inTransitionClass,
				getIsOpen,
				setIsOpen = angular.noop,
				toggleInvoker = ($attrs.onToggle) ? $parse($attrs.onToggle) : angular.noop;
				
		var CSS_PREFIX = '', TRANSITION_PROP, TRANSITIONEND_EVENT, ANIMATION_PROP, ANIMATIONEND_EVENT;
		
		if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
			CSS_PREFIX = '-webkit-';
			TRANSITION_PROP = 'WebkitTransition';
			TRANSITIONEND_EVENT = 'webkitTransitionEnd transitionend';
		} else {
			TRANSITION_PROP = 'transition';
			TRANSITIONEND_EVENT = 'transitionend';
		}

		if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
			CSS_PREFIX = '-webkit-';
			ANIMATION_PROP = 'WebkitAnimation';
			ANIMATIONEND_EVENT = 'webkitAnimationEnd animationend';
		} else {
			ANIMATION_PROP = 'animation';
			ANIMATIONEND_EVENT = 'animationend';
		}		
		
		var DURATION_KEY = 'Duration';
		var PROPERTY_KEY = 'Property';
		var DELAY_KEY = 'Delay';
		var ANIMATION_ITERATION_COUNT_KEY = 'IterationCount';
		
		var ELAPSED_TIME_MAX_DECIMAL_PLACES = 3;
		var CLOSING_TIME_BUFFER = 1.5;
		var ONE_SECOND = 1000;
		
		var data = null;
		
		var getElementAnimationDetails = function(element) {
			if (!data) {
				var transitionDuration = 0;
				var transitionDelay = 0;
				var animationDuration = 0;
				var animationDelay = 0;

				//we want all the styles defined before and after
				angular.forEach(element, function(element) {
					if (element.nodeType == 1) {
						var elementStyles = $window.getComputedStyle(element) || {};

						var transitionDurationStyle = elementStyles[TRANSITION_PROP + DURATION_KEY];
						transitionDuration = Math.max(parseMaxTime(transitionDurationStyle), transitionDuration);

						var transitionDelayStyle = elementStyles[TRANSITION_PROP + DELAY_KEY];
						transitionDelay  = Math.max(parseMaxTime(transitionDelayStyle), transitionDelay);

						var animationDelayStyle = elementStyles[ANIMATION_PROP + DELAY_KEY];
						animationDelay   = Math.max(parseMaxTime(elementStyles[ANIMATION_PROP + DELAY_KEY]), animationDelay);

						var aDuration  = parseMaxTime(elementStyles[ANIMATION_PROP + DURATION_KEY]);

						if (aDuration > 0) {
							aDuration *= parseInt(elementStyles[ANIMATION_PROP + ANIMATION_ITERATION_COUNT_KEY], 10) || 1;
						}
						animationDuration = Math.max(aDuration, animationDuration);
					}
				});
				data = {
					total : 0,
					transitionDelay: transitionDelay,
					transitionDuration: transitionDuration,
					animationDelay: animationDelay,
					animationDuration: animationDuration
				};
			}
			return data;
		};
		
		var parseMaxTime = function(str) {
			var maxValue = 0;
			var values = angular.isString(str) ?
				str.split(/\s*,\s*/) :
				[];
			angular.forEach(values, function(value) {
				maxValue = Math.max(parseFloat(value) || 0, maxValue);
			});
			return maxValue;
		};
		
		this.init = function( element ) {
			self.$element = element;
			self.page = angular.element(document.getElementsByClassName('lateral-slide-menu-main-page'));
			if ( $attrs.isOpen ) {
				getIsOpen = $parse($attrs.isOpen);
				setIsOpen = getIsOpen.assign;
				$scope.$watch(getIsOpen, function(value) {
					scope.isOpen = !!value;
				});
			}
		};

		this.toggle = function( open ) {
			scope.isOpen = (arguments.length) ? !!open : !scope.isOpen;
			return scope.isOpen;
		};

		// Allow other directives to watch status
		this.isOpen = function() {
			return scope.isOpen;
		};

		scope.getToggleElement = function() {
			return self.toggleElement;
		};

		scope.focusToggleElement = function() {
			if ( self.toggleElement ) {
				self.toggleElement[0].focus();
			}
		};

		scope.$watch('isOpen', function( isOpen, wasOpen ) {
			
			if ( isOpen ) {
				self.$element.addClass(openClass);
				self.$element.addClass(inTransitionClass);
				scope.focusToggleElement();
				menuService.open(scope);
			} else {
				self.$element.removeClass(openClass);
				var timings = getElementAnimationDetails(self.page);
      	var maxDuration = Math.max(timings.transitionDuration, timings.animationDuration);
				$timeout(function(){
        	self.$element.removeClass(inTransitionClass);
        }, (maxDuration * 1000));
				menuService.close(scope);
			}
			setIsOpen($scope, isOpen);
			if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
				toggleInvoker($scope, { open: !!isOpen });
			}
		});
		
		//  angularjs $route
		$scope.$on('$routeChangeSuccess', function () {
    	scope.isOpen = false;
    });
    
    //  angularjs angular-ui/ui-router
    $scope.$on('$stateChangeSuccess', function() {
			scope.isOpen = false;
		});

		$scope.$on('$locationChangeSuccess', function() {
			scope.isOpen = false;
		});
		
		$scope.$on('$destroy', function() {
			scope.$destroy();
		});
	}]);
	
	app.directive('lateralSlideMenuController', function() {
		return {
			controller: 'MenuController',
			restrict: 'AE',
			link: function(scope, element, attrs, menuCtrl) {
				menuCtrl.init( element );
			}
		};
	});
	
	app.directive('lateralSlideMenu', function() {
		return {
			require: '^lateralSlideMenuController',
			restrict: 'AE',
			transclude: true,
			template: '<nav class="lateral-slide-menu"><div class="lateral-slide-menu-scrollable-container" ng-transclude></div></nav><div class="lateral-slide-menu-overlay" lateral-slide-menu-toggle></div>'
		};
	});
	
	app.directive('lateralSlideMenuToggle', ['$timeout', '$rootElement', function($timeout, $rootElement) {
	    var ACTIVE_CLASS_NAME = 'menu-click-active';

	    var TAP_DURATION = 750; // Shorter than 750ms is a tap, longer is a taphold or drag.
        var MOVE_TOLERANCE = 12; // 12px seems to work in most mobile browsers.
        var PREVENT_DURATION = 2500; // 2.5 seconds maximum from preventGhostClick call to click
        var CLICKBUSTER_THRESHOLD = 25; // 25 pixels in any dimension is the limit for busting clicks.

        var lastPreventedTime;
        var touchCoordinates;
        var lastLabelClickCoordinates;

        // ref angular touch gosht CLICK
        // Checks if the coordinates are close enough to be within the region.
        function hit(x1, y1, x2, y2) {
            return Math.abs(x1 - x2) < CLICKBUSTER_THRESHOLD && Math.abs(y1 - y2) < CLICKBUSTER_THRESHOLD;
        }

        // Checks a list of allowable regions against a click location.
        // Returns true if the click should be allowed.
        // Splices out the allowable region from the list after it has been used.
        function checkAllowableRegions(touchCoordinates, x, y) {
            for (var i = 0; i < touchCoordinates.length; i += 2) {
              if (hit(touchCoordinates[i], touchCoordinates[i + 1], x, y)) {
                touchCoordinates.splice(i, i + 2);
                return true; // allowable region
              }
            }
            return false; // No allowable region; bust it.
        }

        // Global click handler that prevents the click if it's in a bustable zone and preventGhostClick
        // was called recently.
        function onClick(event) {
            if (Date.now() - lastPreventedTime > PREVENT_DURATION) {
              return; // Too old.
            }

            var touches = event.touches && event.touches.length ? event.touches : [event];
            var x = touches[0].clientX;
            var y = touches[0].clientY;
            // Work around desktop Webkit quirk where clicking a label will fire two clicks (on the label
            // and on the input element). Depending on the exact browser, this second click we don't want
            // to bust has either (0,0), negative coordinates, or coordinates equal to triggering label
            // click event
            if (x < 1 && y < 1) {
              return; // offscreen
            }
            if (lastLabelClickCoordinates &&
                lastLabelClickCoordinates[0] === x && lastLabelClickCoordinates[1] === y) {
              return; // input click triggered by label click
            }
            // reset label click coordinates on first subsequent click
            if (lastLabelClickCoordinates) {
              lastLabelClickCoordinates = null;
            }
            // remember label click coordinates to prevent click busting of trigger click event on input
            if (nodeName_(event.target) === 'label') {
              lastLabelClickCoordinates = [x, y];
            }

            // Look for an allowable region containing this click.
            // If we find one, that means it was created by touchstart and not removed by
            // preventGhostClick, so we don't bust it.
            if (checkAllowableRegions(touchCoordinates, x, y)) {
              return;
            }

            // If we didn't find an allowable region, bust the click.
            event.stopPropagation();
            event.preventDefault();

            // Blur focused form elements
            event.target && event.target.blur && event.target.blur();
        }


        // Global touchstart handler that creates an allowable region for a click event.
        // This allowable region can be removed by preventGhostClick if we want to bust it.
        function onTouchStart(event) {
            var touches = event.touches && event.touches.length ? event.touches : [event];
            var x = touches[0].clientX;
            var y = touches[0].clientY;
            touchCoordinates.push(x, y);

            $timeout(function() {
              // Remove the allowable region.
              for (var i = 0; i < touchCoordinates.length; i += 2) {
                if (touchCoordinates[i] == x && touchCoordinates[i + 1] == y) {
                  touchCoordinates.splice(i, i + 2);
                  return;
                }
              }
            }, PREVENT_DURATION, false);
        }

        // On the first call, attaches some event handlers. Then whenever it gets called, it creates a
        // zone around the touchstart where clicks will get busted.
        function preventGhostClick(x, y) {
            if (!touchCoordinates) {
              $rootElement[0].addEventListener('click', onClick, true);
              $rootElement[0].addEventListener('touchstart', onTouchStart, true);
              touchCoordinates = [];
            }

            lastPreventedTime = Date.now();

            checkAllowableRegions(touchCoordinates, x, y);
        }

		return {
			require: '^lateralSlideMenuController',
			restrict: 'AE',
			link: function(scope, element, attrs, menuCtrl) {
				if ( !menuCtrl ) {
					return;
				}
				menuCtrl.toggleElement = element;
				var toggleMenu = function(event) {
					event.preventDefault();
					if ( !element.hasClass('disabled') && !attrs.disabled ) {
						scope.$apply(function() {
							menuCtrl.toggle();
						});
					}
				};

				function resetState() {
                  tapping = false;
                  element.removeClass(ACTIVE_CLASS_NAME);
                }

                element.on('touchstart', function(event) {
                  tapping = true;
                  tapElement = event.target ? event.target : event.srcElement; // IE uses srcElement.
                  // Hack for Safari, which can target text nodes instead of containers.
                  if (tapElement.nodeType == 3) {
                    tapElement = tapElement.parentNode;
                  }

                  element.addClass(ACTIVE_CLASS_NAME);

                  startTime = Date.now();

                  // Use jQuery originalEvent
                  var originalEvent = event.originalEvent || event;
                  var touches = originalEvent.touches && originalEvent.touches.length ? originalEvent.touches : [originalEvent];
                  var e = touches[0];
                  touchStartX = e.clientX;
                  touchStartY = e.clientY;
                });

                element.on('touchcancel', function(event) {
                  resetState();
                });

                element.on('touchend', function(event) {
                  var diff = Date.now() - startTime;

                  // Use jQuery originalEvent
                  var originalEvent = event.originalEvent || event;
                  var touches = (originalEvent.changedTouches && originalEvent.changedTouches.length) ?
                      originalEvent.changedTouches :
                      ((originalEvent.touches && originalEvent.touches.length) ? originalEvent.touches : [originalEvent]);
                  var e = touches[0];
                  var x = e.clientX;
                  var y = e.clientY;
                  var dist = Math.sqrt(Math.pow(x - touchStartX, 2) + Math.pow(y - touchStartY, 2));

                  if (tapping && diff < TAP_DURATION && dist < MOVE_TOLERANCE) {
                    // Call preventGhostClick so the clickbuster will catch the corresponding click.
                    preventGhostClick(x, y);

                    // Blur the focused element (the button, probably) before firing the callback.
                    // This doesn't work perfectly on Android Chrome, but seems to work elsewhere.
                    // I couldn't get anything to work reliably on Android Chrome.
                    if (tapElement) {
                      tapElement.blur();
                    }

                    if (!angular.isDefined(attr.disabled) || attr.disabled === false) {
                      element.triggerHandler('click', [event]);
                    }
                  }

                  resetState();
                });

                // Hack for iOS Safari's benefit. It goes searching for onclick handlers and is liable to click
                // something else nearby.
                element.onclick = function(event) { };


				element.on('click', toggleMenu);
				element.on('mousedown', function(event) {
                  element.addClass(ACTIVE_CLASS_NAME);
                });

                element.on('mousemove mouseup', function(event) {
                  element.removeClass(ACTIVE_CLASS_NAME);
                });

				element.addClass('lateral-slide-menu-toggle');
				// WAI-ARIA
				element.attr({ 'aria-expanded': false });
				scope.$watch(menuCtrl.isOpen, function( isOpen ) {
					element.attr('aria-expanded', !!isOpen);
				});

				scope.$on('$destroy', function() {
					element.off('click', toggleMenu);
				});
			}
		};
	}]);
	
})();
