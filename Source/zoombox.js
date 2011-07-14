/**
 * @author Bart Garbiak
 */
var ZoomBox = new Class({

    Implements: [Options, Events],

    options: {
        rel        : 'zoombox',
        selector   : null,
        elements   : null,
        html5      : false, 
        backdrop   : false,
        slideshow  : false, //false or true
        scroll     : false, //false or true
        caption    : 1, //1 == 'onmouseover', -1 == always, 0 == never
        keyboard   : true,
        transition : null,
        gallery    : true,
        lang       : {
            next: 'next',
            prev: 'previous',
            close: 'close'
        }
    },

    initialize: function(options) {
        this.setOptions(options);
        
        this.build();

        this.fxCreate();

        this.options.keyboard ? this.keyboard() : null;

        this.options.elements ? this.wrap(this.options.elements) : this.wrap(this.options.selector);

    },

    keyboard: function() {
        this.keys = new Keyboard({
            eventType : 'keyup', 
            events    : {
            	'esc'   : function(){
                    		  this.close();
                		  }.bind(this),

                'right' : function() {
                    		  this.next ? this.slideTo(this.next) : null;
                		  }.bind(this),

                'left'  : function() {
                              this.prev ? this.slideTo(this.prev) : null;
                          }.bind(this)
            }
        });

        this.keys.deactivate();
    },

    build: function() {
    	this.options.backdrop ? this.backdropCreate() : null;

        this.loader = new Element('div', {'class' : 'zbLoader'}).fade('hide').inject(document.body);

        this.caption = new Element(this.options.html5 ? 'figcaption' : 'div', {
	            'class': 'zbCaption',
	            'html': '<span></span>'
            })
            .fade('hide')
            .inject(this.loader, 'after');

        this.closeAnchor = new Element('a', {
                'class': 'zbClose',
                'html': this.options.lang.close,
                'href': '#'
            })
            .fade('hide')
            .inject(this.caption, 'after')
            .addEvent('click', function(e) {
                var e = new Event(e);
                e.preventDefault();
                this.close();
            }.bind(this));
    },
    
    fxCreate: function() {
    	this.fxProperties = {
            duration   : 400,
            link       : 'cancel',
            transition : this.options.transition ? this.options.transition : null
        };

        this.fx = new Fx.Morph(this.loader, this.fxProperties).addEvent('complete', function() {
        	if (Browser.ie6) {
                this.loader.setStyles({
                    top  : img.getPosition().y - parseInt(this.loader.getStyle('border-top-width')),
                    left : img.getPosition().x - parseInt(this.loader.getStyle('border-left-width'))
                });
            }

            this.loader.pin();
            this.img.fade(1);

            if (this.options.caption != 0) {
            	this.showCaption(this.img);
            }
        }.bind(this));
    },

    backdropCreate: function() {
    	this.backdrop = new Element('div', {
	        'class': 'zbBackground'
	        })
	        .fade('hide')
	        .inject(document.body)
	        .addEvent('click', function() {
	            this.close();
	        }.bind(this));

        window.addEvent('resize', function() {
            this.backdrop.setStyles({
                width  : window.getSize().x + 'px',
                height : window.getSize().y + 'px'
            });
        }.bind(this));
    },
    
    backdropShow: function() {
    	if (Browser.ie6 || !this.backdrop.hasClass('isPinned')) {
            var scroll = window.getScroll();
        }
        else {
            var scroll = {
                x: 0,
                y: 0
            };
        }

        this.backdrop.setStyles({
            'display': 'block',
            'width': window.getSize().x + 'px',
            'height': window.getSize().y + 'px',
            'top': scroll.y + 'px',
            'left': scroll.x + 'px'
        })
        .fade(0.7)
        .pin()
        .addClass('isPinned');
    }.protect(),
    
    backdropHide: function() {
    	this.backdrop.setStyle('display', 'none')
            .fade('hide')
            .unpin();
    },

    wrap: function(selector) {

        //
        if (this.options.elements) {

            this.options.elements.each(function(el, index) {
                var trigger = new Element('a', {
                    'class': 'zbElements',
                    'href': el[0],
                    'title': el[1]
                    })
                    .inject(document.body)
                    .pin();
                trigger.store('index',index + 1)
                    .store('length', this.options.elements.length);
            }.bind(this));

            var elements = $$('.zbElements');
            elements.each(function(el, i) {
                if (i > 0) {
                    el.store('prev', a[i-1]);
                }
                if (i < a.length) {
                    el.store('next', a[i+1]);
                }
                if (i == 0) {
                    this.click(el);
                }
            }.bind(this));

        }

        else {
            var elements = this.options.selector ? this.options.selector : $$('a[rel="' + this.options.rel + '"]');
            elements.each(function(el) {
                el.addEvent('click', function(e) {
                    var e = new Event(e);
                    e.preventDefault();
                    if ($('zbImage') && this.loader.retrieve('el') == el) {
                        this.close();
                    }
                    else if ($('zbImage')) {
                        this.slideTo(el);
                    }
                    else {
                    	this.click(el);
                    }
                }.bind(this));
            }.bind(this));

			this.galleryCreate();

			this.preparePrevNext();
        }

    },
    
    galleryCreate: function() {
    	this.elements = {};
        if (this.options.rel) {
            $$('a[rel^="' + this.options.rel + '["]').each(function(el) {
                if (!this.elements[el.get('rel')]) {
                    var array = $$('a[rel="' + el.get('rel') + '"]');
                    if (array.length > 0) {
                        this.elements[el.get('rel')] = array;
                    }
                }
            }.bind(this));
        }
        else if (this.options.selector && this.options.gallery) {
        	this.elements.gallery = this.options.selector;
        }
    },
    
    preparePrevNext: function() {
    	for (var key in this.elements) {
			if (this.elements.hasOwnProperty(key)) {
        	    var val = this.elements[key];
                val.each(function(el, i){
                    el.store('index',i + 1)
                      .store('length', val.length);
                    if (i > 0)
                        el.store('prev', val[i-1]);
                    if (i < val.length)
                        el.store('next', val[i+1]);

                    el.addEvent('click',function(e) {
                        var e = new Event(e);
                        e.preventDefault();
                        if ($('zbImage') && this.loader.retrieve('el') == el)
                            this.close();
                        else if ($('zbImage'))
                            this.slideTo(el);
                        else
                            this.click(el);
                    }.bind(this));
                }.bind(this));
            }
        }
    },

    click: function(el) {

        this.current = el;
        this.loading(el);

        var image = new Asset.image(el.get('href'), {
            onload: function() {
                if (el == this.current) {
                    this.zoom(el);
                }
            }.bind(this)
        });
        
        var number = '';
        if (el.retrieve('index') && el.retrieve('length')) {
            var number = el.retrieve('index') + '/' + el.retrieve('length');
        }

        var title = el.get('title');
        if (title == null && el.getElement('img') && el.getElement('img').get('alt')) {
            title = el.getElement('img').get('alt');
        }

        if (title == null) {
            title = '';
        }
        else if (number) {
            number = number + ':';
        }

        this.caption.getElement('span')
            .set('html', number + ' <strong>' + title + '</strong>')
            .setStyle('display', 'none');

        this.closeAnchor.fade('hide');

        if (el.retrieve('next')) {

            this.next = el.retrieve('next');

            var next = new Element('a', {
                'href': this.next.get('href'),
                'html': this.options.lang.next,
                'class': 'zbNext'
                })
                .inject(this.caption.getElement('span'))
                .addEvent('click', function(e) {
                    var e = new Event(e);
                    e.preventDefault();
                    this.slideTo(this.next);
                }.bind(this));
        }
        else {
            this.next = null;
        }

        if (el.retrieve('prev')) {

            this.prev = el.retrieve('prev');
            var prev = new Element('a',{
                'href':this.prev.get('href'),
                'html':this.options.lang.previous,
                'class':'zbPrev'
                })
                .inject(this.caption.getElement('span'),'top')
                .addEvent('click',function(e){
                    var e = new Event(e);
                    e.preventDefault();
                    this.slideTo(this.prev);
                }.bind(this));
        }
        else {
            this.prev = null;
        }

        this.options.backdrop ? this.backdropShow() : null;

    },

    loading: function(el) {
    	var anchor = el.getElement('img') ? el.getElement('img') : el,
    	    pos    = anchor.getPosition(),
            size   = anchor.getSize(),
            loader = this.loader;

        loader.setStyles({
            top    : pos.y,
            left   : pos.x,
            width  : size.x 
                     - parseInt(loader.getStyle('border-left-width'))
                     - parseInt(loader.getStyle('border-right-width'))
                     + 'px',
            height : size.y
                      - parseInt(loader.getStyle('border-top-width'))
                      - parseInt(loader.getStyle('border-right-width'))
                      + 'px',
            backgroundImage : ''
        })
        .store('el', el)
        .store('caption', el.get('title'))
        .fade(0.5);
    },

    zoom: function(img) {

        this.options.keyboard ? this.keys.activate() : null;

        img.inject(this.loader, 'after')
            .fade('hide')
            .set('id','zbImage');
            
        this.img = img;

        var x = img.get('width');
        var y = img.get('height');
        var m = 0;
        var w = window.getSize();
        var s = window.getScroll();

        if (x > w.x) {
            img.set('width',w.x - 60);
            img.set('height',y * ((w.x - 60) / x));
        }

        if (img.get('height') > w.y) {
            img.set('height',w.y - m - 20);
            img.set('width',x * ((w.y - m - 60) / y));
        }

        img.setStyles({
            'position': 'absolute',
            'top': s.y + (w.y / 2) - (img.get('height') / 2) + 'px',
            'left': s.x + (w.x / 2) - (img.get('width') / 2) + 'px'
        }).pin();

        (function() {
            this.caption.getElement('span').setStyle('display','block');
            this.caption.unpin().setStyles({
                'width': img.get('width') + 'px',
                'top': window.getScroll().y
                       + (window.getSize().y / 2)
                       + (img.getSize().y / 2)
                       - this.caption.getSize().y + 'px',
                'left': img.getPosition().x + 'px',
                'display': 'block'
            })
            .fade('hide')
            .pin();
                
            this.closeAnchor.pin();
            this.closeAnchor.setStyles({
                'top': parseInt(img.getStyle('top')) + 8 + 'px',
                'left': img.getPosition().x + (img.getSize().x) - 24 + 'px',
                'display': 'block'
                })
                .fade('hide');

             if (Browser.ie6) {
                 this.closeAnchor.unpin();
                 window.addEvent('scroll', function() {
                    this.closeAnchor.setStyle('top', parseInt(img.getStyle('top')) + 8 + 'px');
                }.bind(this));
             }
        }.bind(this)).delay(200);

        if (!Browser.ie6) {
            this.loader.pin();
        }

        this.loader.fade(0.8);

        this.fx.start({
            'top': img.getPosition().y
                   - parseInt(this.loader.getStyle('border-top-width'))
                   + 'px',
            'left': img.getPosition().x
                    - parseInt(this.loader.getStyle('border-left-width'))
                    + 'px',
            'width': img.getSize().x + 'px',
            'height': img.getSize().y + 'px'
        });

        if (this.options.slideshow && this.next) {

            this.timer = this.options.slideshow + 500;

            var checkPeriod = function() {
                this.timer = this.timer - 500;
                if (parseInt(this.timer) < 0) {
                    window.clearInterval(this.period);
                    this.slideTo(this.next);
                }
            }.bind(this);

            this.period = (function(){
                checkPeriod();
            }).periodical(500);

        }
    },

    close: function() {
        
        this.options.backdrop ? this.backdropHide() : null;
        this.options.keyboard ? this.keys.deactivate() : null;

        if (this.period) {
            window.clearInterval(this.period);
        }

        this.img.unpin()
                .dispose();

        this.loader.setStyle('background-image', 'none');

        if (this.loader.retrieve('el').getElement('img')) {
            var el = this.loader.retrieve('el').getElement('img');
        }
        else {
            var el = this.loader.retrieve('el');
        }

        this.loader.unpin()
                   .fade(0.5);

        this.fx.start({
            'top':el.getPosition().y - parseInt(el.getStyle('border-top-width')) + 'px',
            'left':el.getPosition().x - parseInt(el.getStyle('border-left-width')) + 'px',
            'width':el.getSize().x + 'px',
            'height':el.getSize().y + 'px'
        });

        (function() {
            this.loader.fade(0);
        }.bind(this)).delay(500);

        this.caption.getElement('span').empty()
                                       .setStyle('display', 'none');

        this.closeAnchor.fade('hide')
                   .setStyle('display', 'none');

        this.next = null;
        this.prev = null;
        this.current = null;

    },

    showCaption: function(img) {

        if (this.options.caption > 0) {
            img.addEvent('mouseover', function(){
                this.caption.fade(0.7);
                this.closeAnchor.fade(0.7);
            }.bind(this));
        }
        else {
            this.caption.fade('show').setOpacity(0.7);
            this.closeAnchor.fade('show').setOpacity(0.7);
        }

        if (this.options.caption > 0) {

            img.addEvent('mouseleave', function(){
                this.caption.fade(0);
                this.closeAnchor.fade(0);
            }.bind(this));

            [this.caption, this.closeAnchor].each(function(el){
            	el.addEvents({
	                'mouseenter' : function(){
	                    this.caption.fade(0.7);
	                    this.closeAnchor.fade(0.7);
	                }.bind(this),
	                'mouseleave' : function(){
	                    this.caption.fade(0);
	                    this.closeAnchor.fade(0);
	                }.bind(this)
	            });
            }.bind(this));
        }
    },

    slideTo: function(el) {

        if (this.options.scroll) {
            var scrollFx = new Fx.Scroll(window);
            scrollFx.start(0, el.getPosition().y - (window.getSize().y / 2 - el.getSize().y / 2));
        }

        if (this.period) {
            window.clearInterval(this.period);
        }

        this.caption.fade('hide')
                    .getElement('span').setStyle('display', 'none')
                                       .empty();

        this.closeAnchor.fade('hide')
                   .setStyle('display', 'none');

        if (this.loader.retrieve('el').getElement('img')) {
            var prevEl = this.loader.retrieve('el').getElement('img');
        }
        else {
        	var prevEl = this.loader.retrieve('el');
        }

        if (el.getElement('img')) {
            var t = el.getElement('img');
        }
        else {
            var t = el;
        }

        this.loader.unpin()
                    .setStyles({
                        'top': window.getScroll().y
                               + t.getPosition().y
                               - parseInt(el.getStyle('border-top-width'))
                               + 'px',
                        'left': t.getPosition().x
                                - parseInt(el.getStyle('border-left-width'))
                                + 'px',
                        'width': t.getSize().x
                                 - parseInt(el.getStyle('border-left-width'))
                                 - parseInt(el.getStyle('border-right-width'))
                                 + 'px',
                        'height': t.getSize().y
                                  - parseInt(el.getStyle('border-top-width'))
                                  - parseInt(el.getStyle('border-bottom-width'))
                                  + 'px'
                    })
                    .fade('hide')
                    .fade(0.5);

		var img = this.img;

        if (img) {
            var altLoader = new Element('div', {
                    'class': 'zbLoader'
                })
                .inject(this.loader, 'after')
                .pin()
                .setStyles({
                    'background-image': 'none',
                    'top' : img.getPosition().y
                           - parseInt(this.loader.getStyle('border-top-width'))
                           + 'px',
                    'left' : img.getPosition().x
                            - parseInt(this.loader.getStyle('border-left-width'))
                            + 'px',
                    'width' : img.getSize().x + 'px',
                    'height' : img.getSize().y + 'px'
                })
                .fade(0.5, 0)
                .unpin();
        }

        var fx = new Fx.Morph(altLoader, this.fxProperties);

        fx.removeEvents('complete').addEvent('complete', function() {
        	altLoader.fade(0); //onComplete: destroy();
        	(function() {
                altLoader.destroy();  
            }).delay(400);
        }).start({
            top     : prevEl.getPosition().y
                      - parseInt(prevEl.getStyle('border-top-width'))
                      + 'px',
            left    : prevEl.getPosition().x
                      - parseInt(prevEl.getStyle('border-left-width'))
                      + 'px',
            width   : prevEl.getSize().x + 'px',
            height  : prevEl.getSize().y + 'px'
        });

        img.unpin()
           .dispose();        

        this.click(el);

    }

});