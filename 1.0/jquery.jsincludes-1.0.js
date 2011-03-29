// encoding: utf-8
// ----------------------------------------------------------------------------------
// jQuery.fn.jsincludes v 1.0
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
//   * jQuery.virtualBrowser 1.1+ (http://github.com/maranomynet/virtualbrowser/)
//   * (optional) $.fn.setFocus() plugin
//
//
(function($){

  var _jsincludes      = 'jsincludes',
      _virtualBrowser = 'virtualBrowser',

      _errorHandler = function (e, request) {
          if ( request.isFirst )
          {
            $(this)
                .remove()
                [_virtualBrowser]('disengage');
          }
        },

      _loadedHandler = function (e, request) {
          var body = $(this),
              cfg = body.data(_virtualBrowser).cfg,
              dom = request.resultDOM;
          if ( cfg.disengage )
          {
            body
                .before( dom )
                .detach();
            // cleanup purge body from memory
            setTimeout(function(){  $('<div/>').append( body ).empty(); }, 999);
          }
          if ( cfg.setFocus  &&  $.setFocus )
          {
            // set focus on the first focusable element within the injected DOM
            dom.setFocus();
          }
        },

  
      loadLink = function (clickEv) {
          var inclElm = $(this),
              data = inclElm.data(_jsincludes),
              link = data.link,
              cfg = data.cfg,
              idSelector = link[0].href.split('#')[1];

          cfg.selectors = (idSelector  &&  '#'+idSelector)  ||
                          link.attr('data-selectors')  ||
                          cfg.selector;
          // set focus on the first focusable element within the injected DOM
          // if the load was triggered by a click
          if ( clickEv )
          {
            cfg.setFocus = 1;
          }

          $('<div/>')
              .bind('VBerror', _errorHandler)
              .one('VBloaded', _loadedHandler)
              .replaceAll( inclElm )
              [_virtualBrowser]( cfg, link );

          clickEv  &&  clickEv.preventDefault();
        },


      _jsIncl = $.fn[_jsincludes] = function ( config ) {
          var config = $.extend(new _defaultConfig, _defaultConfig, config);

          this.each(function () {
              var inclElm = $(this);
              if ( !inclElm.data( _jsincludes ) ) // prevent unwanted reruns
              {
                var foundLinks =  inclElm.is('a') ?
                                      inclElm:
                                      inclElm.find('a').not( config.noIncl );

                // loop over the `foundLinks` in each `inclElm`
                foundLinks.each(function () {
                    var link =  $(this),
                        // elm will contain the `inclElm` relative to this `link` (in certain circumstances this will change)
                        elm = inclElm;

                    if ( foundLinks.length > 1 )
                    {
                      // for `inclElm`s that contain more than one link
                      // move them outside the original `inclElm`
                      link
                          .insertBefore( elm )
                          // copying the `inclElm`'s className
                          .addClass( elm.attr('class') );
                      // and setting the link itself as standin `inclElm`.
                      elm = link;
                    }

                    // store useful data for easy access
                    elm.data( _jsincludes, {
                        link: link,
                        cfg:  config
                      });

                    if ( elm.is( config.lazyLoad||'' ) )
                    {
                      // for lazyloaded elements, set `loadLink` as a click handler
                      elm.bind('click', loadLink);
                    }
                    else
                    {
                      // otherwise just load them straight away.
                      loadLink.call( elm[0] );
                    }

                  });

                // if `inclElm` contained multiple links, it has now been emptied out
                // and should thus be discarded.
                if ( foundLinks.length > 1 )
                {
                  inclElm.remove();
                }
              }
            });

          return this;
        },

      // Note: the plugin uses the _defaultConfig private variable,
      // so overwriting/replacing the public _jsIncl.config will not work.
      // Extending is the only way to go.
      _defaultConfig = _jsIncl.config = function(){};


  _defaultConfig.prototype = {
      // global "live" config. extend this object to change default config values retroactively 
      lazyLoad:     '.lazyload',
      noIncl:       '.no-include',
      loadingClass: 'loading',
      disengage:    true          // default to instantly disengage `.virtualBrowser()`s recursive loading behaviour 
      // ...for other options refer to the jQuery.fn.virtualBrowser() documentation
    };
  // _jsIncl.config.foo = 'bar'; // <--- Extend jQuery.fn.jsIncludes.config to set config values for future invocations.


})(jQuery);