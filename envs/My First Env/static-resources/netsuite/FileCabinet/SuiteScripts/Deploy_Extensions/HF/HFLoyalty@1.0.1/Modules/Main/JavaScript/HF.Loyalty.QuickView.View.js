// @module HF.Loyalty
define('HF.Loyalty.QuickView.View'
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
        this.PDP           = this.application.getComponent('PDP');
        this.PDP.on('afterOptionSelection', function () {
          self.render();
        });

        self.profile = {};
        PROFILE.getUserProfile().then(function (data) {
          self.profile = data;
          self.render();
        });
      },

      //@method getContext @return HF.Loyalty.Main.View.Context
      getContext: function getContext() {
        var itemModel   = this.contextData.item();
        var matrixChild = this.PDP.getSelectedMatrixChilds();
        this.total      = itemModel.onlinecustomerprice_detail && itemModel.onlinecustomerprice_detail.onlinecustomerprice || 0;
        if (matrixChild.length == 1) {
          this.total = matrixChild[0].onlinecustomerprice_detail.onlinecustomerprice;
        }
        var pointsEarned = Helpers.getEarnedPointsData(this.loyaltyConfig, this.total);
        //console.log(pointsEarned, matrixChild);
        return {
          pointsMessage: pointsEarned.message,
          earnedPoints : pointsEarned.pointsEarned > 0,
          isLoggedIn   : this.profile.isloggedin
        };
      }
    });
  })
;
