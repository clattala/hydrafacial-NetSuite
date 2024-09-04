define('EmptyCart', [
	'EmptyCart.View',
	'underscore'
], function (
	EmptyCartView,
	_
) {
	'use strict';

	return {
		mountToApp: function mountToApp(container) {

			var cart = container.getComponent('Cart'),
				environment = container.getComponent('Environment');

			if (cart && environment) {
				var emptyCartConfig = environment.getConfig('emptyCart') || {},
					emptyCartEnabled = !!emptyCartConfig.enableEmptyCart;

				if (emptyCartEnabled) {
					cart.addChildViews(cart.CART_VIEW, {
						'Cart.Summary': {
							'Empty.Cart': {
								childViewIndex: 99,
								childViewConstructor: function () {
									return new EmptyCartView({
										application: container,
										emptyCartConfig: emptyCartConfig
									});
								}
							}
						}
					});
				}
			}
		}
	};
});
