define("LoyaltyPointsRedemption.EntryPoint.ServiceController",
    [
        "ServiceController",
        'LoyaltyPointsRedemption.Model'
    ], function(
        ServiceController,
        LoyaltyPointsRedemptionModel
    ) {
        "use strict";

        return ServiceController.extend({
            name: "LoyaltyPointsRedemption.EntryPoint.ServiceController",

            // The values in this object are the validation needed for the current service.
            options: {
                common: {}
            },

            get: function get() {
                var action = this.request.getParameter('action');
                if(action == 'getUserPoints') {
                    var requestPayload = this.request.getParameter('requestPayload');
                    var token = this.request.getParameter('token');
                    return LoyaltyPointsRedemptionModel.getUserPoints(requestPayload, token);
                } else if (action == 'getPromotionCode') {
                    var discount = this.request.getParameter('discount');
                    return LoyaltyPointsRedemptionModel.getPromotionCode(discount);
                } else if(action == 'removePromotion') {
                    var promoid = this.request.getParameter('promotionId');
                    return LoyaltyPointsRedemptionModel.removePromotion(promoid);
                } else if (action == 'getConfigurations'){
                    var website = this.request.getParameter('website');
                    return LoyaltyPointsRedemptionModel.getAnnexConfigurations(website);
                }
            },

            post: function post() {
                var requestPayload = this.data.requestPayload;
                var token = this.data.token;
                return LoyaltyPointsRedemptionModel.debitRedeemedPoints(requestPayload, token);
            },

            put: function put() {
                // not implemented
            },

            delete: function() {
                // not implemented
            }
        });
    });
