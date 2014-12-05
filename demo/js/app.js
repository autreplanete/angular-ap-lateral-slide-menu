(function(){

	"use strict";
	
	var app = angular.module('myApp',[
        'ap.lateralSlideMenu',
    ]);
	
	// service	
	app.service('number',  function() {
      return {
        isPositive: function(operationPrice) {
          return String(operationPrice).indexOf("-") == -1;
        }
      };
	});
	
})();