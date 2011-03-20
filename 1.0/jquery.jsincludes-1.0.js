// encoding: utf-8
// ----------------------------------------------------------------------------------
// jQuery.fn.jsinclude v 1.0
// ----------------------------------------------------------------------------------
// Copyright 2011
//   Hugsmiðjan ehf. (http://www.hugsmidjan.is) &
//   Már Örlygsson  (http://mar.anomy.net/)
//
// Dual licensed under a MIT licence (http://en.wikipedia.org/wiki/MIT_License)
// and GPL 2.0 or above (http://www.gnu.org/licenses/old-licenses/gpl-2.0.html).
// ----------------------------------------------------------------------------------
//
// Requires:
//   * jQuery 1.4+
//   * jQuery.virtualBrowser 1.1+
//
(function($){

  var _jsIncl = $.fn.jsinclude = function ( cfg ) {

          cfg = $.extend(new _defaultConfig, _defaultConfig, cfg);


          return this;
        },

      _defaultConfig = _jsIncl.config = function(){};


  _defaultConfig.prototype = {
      // global "live" config. extend this object to change default config values retroactively 
      lazyLoad:     '.lazy',
      noIncl:       '.no-include'
      loadingClass: 'loading',
    };
  // _jsIncl.config.foo = 'bar'; // <--- Extend jQuery.fn.jsIncludes.config to set config values for future invocations.


})(jQuery);