
(function(){

	"use strict";

	var app = angular.module('ap.lateralSlideMenu', []);
	
	app.constant('menuConfig', {
		openClass: 'lateral-slide-menu-is-open',
		inTransitionClass: 'lateral-slide-menu-in-transition'
	});
	
	app.service('menuService', ['$document', function($document) {
		var openScope = null;

		this.open = function( menuScope ) {
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
		
		var getElementAnimationDetails = function(element) {
			var data = null;
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
		
		/*
		$scope.$on('$routeChangeStart', function (event, next) {
    	scope.isOpen = false;
    });
    */

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
	
	app.directive('lateralSlideMenuToggle', function() {
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
				element.bind('click', toggleMenu);
				element.addClass('lateral-slide-menu-toggle');
				// WAI-ARIA
				element.attr({ 'aria-expanded': false });
				scope.$watch(menuCtrl.isOpen, function( isOpen ) {
					element.attr('aria-expanded', !!isOpen);
				});

				scope.$on('$destroy', function() {
					element.unbind('click', toggleMenu);
				});
			}
		};
	});
	
})();