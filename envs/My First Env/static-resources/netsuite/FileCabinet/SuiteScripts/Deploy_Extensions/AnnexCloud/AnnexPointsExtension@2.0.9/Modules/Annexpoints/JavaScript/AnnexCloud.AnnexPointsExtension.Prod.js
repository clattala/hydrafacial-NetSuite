define(
    'AnnexCloud.AnnexPointsExtension.Prod', [
    'Annexpoints.View',
    'Annexpointsplp.View',
    'AnnexpointsCart.View',
	'underscore'
], function (
    AnnexpointsView,
    AnnexpointsplpView,
    AnnexpointsCartView,
   _
) {
    'use strict';
	
	return {
			
		
    mountToApp: function mountToApp(container) {
       
           var pdp = container.getComponent('PDP');

         if (pdp) {
            //console.log("In pdp");
                pdp.addChildViews(
                    'ProductDetails.Full.View', {
                        'Quantity.Pricing': {
                            'Annexpoints.View':
                                {
                                    childViewIndex: 6,
                                    childViewConstructor: function () {
                                        return new AnnexpointsView({
                                            pdp: pdp,
                                            container:container
                                        });
                                    }
                                }
                        }
                    }
                );
            }
           var plp = container.getComponent('PLP');

           if (plp) {
            
                plp.addChildViews(plp.PLP_VIEW, {
                        'Facets.Items': {
                            'Annexpointsplp.View':
                                {
                                    childViewIndex: 7,
                                    childViewConstructor: function () {
                                        return new AnnexpointsplpView({
                                            pdp: pdp,
                                            container:container
                                        });
                                    }
                                }
                        }
                    }
                );
            }
           
            var checkout = container.getComponent('Checkout');
            if(checkout)
			{
               // console.log("In checkout");

                checkout.addChildViews(
                    'Wizard.View', {
                        'PromocodeList': {
                            'AnnexpointsCart.View':
                                {
                                    childViewIndex: 6,
                                    childViewConstructor: function () {
                                        return new AnnexpointsCartView({
                                            pdp: pdp,
                                            container:container
                                        });
                                    }
                                }
                        }
                    }
                );
            }
            var cart = container.getComponent('Cart');
            if(cart)
			{
                //console.log("In cart");
               cart.addChildViews(
                    'Cart.Detailed.View', {
                        'CartPromocodeListView': {
                            'AnnexpointsCart.View':
                                {
                                    childViewIndex: 6,
                                    childViewConstructor: function () {
                                        return new AnnexpointsCartView({
                                            pdp: pdp,
                                            container:container
                                        });
                                    }
                                }
                        }
                    }
                );
            }	
            
        

            }
    };
});
