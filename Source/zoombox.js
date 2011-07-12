/**
 * @author Bartek Garbiak
 */
var ZoomBox = new Class({

    Implements: Options,

    options: {
        selector: 'zoombox',
        lang: {
            next: 'next',
            prev: 'previous',
            close: 'close'
        },       
        back: false,
        slideshow: null,
        scroll: null,
        caption: 1,
        elements: null,
        keys: 1
    },

    initialize: function(options) {
        this.setOptions(options);        
        
        if (this.options.back) {

            this.backdrop = new Element('div', {
                'class': 'zbBackground'
                })
                .fade('hide')
                .inject(document.body)
                .addEvent('click',function(){
                    this.close($('zbImage'));
                }.bind(this));

            window.addEvent('resize', function() {
                this.backdrop.setStyles({
                    'width': window.getSize().x + 'px',
                    'height': window.getSize().y + 'px'
                });
            }.bind(this));
        }

        this.loader = new Element('div', {
            'class': 'zbLoader',
            'id': 'zbLoader'
            })
            .fade('hide')
            .inject(document.body);

        this.caption = new Element('figcaption', {
            'class': 'zbCaption',
            'id': 'zbCaption',
            'html': '<span></span>'
            })
            .fade('hide')
            .inject(this.loader,'after');

        this.closer = new Element('a',{
            'class': 'zbClose',
            'html': this.options.lang.close,
            'href': '#'
            })
            .fade('hide')
            .inject(this.caption,'after')
            .addEvent('click',function(e){
                var e = new Event(e);
                e.preventDefault();
                this.close($('zbImage'));
            }.bind(this));

        this.fx = new Fx.Morph(this.loader,{
            duration:400,
            wait:false
        });

        if (this.options.keys) {

            this.keys = new Keyboard({
                eventType: 'keyup', 
                events: {

                    'esc': function(){
                        this.close($('zbImage'));
                    }.bind(this),

                    'right': function() {
                        if (this.next)
                            this.slideTo($('zbImage'), this.next);
                    }.bind(this),

                    'left': function() {
                        if (this.prev)
                            this.slideTo($('zbImage'), this.prev);
                    }.bind(this)
                }
            });

            this.keys.deactivate();

        }

        if (this.options.elements)
            this.wrap(this.options.elements);
        else
            this.wrap(this.options.selector);
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

            var a = $$('.zbElements');
            a.each(function(el, i) {
                if (i > 0)
                    el.store('prev', a[i-1]);
                if (i < a.length)
                    el.store('next', a[i+1]);
                if (i == 0)
                    this.click(el);
            }.bind(this));

        }

        else {

            $$('a[rel="' + selector + '"]').each(function(el) {
                el.addEvent('click', function(e) {
                    var e = new Event(e);
                    e.preventDefault();
                    if ($('zbImage') && zb.loader.retrieve('el') == el)
                        this.close($('zbImage'));
                    else if ($('zbImage'))
                        this.slideTo($('zbImage'), el);
                    else this.click(el);
                }.bind(this));
            }.bind(this));

            this.zbHash = new Hash();

            $$('a[rel^="' + selector + '["]').each(function(el) {
                if (!this.zbHash.has(el.get('rel'))) {
                    var zbArray = $$('a[rel="' + el.get('rel') + '"]');
                    if (zbArray.length > 0)
                        this.zbHash.set(el.get('rel'), zbArray);
                }
            }.bind(this));

            this.zbHash.each(function(val, key){
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
                            this.close($('zbImage'));
                        else if ($('zbImage'))
                            this.slideTo($('zbImage'), el);
                        else
                            this.click(el);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }

    },

    click: function(el) {

        this.current = el;
        this.loading(el);

        var image = new Asset.image(el.get('href'), {
            onload: function() {
                if (el == this.current)
                    this.zoom(image,el);
            }.bind(this)
        });

        var number = '';
        if (el.retrieve('index') && el.retrieve('length'))
            var number = el.retrieve('index') + '/' + el.retrieve('length');

        var title = el.get('title');
        if (title == null && el.getElement('img') && el.getElement('img').get('alt'))
            title = el.getElement('img').get('alt');

        if (title == null)
            title = '';
        else if (number)
            number = number + ':';

        this.caption.getElement('span')
            .set('html', number + ' <strong>' + title + '</strong>')
            .setStyle('display', 'none');

        this.closer.fade('hide');

        if (el.retrieve('next')) {

            this.next = el.retrieve('next');

            var next = new Element('a',{
                'href': this.next.get('href'),
                'html': this.options.lang.next,
                'class': 'zbNext'
                })
                .inject(this.caption.getElement('span'))
                .addEvent('click',function(e) {
                    var e = new Event(e);
                    e.preventDefault();
                    this.slideTo(image, this.next);
                }.bind(this));
        }
        else 
            this.next = null;

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
                    this.slideTo(image, this.prev);
                }.bind(this));
        }
        else
            this.prev = null;

        if (this.options.back) {

            if (Browser.Engine.trident4 || !this.backdrop.hasClass('isPinned'))
                var scroll = window.getScroll();
            else 
                var scroll = new Hash({
                    x: 0,
                    y: 0
                });

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
        }

    },

    loading: function(el) {

        if (el.getElement('img'))
            var img = el.getElement('img');
        else
            var img = el;

        this.loader.setStyles({
            'top': img.getPosition().y + 'px',
            'left': img.getPosition().x + 'px',
            'width': img.getSize().x 
                     - parseInt(this.loader.getStyle('border-left-width'))
                     - parseInt(this.loader.getStyle('border-right-width'))
                     + 'px',
            'height': img.getSize().y
                      - parseInt(this.loader.getStyle('border-top-width'))
                      - parseInt(this.loader.getStyle('border-right-width'))
                      + 'px',
            'background-image': ''
        })
        .store('el', el)
        .store('caption', el.get('title'))
        .fade(0.5);
    },

    zoom: function(img) {

        if (this.options.keys)
            this.keys.activate();

        img.inject(this.loader,'after')
            .fade('hide')
            .set('id','zbImage');

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

        (function(){
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
                
            this.closer.pin();
            this.closer.setStyles({
                'top': parseInt(img.getStyle('top')) + 8 + 'px',
                'left': img.getPosition().x + (img.getSize().x) - 24 + 'px',
                'display': 'block'
                })
                .fade('hide');

             if (Browser.Engine.trident4) {
                 this.closer.unpin();
                 window.addEvent('scroll', function() {
                    this.closer.setStyle('top', parseInt(img.getStyle('top')) + 8 + 'px');
                }.bind(this));
             }
        }.bind(this)).delay(200);

        if (!Browser.Engine.trident4)
            this.loader.pin();

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

        (function(){
            if (Browser.Engine.trident4) {
                this.loader.setStyles({
                    'top':img.getPosition().y - parseInt(this.loader.getStyle('border-top-width')) + 'px',
                    'left':img.getPosition().x - parseInt(this.loader.getStyle('border-left-width')) + 'px'
                });
            }

            this.loader.pin();
            img.fade(1);

            if (this.options.caption == 1) 
                img.addEvent('mouseover', function(){
                    this.showCaption(img);
                }.bind(this));
            else if (this.options.caption == 2)
                this.showcaption(img);

        }.bind(this)).delay(500);

        if (this.options.slideshow && this.next) {

            this.timer = this.options.slideshow + 500;

            var checkPeriod = function() {
                this.timer = this.timer - 500;
                if (parseInt(this.timer) < 0) {
                    $clear(this.period);
                    this.slideTo($('zbImage'), this.next);
                }
            }.bind(this);

            this.period = (function(){
                checkPeriod();
            }).periodical(500);

        }
    },

    close: function(img) {
        
        if (this.options.back)
            this.backdrop.setStyle('display', 'none')
                .fade('hide')
                .unpin();

        if (this.options.keys)
            this.keys.deactivate();

        if (this.period)
            $clear(this.period);

        if (img)
            img.unpin()
               .dispose();

        this.loader.setStyle('background-image', 'none');

        if (this.loader.retrieve('el').getElement('img'))
            var el = this.loader.retrieve('el').getElement('img');
        else
            var el = this.loader.retrieve('el');

        this.loader.unpin()
                   .fade(0.5);

        this.fx.start({
            'top':el.getPosition().y - parseInt(el.getStyle('border-top-width')) + 'px',
            'left':el.getPosition().x - parseInt(el.getStyle('border-left-width')) + 'px',
            'width':el.getSize().x + 'px',
            'height':el.getSize().y + 'px'
        });

        (function(){
            this.loader.fade(0);
        }.bind(this)).delay(500);

        this.caption.getElement('span').empty()
                                       .setStyle('display', 'none');

        this.closer.fade('hide')
                   .setStyle('display', 'none');

        this.next = null;
        this.prev = null;
        this.current = null;

    },

    showCaption:function(img) {

        if (this.options.caption == 1) {
            this.caption.fade(0.7);
            this.closer.fade(0.7);
        }
        else {
            this.caption.fade('show').setOpacity(0.7);
            this.closer.fade('show').setOpacity(0.7);
        }

        if (this.options.caption == 1) {

            img.addEvent('mouseleave', function(){
                this.caption.fade(0);
                this.closer.fade(0);
            }.bind(this));

            this.caption.addEvents({
                'mouseenter':function(){
                    this.caption.fade(0.7);
                    this.closer.fade(0.7);
                }.bind(this),
                'mouseleave':function(){
                    this.caption.fade(0);
                    this.closer.fade(0);
                }.bind(this)
            });

            this.closer.addEvents({
                'mouseenter':function(){
                    this.closer.fade(0.7);
                    this.caption.fade(0.7);
                }.bind(this),
                'mouseleave':function(){
                    this.closer.fade(0);
                    this.caption.fade(0);
                }.bind(this)
            });
        }       
    },

    slideTo:function(img, el) {

        if (this.options.scroll) {
            var scrollFx = new Fx.Scroll(window);
            scrollFx.start(0, el.getPosition().y - (window.getSize().y /2 - el.getSize().y/2));
        }

        if (this.period)
            $clear(this.period);

        this.caption.fade('hide')
                    .getElement('span').setStyle('display', 'none')
                                       .empty();

        this.closer.fade('hide')
                   .setStyle('display', 'none');

        if (this.loader.retrieve('el').getElement('img'))
            var prevEl = this.loader.retrieve('el').getElement('img');

        else var prevEl = this.loader.retrieve('el');

        if (el.getElement('img'))
            var t = el.getElement('img');
        else
            var t = el;

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

        if (img) {
            var altLoader = new Element('div', {
                    'class': 'zbLoader'
                })
                .inject(this.loader, 'after')
                .pin()
                .setStyles({
                    'background-image': 'none',
                    'top': img.getPosition().y
                           - parseInt(this.loader.getStyle('border-top-width'))
                           + 'px',
                    'left': img.getPosition().x
                            - parseInt(this.loader.getStyle('border-left-width'))
                            + 'px',
                    'width': img.getSize().x + 'px',
                    'height': img.getSize().y + 'px'
                })
                .fade(0.5)
                .unpin();
        }

        var fx = new Fx.Morph(altLoader);

        fx.start({
            'top': prevEl.getPosition().y
                   - parseInt(prevEl.getStyle('border-top-width'))
                   + 'px',
            'left': prevEl.getPosition().x
                    - parseInt(prevEl.getStyle('border-left-width'))
                    + 'px',
            'width': prevEl.getSize().x
                     + 'px',
            'height': prevEl.getSize().y
                      + 'px'
        });

        img.unpin()
           .dispose();

        (function() {
            altLoader.fade(0);
        }).delay(500);

        (function() {
            altLoader.destroy();
        }).delay(900);

        this.click(el);

    }

});