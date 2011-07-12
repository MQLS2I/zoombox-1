ZoomBox
===========

Yes, yet another Lightbox clone. Requires Mootools 1.3.

**Key features:**
- *fancy* zoom effects
- galleries
- slideshows
- page scrolling while switching images
- captions
- keyboard support
- IE6 support

//![Screenshot](http://url_to_project_screenshot)

How to use
----------

First of all, you will need Mootools 1.3 Core plus these components of Mootools More to run the script:
- Element.Pin
- Fx.Scroll
- Assets
- Keyboard

Then, you have to include *zoombox.css* and *zoombox.js* in your web page. There are many ways to do so, here's the one used most often: paste this code into your web page and adjust paths accordingly to your needs.

    <link rel="stylesheet" href="js/zoombox/zoombox.css" type="text/css" media="screen" />
    <script src="js/zoombox/zoombox.js" type="text/javascript" language="JavaScript"></script>

Next step: mark all the anchors that you want to utilize ZoomBox with *rel="zoombox"* attribute.
Once you've got that ready you can initialize the script. Basically, type in this somewhere in your scripts:

    new ZoomBox();

Of course, make sure *DOM is ready* before launching the code above. If your web page doesn't use any script that executes anything on *domready event* you have to make one.
Create a *example.js* file and fill it with this code:

	document.addEvent('domready', function(){
		new ZoomBox();
	});

...and then include the *example.js* in your web page, just like you have done with *zoombox.js*.

If all went smooth clicking on marked anchors should launch ZoomBox with its' default options. What are these and how to change them? Replace *new ZoomBox()* with this code:

	new ZoomBox({
        selector: 'lightbox'
        back: true,
        slideshow: true,
        scroll: true,
        caption: 2,
        elements: null,
        keys: 1
	});

Now, in your anchors, change value of *rel* attribute from *zoombox* to *lightbox[]*, run the page and see what has changed.

For more detailed documentation see the **Reference** section in the further part of this document.

Screenshots
-----------

Soon!

Reference
-----------------

Soon!

FAQ
-----------------

**Which browsers are supported?**
- Mozilla Firefox (including Firefox 3.x)
- Google Chrome
- Opera 11.50
- Apple Safari 4
- Internet Explorer 6 and above

Credits
-----------------

ZoomBox uses Tango icons: http://tango.freedesktop.org/Tango_Desktop_Project