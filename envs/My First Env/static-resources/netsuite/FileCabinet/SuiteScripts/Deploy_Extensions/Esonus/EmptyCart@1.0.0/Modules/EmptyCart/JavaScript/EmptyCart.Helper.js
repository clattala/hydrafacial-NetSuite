define('EmptyCart.Helper', [
    'Utils',
    'jQuery',
    'underscore'
], function (
    Utils,
    jQuery,
    _
) {
    'use strict';

    return {
        fadeCart: function (fadeConfig) {
            if (!fadeConfig) {
                fadeConfig = { type: 'in' };
            }

            var messageText = Utils.translate(fadeConfig.message) || '';

            var messageElem = jQuery('<div />')
                .addClass('container emptycart-progress')
                .html(messageText)
                .append(jQuery('<span />').addClass('emptycart-spinner'))
                .hide();

            // NOTE: we need to use shopping layout element because everything below it gets wiped out on cart update
            var shoppingElem = jQuery('.shopping-layout-content');

            if (fadeConfig.type === 'out') {
                jQuery('html, body').animate({ scrollTop: 0 }, 500);

                shoppingElem
                    .css({
                        transition: 'all 1s',
                        opacity: 0
                    });

                messageElem.insertBefore(shoppingElem).fadeIn();
            }
            else {
                jQuery('.emptycart-progress').remove();

                shoppingElem
                    .css({
                        transition: 'all 1s',
                        opacity: 1
                    });
            }
        }
    };
});
