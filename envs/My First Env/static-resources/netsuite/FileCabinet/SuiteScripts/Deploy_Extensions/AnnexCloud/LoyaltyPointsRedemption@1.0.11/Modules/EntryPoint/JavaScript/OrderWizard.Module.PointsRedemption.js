define('OrderWizard.Module.PointsRedemption'
  , [
    'AnnexCloud.LoyaltyPointsRedemption.EntryPoint.Model',
    'JWT.Helper',
    'Wizard.Module',
    'GlobalViews.Message.View',
    'Backbone.View.Plugins',
    'annexcloud_loyaltypointsredemption_entrypoint.tpl',
    'jQuery',
    'Utils',
    'underscore'
  ]
  , function (
    LoyaltyPointsRedemptionModel,
    JWTHelper,
    WizardModule,
    GlobalViewsMessageViews,
    BackboneViewPlugins,
    annexcloud_loyaltypointsredemption_entrypoint,
    jQuery,
    Utils,
    _
  ) {
    'use strict';

    return WizardModule.extend({

      template: annexcloud_loyaltypointsredemption_entrypoint,

      className: 'OrderWizard.Module.PointsRedemption',

      events: {
        'submit form[data-action="redeem-points"]': 'redeemPoints'
      },

      initialize: function () {
        WizardModule.prototype.initialize.apply(this, arguments);

        this.application = this.wizard.application;

        var self = this;

        var loyaltyPointRedemptionModel = new LoyaltyPointsRedemptionModel();

        var website = SC.ENVIRONMENT.siteSettings.id;
        loyaltyPointRedemptionModel.fetch({
          data: {
            action : 'getConfigurations',
            website: website
          }
        }).then(function (result) {
          if (result.status == 'OK' && result.response) {
            self.configuration = result.response.configuration;

            var userProfile = self.application.getComponent('UserProfile');
            userProfile.getUserProfile().then(function (profile) {
              self.profile = profile;
              self.getUserPoints();
            });

          }
        });

        self.model = new LoyaltyPointsRedemptionModel();

        self.orderModel = self.wizard.model;

        self.addCartListeners();
        self.initializeCurrentState();

      },

      isActive: function () {
        return true;
      },

      submit: function () {
        return this.isValid();
      },

      childViews: {
        GlobalsViewErrorMessage: function () {
          var placeholder         = jQuery('[data-type="pointsredemption-error-placeholder"]');
          //console.log(this.currentState.errorMessage);
          var global_view_message = new GlobalViewsMessageViews({
            message : this.currentState.errorMessage,
            type    : 'error',
            closable: true
          });

          placeholder.html(global_view_message.render().$el.html());

        }
      },

      addCartListeners: function addCartListeners() {
        var self           = this;
        this.cartComponent = this.application.getComponent('Cart');

        this.cartComponent.on('afterAddPromotion', function () {
          self.cartComponent.getPromotions().then(function (promotions) {
            self.promotions = promotions;
          });
        })

        this.cartComponent.on('afterRemovePromotion', function (data) {
          var removedPromotion   = _.findWhere(self.promotions, {internalid: data.internalid});
          var removedPromotionId = removedPromotion && removedPromotion.extras
            && removedPromotion.extras.promocodeid;

          if (self.isLoyaltyPromotion(removedPromotion)) {
            self.currentState = {};

            var cartOptions = self.orderModel.get('options');
            _.extend(cartOptions, {
              custbody_loyalty_points_red_code    : "",
              custbody_loyalty_points_red_code_id : "",
              custbody_loyalty_points_red_redeemed: ""
            })
            self.orderModel.set('options', cartOptions);
            self.orderModel.save();

            //Delete promotion from backend
            self.model.fetch({
              data: {
                action     : 'removePromotion',
                promotionId: removedPromotionId
              }
            }).then(function (response) {
              if (response.status == "OK") {
                console.log('Promotion removed');
              }
              else {
                console.log('Error removing promotion');
              }
            })

            self.render();
          }

          self.cartComponent.getPromotions().then(function (promotions) {
            self.promotions = promotions;
          });
        })

        this.cartComponent.on('beforeSubmit', function () {
          self.orderModel = Utils.deepCopy(self.wizard.model);
        })

        this.cartComponent.on('afterSubmit', function (confirmation) {
          self.debitUserPoints(confirmation);
        })
      },

      initializeCurrentState: function initializeCurrentState() {
        var self             = this;
        var options          = this.orderModel.get('options');
        var redemptioncode   = options['custbody_loyalty_points_red_code'];
        var redemptioncodeid = options['custbody_loyalty_points_red_code_id'];
        var pointsredeemed   = options['custbody_loyalty_points_red_redeemed'];

        this.currentState = {
          errorMessage  : null,
          isSaving      : false,
          points        : Number(pointsredeemed),
          code          : redemptioncode,
          codeid        : redemptioncodeid,
          pointsredeemed: Number(pointsredeemed)
        }

        this.cartComponent.getPromotions().then(function (promotions) {
          self.promotions = promotions;
        });
      },

      isLoyaltyPromotion: function isLoyaltyPromotion(promotion) {
        return promotion.extras && promotion.extras.promocodeid == this.currentState.codeid &&
          promotion.code == this.currentState.code;
      },

      getUserPoints: function getUserPoints() {
        var self        = this;
        var userEmail   = this.profile.email;
        var requestData = {
          email: userEmail
        }

        var token = JWTHelper.generateJWT(userEmail, self.configuration);

        this.model.fetch({
          data: {
            action        : 'getUserPoints',
            requestPayload: JSON.stringify(requestData),
            token         : token
          }
        }).then(function (result) {
          var response = result.response;
          if (result.status == "OK" && !response.hasOwnProperty('errorCode')) {
            self.userPointsConfig = response;
            self.render();
          }
          else {
            console.log('Error connecting to Annex Cloud to retrieve user points.')
          }
        })
      },

      redeemPoints: function (e) {
        e.preventDefault();
        e.stopPropagation();

        var self    = this;
        var $target = this.$(e.target);
        var options = $target.serializeObject();
        console.log(options.points);
        console.log(this.userPointsConfig['availablePoints']);
        if (!options.points) {
          this.currentState.errorMessage = Utils.translate('Points are required');
          this.render();
        }
        else if (parseFloat(options.points) > parseFloat(this.userPointsConfig['availablePoints'])) {
          this.currentState.errorMessage = Utils.translate('You cannot redeem more points than your maximum available points.');
          this.render();
        }
        else {
          var discount       = parseFloat(options.points) * (parseFloat(self.configuration.ratio));
          discount           = Math.abs(Number(discount.toFixed(2)));
          var orderSummary   = this.orderModel.get('summary');
          var orderSubtotal  = orderSummary.subtotal;
          var orderDiscounts = orderSummary.discounttotal;

          if (discount > orderSubtotal - orderDiscounts) {
            this.currentState.errorMessage = Utils.translate('Redeemed value cannot be bigger than order value. Please redeem a smaller amount of points.');
            this.render();
          }
          else {
            this.currentState.points       = Number(options.points);
            this.currentState.errorMessage = null;
            this.currentState.isSaving     = true;

            this.model.fetch({
              data: {
                action  : 'getPromotionCode',
                discount: discount
              }
            }).then(function (result) {
              var response = result.response;
              if (result.status == "OK") {
                self.cartComponent.addPromotion({
                  promocode: response.promotioncode
                }).then(function (result) {
                  self.currentState = {
                    code          : response.promotioncode,
                    codeid        : response.promotionid,
                    pointsredeemed: Number(options.points)
                  }

                  var cartOptions = self.orderModel.get('options');
                  _.extend(cartOptions, {
                    custbody_loyalty_points_red_code    : response.promotioncode,
                    custbody_loyalty_points_red_code_id : response.promotionid,
                    custbody_loyalty_points_red_redeemed: options.points
                  })

                  self.orderModel.set('options', cartOptions);
                  self.orderModel.save();
                  self.render();
                });
              }
              else {
                self.currentState.errorMessage = Utils.translate('An error occurred while redeeming points.' + JSON.stringify(response))
              }
            }).always(function savePromocodeEnded() {
              self.currentState.isSaving = false;
              self.currentState.points   = 0;

              self.render();
            });

            this.render();
          }
        }
      },

      debitUserPoints: function debitUserPoints(model) {
        var self             = this;
        var userEmail        = this.profile.email;
        var orderid          = model.confirmation.tranid;
        var options          = self.orderModel.options;
        var redemptioncode   = options['custbody_loyalty_points_red_code'];
        var redemptioncodeid = options['custbody_loyalty_points_red_code_id'];
        var pointsredeemed   = options['custbody_loyalty_points_red_redeemed'];
        //console.log(redemptioncode);
//console.log(redemptioncodeid);
//console.log(pointsredeemed);
        if (redemptioncode && redemptioncodeid && pointsredeemed) {
          var requestData = {
            "id"      : userEmail,
            "actionId": "107",
            "activity": "DEBIT",
            "orderid" : orderid,
            "debit"   : pointsredeemed.toString(),
            "reason"  : "Points redeemed at checkout",
            "source"  : "Web"
          };

          var token = JWTHelper.generateJWT(requestData, self.configuration);

          this.model.set('action', 'debitRedeemedPoints');
          this.model.set('requestPayload', JSON.stringify(requestData));
          this.model.set('token', token);

          this.model.save();
        }
      },

      showModule: function () {
        return this.userPointsConfig && this.userPointsConfig['availablePoints'] > 0;
      },

      getUserPointsFields: function () {
        var ret = {};

        if (this.userPointsConfig) {
          var totalPoints = Number(this.userPointsConfig['availablePoints']);
          var discount    = totalPoints * Number(this.configuration.ratio);
          ret             = {
            totalPoints: totalPoints.toFixed(2),
            maxDiscount: Utils.formatCurrency(discount)
          }
        }

        return ret;
      },

      getContext: function () {

        return {
          showModule      : this.showModule(),
          userPointsFields: this.getUserPointsFields(),
          showErrorMessage: !!this.currentState.errorMessage,
          isSaving        : this.currentState.isSaving,
          points          : this.currentState.points && this.currentState.points.toFixed(2) || 0,
          discountapplied : !!this.currentState.code,
          pointsredeemed  : this.currentState.pointsredeemed && this.currentState.pointsredeemed.toFixed(2) || 0,
          pointsleft      : this.userPointsConfig ? (this.userPointsConfig['availablePoints'] - this.currentState.pointsredeemed).toFixed(2) : 0
        }
      }
    });
  });
