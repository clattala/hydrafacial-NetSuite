define('TreveraPromotions.ServiceController', [
  'TreveraPromotions.Model',
  'ServiceController'
], function TrvPromotions(
  TreveraPromotionsModel,
  ServiceController
) {
  'use strict';

  return ServiceController.extend({
    name: 'Trevera.Promotions.ServiceController',

    options: {
      common: {
        requireLogin : false,
        requireSecure: false
      }
    },

    get: function () {
      var action = this.request.getParameter('action');
      var promo_code = this.request.getParameter('promo_code');
      var promo_codes = this.request.getParameter('promo_codes');

      nlapiLogExecution('DEBUG', 'action', action);

      if(action && action === 'autoapply') {
        return this.checkForAutoApplyPromotions();
      }
      else if(promo_code && promo_code.length > 0) {
        return this.isPromotionCustom()
      }
      else if(promo_codes && promo_codes.length > 0) {
        return this.listPromotions()
      }
      else {
        return {}
      }
    },

    post: function () {
      var data     = JSON.parse(this.request.getBody());
      nlapiLogExecution('DEBUG', 'data', JSON.stringify(data));
      var responseObj    = TreveraPromotionsModel.addPromotion(data);
      if (!responseObj.success) {
        return {
          success: false,
          message: responseObj.message
        };
      }
      return responseObj;
    },

    checkForAutoApplyPromotions: function () {
      var response    = TreveraPromotionsModel.checkForAutoApplyPromotions();
      if (!response.success) {
        return {
          success: false,
          message: response.message
        };
      }
      return response;
    },

    isPromotionCustom: function () {
      return TreveraPromotionsModel.checkForAutoApplyPromotions(this.request.getParameter('promo_code'));
    },

    listPromotions: function () {
      return TreveraPromotionsModel.listPromotions(this.request.getParameter('promo_codes'));
    }
  });
});

