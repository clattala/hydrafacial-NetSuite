
define(
	'AnnexCloud.LoyaltyPointsRedemption.EntryPoint'
,   [
		'OrderWizard.Module.PointsRedemption',
		'Cart.Promocode.List.Item.View',
		'LiveOrder.Model',
		'underscore'
	]
,   function (
		OrderWizardModulePointsRedemption,
		CartPromocodeListItemView,
		LiveOrderModel,
		_
	)
{
	'use strict';

	return  {
		mountToApp: function mountToApp (container)
		{
			var self = this;
			var checkout = container.getComponent('Checkout');

			if(checkout) {

				var userProfile = container.getComponent('UserProfile');
				userProfile.getUserProfile().then(function(profile) {
					if(profile.isloggedin) {
						self.addCheckoutModules(checkout)
					}
				});
			}

			this.extendContextVariables();
		},

		addCheckoutModules: function addCheckoutModules(checkout) {
			checkout.addModuleToStep( {
				step_url: 'opc',
				module: {
					id: 'loyalty_points_redemption',
					index: 11,
					classname: 'OrderWizard.Module.PointsRedemption',
					options: { }
				}
			});
		},

		extendContextVariables: function extendContextVariables(cart) {
			_.extend(CartPromocodeListItemView.prototype, {
				getContext: _.wrap(CartPromocodeListItemView.prototype.getContext, function (fn){
					var ctx = fn.apply(this, _.toArray(arguments).splice(1));
					var code = ctx.code;

					var cart = LiveOrderModel.getInstance();
					var options = cart.get('options');
					var loyaltycode = options && options['custbody_loyalty_points_red_code'];
					var loyaltypoints = options && options['custbody_loyalty_points_red_redeemed'];

					return _.extend(ctx, {
						code: loyaltycode && loyaltycode == code ? loyaltypoints + ' points applied' : code,
						isloyaltypromo: !!(loyaltycode && loyaltypoints && loyaltycode == code)
					})
				})
			});
		}
	};
});
