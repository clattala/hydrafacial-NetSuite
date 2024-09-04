// @module HF.Loyalty
define('HF.Loyalty.PDP.View'
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

        this.PDP.on('afterQuantityChange', function () {
          self.render()
        })

        self.profile = {};
        PROFILE.getUserProfile().then(function (data) {
          self.profile = data;
          self.render();
        });
      },

      //@method getContext @return HF.Loyalty.Main.View.Context
      getContext: function getContext() {
        var itemModel        = this.contextData.item();
        var matrixChild      = this.PDP.getSelectedMatrixChilds();
        var includeInLoyalty = itemModel.custitem_hf_applicable_loyalty;
        this.total           = this.PDP.getPrice().price;
        var pointsEarned     = Helpers.getEarnedPointsData(this.loyaltyConfig, this.total);
        //console.log(pointsEarned, matrixChild);
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
