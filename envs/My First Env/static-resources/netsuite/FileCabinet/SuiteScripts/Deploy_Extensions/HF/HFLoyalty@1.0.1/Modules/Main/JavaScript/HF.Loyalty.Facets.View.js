// @module HF.Loyalty
define('HF.Loyalty.Facets.View'
  , [
    'hf_loyalty_points.tpl',
    'HF.Loyalty.Main.SS2Model',
    'HF.Loyalty.Helpers',
    'Backbone',
    'underscore'
  ]
  , function (
    hf_points_tpl,
    LoyaltyConfigModel,
    Helpers,
    Backbone,
    _
  ) {
    'use strict';

    // @class HF.Loyalty.Main.View @extends Backbone.View
    return Backbone.View.extend({

      template: hf_points_tpl,

      contextDataRequest: ['item'],

      initialize: function (options) {
        var self           = this;
        var PROFILE        = options.application.getComponent('UserProfile');
        this.loyaltyConfig = options.loyaltyConfig;
        this.application   = options.application;
        this.PLP           = this.application.getComponent('PLP');

        self.profile = {};
        PROFILE.getUserProfile().then(function (data) {
          self.profile = data;
          self.render();
        });
      },

      //@method getContext @return HF.Loyalty.Facets.View.Context
      getContext: function getContext() {
        var itemModel        = this.contextData.item();
        var includeInLoyalty = itemModel.custitem_hf_applicable_loyalty;
        this.total           = itemModel.onlinecustomerprice_detail && itemModel.onlinecustomerprice_detail.onlinecustomerprice || 0;
        var pointsEarned     = Helpers.getEarnedPointsData(this.loyaltyConfig, this.total)
        //console.log(pointsEarned);

        if (!includeInLoyalty) {
          return {
            pointsMessage: '',
            earnedPoints : 0,
            isLoggedIn   : this.profile.isloggedin
          }
        }
        return {
          pointsMessage: pointsEarned.message,
          earnedPoints : pointsEarned.pointsEarned > 0,
          isLoggedIn   : this.profile.isloggedin
        };
      }
    });
  })
;
