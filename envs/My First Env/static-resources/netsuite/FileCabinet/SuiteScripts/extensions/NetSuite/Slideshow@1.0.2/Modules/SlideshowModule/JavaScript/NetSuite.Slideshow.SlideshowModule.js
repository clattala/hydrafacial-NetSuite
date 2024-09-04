define(
    'NetSuite.Slideshow.SlideshowModule',
    [
        'NetSuite.Slideshow.SlideshowCCT'
    ],
    function (SlideshowCCT) {
        'use strict';
        return {
            mountToApp: function mountToApp(container) {
                SlideshowCCT.mountToApp(container);
            }
        };
    });