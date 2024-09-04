/*
 © 2021 Trevera
 Loads layout modifications
 */

define(
	'Trevera.Layout.Shopping.Extension'
	, [
		'Trevera.Layout.Header'
		, 'Trevera.NamedAnchors.Extension'
		, 'Trevera.AddressHelpers'
		, 'Trevera.MultiSite.Helpers'
    , 'HF.CreditLock.Extension'
		, 'underscore'
	]
	, function (
		LayoutHeader
		, TreveraNamedAnchorsExtension
		, AddressHelpers
		, MultiSiteHelpers
    , CreditLockExtension
		, _
	) {
		'use strict';


		return {
			mountToApp: function mountToApp(container) {
				var ENVIRONMENT = container.getComponent('Environment'),
            LAYOUT      = container.getComponent('Layout'),
            PROFILE     = container.getComponent('UserProfile');

        var profile_model = {};
        PROFILE.getUserProfile().then(function (profile) {
          profile_model = profile;
        })

				LayoutHeader.mountToApp(container);
        AddressHelpers.mountToApp(container);
        MultiSiteHelpers.mountToApp(container);
        CreditLockExtension.mountToApp(container);

				TreveraNamedAnchorsExtension.mountToApp(container);

				if (LAYOUT) {
					LAYOUT.addToViewContextDefinition(
						'Footer.View'
						, 'footerLogo'
						, 'string'
						, function footerLogo(context) {
							return ENVIRONMENT.getConfig('trevera.footer.logoUrl');
						}
					);
					LAYOUT.addToViewContextDefinition(
						'Cart.QuickAddToCart.View'
						, 'showQuickAddToCartButton'
						, 'boolean'
						, function showQuickAddToCartButton(context) {
							return context.showQuickAddToCartButton && profile_model.isloggedin;
						}
					);
				}

				// fix this since the default causes the content to be rendered outside the default wrapper a tag
				_.extend(ENVIRONMENT.getConfig('bxSliderDefaults', {}), {
					nextText          : '<span class="item-relations-related-carousel-next"><span class="control-text">' + _('next').translate() +
						'</span><i class="carousel-next-arrow"></i></span>',
					prevText          : '<span class="item-relations-related-carousel-prev"><i class="carousel-prev-arrow"></i> <span class="control-text">' + _('prev').translate() +
						'</span></span>'
					, slideMargin     : 10
					, hideControlOnEnd: true
					, responsive      : true
					, infiniteLoop    : false
				});
			}
		}
	});
