// encoding: utf-8
// jQuery.fn.jsincludes 1.0 - MIT/GPL Licensed - More info: http://github.com/maranomynet/jsincludes/
(function(c){var m='jsincludes',k='virtualBrowser',o='disengage',y,z=function(e,a){if(a.isFirst){c(this).remove()[k](o)}},A=function(e,a){var d=c(this),g=d.data(k).cfg,b=a.resultDOM;if(g[o]){d.before(b).detach();setTimeout(function(){c('<div/>').append(d).empty()},999)}if(g.setFocus&&c.setFocus){b.setFocus()}},p=function(a){var d=c(this),g=d.data(m);if(g){var b=g.link,f=g.vb,h=f.data(k).cfg,i=b[0].href.split('#')[1],l=h.selector;h.selector=b.attr('data-selectors')||(i&&'#'+i)||l;if(a!==y){j.splice(c.inArray(d[0],j),1);if(a.target&&h.setFocus!==false){h.setFocus=1;a.preventDefault()}}g.vb.replaceAll(d)[k]('load',b);if(!h[o]){g.vb.one('VBloaded',function(e){h.selector=l})}}},s,t=function(e){clearTimeout(s);s=setTimeout(function(){u()},r.refresh)},q,v,j=[],u=function(e){e=e||[];q=q||c(window);var a=q.scrollTop()+q.height();if(e.length||a!=v){j.push.apply(j,e);var d=j.length,g=d-(e.length||d),b,f,h=[];while(d-->g){b=c(j[d]);f=b.data(m).vb.data(k).cfg;if(b.offset().top<a+(f.unseenBuffer||0)){p.call(b[0]);j.splice(d,1)}}v=a}},B,r=c.fn[m]=function(i){if(i=='refresh'){t()}else if(i=='load'){this.each(p)}else{var l=[],w=[],x=[];this.each(function(){var b=c(this),f=c.extend(new n(),n,i,{url:null});if(!b.data(m)){var h=b.is('a')?b:b.find('a').not(f.noIncl);h.each(function(){var e=c(this),a=b;if(h.length>1){f=c.extend(new n(),n,i);e.insertBefore(a).addClass(a.attr('class'));a=e}if(!a.is(f.recurse)){f[o]=true}var d=c('<div/>').bind('VBerror',z).one('VBloaded',A)[k](f),g={elm:a,link:e,vb:d};w.push(d[0]);a.add(d).data(m,g);if(a.is(f.lazyLoad||'')){x.push(a[0]);a.bind('click',p)}else if(!f.delayUnseen||a.is(f.forceLoad)){setTimeout(function(){p.call(a[0])},0)}else{l.push(a[0])}});if(h.length>1){b.remove()}}});if(l.length){setTimeout(function(){u(l)},0);c(window).bind('resize scroll',t)}return{vbBodies:c(w),lazyElms:c(x)}}return this},n=r.config=function(){};n.prototype={lazyLoad:'.lazyload',noIncl:'.no-include',loadingClass:'jsi-loading',unseenBuffer:100,forceLoad:'.forceload',recurse:''};r.refresh=100})(jQuery);
