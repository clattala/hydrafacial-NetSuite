define('SuiteCommerce.Slideshow.Common.Utils',
    [
        'jQuery'
    ],
    function (jQuery) {
        return {
            trim: function trim(str) {
                return jQuery.trim(str);
            },

            isPhoneDevice: function isPhoneDevice() {
                return this.getDeviceType() === 'phone';
            },

            getDeviceType: function getDeviceType(widthToCheck) {
                const width = widthToCheck || this.getViewportWidth();

                if (width !== undefined && width < 768) {
                    return 'phone';
                }
                if (width !== undefined && width < 992) {
                    return 'tablet';
                }
                return 'desktop';
            },

            getViewportWidth: function getViewportWidth() {
                var viewportWidth = 0;
                if (jQuery(window).width() !== undefined) {
                    viewportWidth = jQuery(window).width();
                }
                return viewportWidth;
            }

        }
    });