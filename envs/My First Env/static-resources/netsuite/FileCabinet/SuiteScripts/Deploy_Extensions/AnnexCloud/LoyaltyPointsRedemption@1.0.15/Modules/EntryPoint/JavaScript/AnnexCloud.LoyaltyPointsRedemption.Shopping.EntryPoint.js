
define(
	'AnnexCloud.LoyaltyPointsRedemption.Shopping.EntryPoint'
,   [
		'Cart.Promocode.List.Item.View',
		'underscore'
	]
,   function (
		CartPromocodeListItemView,
		_
	)
{
	'use strict';
			
    _.extend(CartPromocodeListItemView.prototype, {
		getContext: _.wrap(CartPromocodeListItemView.prototype.getContext, function (fn){
			var ctx = fn.apply(this, _.toArray(arguments).splice(1));
			var code = ctx.code;

			return _.extend(ctx, {
				code: code && code.startsWith('LRP') ? 'MYREWARDS points applied' : code,
				isloyaltypromo: code.startsWith('LRP')
			})
		})
	});
});
