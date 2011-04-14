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

  var _jsincludes     = 'jsincludes',
      _virtualBrowser = 'virtualBrowser',

      // on 'VBerror' remove the dummy virtualbrowser element and "disengage"
      _errorHandler = function (e, request) {
          if ( request.isFirst )
          {
            $(this)
                .remove()
                [_virtualBrowser]('disengage');
          }
        },

      // on 'VBloaded' (unless !cfg.disengage) we immediately move the .resultDOM
      // to outside the temporary virtualBrowser body element, and detach it form the DOM
      _loadedHandler = function (e, request) {
          var body = $(this),
              cfg = body.data(_virtualBrowser).cfg,
              dom = request.resultDOM;

          if ( cfg.disengage )
          {
            body
                .before( dom ) // NOTE: the VBloaded handlers MUST NOT rely on request.resultDOM being contained within the body
                .detach();
            // cleanup purge body from memory - when all VBloaded handlers have finished running.
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
              vbBody = data.vb,
              link = data.link,
              cfg = data.cfg,
              idSelector = link[0].href.split('#')[1];

          cfg.selector = (idSelector  &&  '#'+idSelector)  ||
                          link.attr('data-selectors')  ||
                          cfg.selector;
          // set focus on the first focusable element within the injected DOM
          // if the load was triggered by a click
          if ( clickEv )
          {
            cfg.setFocus = 1;
          }

          data.vb
              .replaceAll( inclElm )
              [_virtualBrowser]( 'load', link );
          clickEv  &&  clickEv.preventDefault();
        },


      refreshTimeout,

      refreshUnseen = function (e) {
          clearTimeout( refreshTimeout ); 
          refreshTimeout = setTimeout(function(){ loadSeenLinks(); }, _jsIncl.refresh);
        },

      win,
      lastWinBottom,
      unseenElms = [],
      loadSeenLinks = function ( batch ) {
          batch = batch || [];
          win = win || $(window);
          var winBottom = win.scrollTop() + win.height();
          if ( batch.length  ||  winBottom != lastWinBottom )
          {
            unseenElms.push.apply( unseenElms, batch );
            var i = unseenElms.length,
                stopAt = i - (batch.length || i),
                elm,
                seenElms = [];
            while ( i-- > stopAt )
            {
              elm = $(unseenElms[i]);
              if ( elm.offset().top  <  winBottom + (elm.data( _jsincludes ).cfg.unseenBuffer||0) )
              {
                loadLink.call( elm[0] );
                unseenElms.splice(i,1);
              }
            }
            lastWinBottom = winBottom;
          }
        },


      lastcfg,

      _jsIncl = $.fn[_jsincludes] = function ( cfg ) {
          if ( cfg == 'refresh' )
          {
            refreshUnseen();
          }
          else
          {
            // array for storing `inclElm`s that need loading straight away
            var delayedElms = [],
                vbBodies = [],
                lazyElms = [];

            this.each(function () {
                var inclElm = $(this),
                    config = $.extend(new _defaultConfig(), _defaultConfig, cfg, { url:null }); // disable null - the link should always rule!
                if ( !inclElm.data( _jsincludes ) ) // prevent unwanted reruns
                {
                  var foundLinks =  inclElm.is('a') ?
                                        inclElm:
                                        inclElm.find('a').not( config.noIncl );
                  // loop over the `foundLinks` in each `inclElm`
                  foundLinks.each(function () {
                          link =  $(this),
                          // elm will contain the `inclElm` relative to this `link` (in certain circumstances this will change)
                          elm = inclElm;

                      if ( foundLinks.length > 1 )
                      {
                        config = $.extend(new _defaultConfig(), _defaultConfig, cfg);
                        // for `inclElm`s that contain more than one link
                        // move them outside the original `inclElm`
                        link
                            .insertBefore( elm )
                            // copying the `inclElm`'s className
                            .addClass( elm.attr('class') );
                        // and setting the link itself as standin `inclElm`.
                        elm = link;
                      }

                      var vBody = $('<div/>')
                              .bind('VBerror', _errorHandler)
                              .one('VBloaded', _loadedHandler)
                              [_virtualBrowser]( config ),

                          jsiData = {
                              elm:  elm,
                              link: link,
                              vb:   vBody,
                              cfg:  config
                            };

                      vbBodies.push( vBody[0] );

                      // store useful data for easy access
                      elm.add(vBody)
                          .data( _jsincludes, jsiData );

                      if ( elm.is( config.lazyLoad||'' ) )
                      {
                        // for lazyloaded elements, set `loadLink` as a click handler
                        lazyElms.push( elm[0] );
                        elm.bind('click', loadLink);
                      }
                      else if ( !config.delayUnseen  ||  elm.is( config.forceLoad ) )
                      {
                        // NOTE: timeout required since IE will often finish the virtualBrowser ajax request
                        // before subsequent event-handling assignments (etc.) have had chance to finish...
                        setTimeout(function(){  loadLink.call( elm[0] );  }, 0);
                      }
                      else
                      {
                        delayedElms.push( elm[0] );
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
            if ( delayedElms.length )
            {
              // NOTE: timeout required since IE will often finish the virtualBrowser ajax request
              // before subsequent event-handling assignments (etc.) have had chance to finish...
              setTimeout(function(){ loadSeenLinks( delayedElms ); }, 0);
              $(window).bind('resize scroll', refreshUnseen);
            }
          }
          return {
              vbBodies: $(vbBodies),
              lazyElms: $(lazyElms)
            };
        },

      // Note: the plugin uses the `_defaultConfig` private variable,
      // so overwriting/replacing the public `_jsIncl.config` will not work.
      // Extending is the only way to go.
      _defaultConfig = _jsIncl.config = function(){};


  // global "live" config. extend this object to change default config values retroactively 
  _defaultConfig.prototype = {
      lazyLoad:     '.lazyload',   // target elements that match this selector only load when clicked.
      noIncl:       '.no-include', // ignore elemetns that match this selector - just throw them away.
      loadingClass: 'jsi-loading', // className to add to elements while loading takes place.
      //delayUnseen:  false,      // when set to true, links positioned below the fold
      unseenBuffer: 100,          // pixel distance below the visible "fold" where elements stop being loaded when "delayUnseen == true"
      forceLoad:    '.forceload',  // target elements that match this selector are loaded immediately, even when `config.delayUnseen == true`
      //setFocus:     false,      // if non-falsy then attempt to use jQuery.fn.setFocus() to set the keyboard focus to the first focusable element.
      disengage:    true          // default to instantly disengage `.virtualBrowser()`s recursive loading behaviour 
      // ...for other options refer to the jQuery.fn.virtualBrowser() documentation
    };
  // _jsIncl.config.mySetting = 'myValue'; // <--- Extend jQuery.fn.jsIncludes.config to set config values for future invocations.


  _jsIncl.refresh = 100;


})(jQuery);