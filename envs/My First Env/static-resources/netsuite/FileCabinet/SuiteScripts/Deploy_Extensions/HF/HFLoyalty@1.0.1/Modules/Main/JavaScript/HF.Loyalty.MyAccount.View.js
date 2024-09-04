// @module HF.AnnexCloud
define('HF.Loyalty.MyAccount.View'
  , [
    'hf_myaccount_points.tpl',
    'HF.Loyalty.Main.SS2Model',
    'HF.Loyalty.History.SS2Model',
    'Utils',
    'Backbone'
  ]
  , function (
    hf_main_tpl,
    LoyaltyConfigModel,
    LoyaltyHistoryModel,
    Utils,
    Backbone
  ) {
    'use strict';

    // @class HF.Loyalty.Main.View @extends Backbone.View
    return Backbone.View.extend({

      template: hf_main_tpl,

      events: {},

      bindings: {},

      childViews: {},

      tabs: [
        {name: Utils.translate('Benefits'), id: 'benefits'},
        {name: Utils.translate('Activity'), id: 'activity'}
      ],

      initialize: function (options) {
        var self         = this;
        var PROFILE      = options.application.getComponent('UserProfile');
        var LAYOUT       = options.application.getComponent('Layout');
        this.ENVIRONMENT = options.application.getComponent('Environment');
        this.profile;
        this.isLoading = true;

        PROFILE.getUserProfile().then(function (data) {
          self.profile = data;
          LAYOUT.cancelableTrigger('profileComponent:DataLoaded');
          self.render();
        });

        this.loyaltyConfig  = new LoyaltyConfigModel();
        this.loyaltyHistory = new LoyaltyHistoryModel();

        this.loyaltyConfig.fetch({data: {action: 'getUserPoints'}}).done(function (data) {
          self.loyaltyConfig.set(data);
          console.log('loyalty config fetched getUserPoints', data);
          self.isLoading = false;
          self.render();
        });

        this.loyaltyHistory.fetch({data: {}}).done(function (data) {
          self.loyaltyHistory.set(data);
          console.log('loyalty history fetched', data);
          self.render();
        });
      },


      //@method getContext @return HF.Loyalty.Main.View.Context
      getContext: function getContext() {
        return {
          tabs         : this.tabs,
          isLoading    : this.isLoading,
          isOptedIn    : this.loyaltyConfig.get('optedIn'),
          benefitsImage: this.ENVIRONMENT.getConfig('hf.loyalty.benefitsImage') ? this.ENVIRONMENT.getConfig('hf.loyalty.benefitsImage') : '/site/images/loyalty-my-account.png',
          companyName  : this.profile && this.profile.companyname || '',
          tierName     : this.loyaltyConfig && this.loyaltyConfig.get('tierConfig') && this.loyaltyConfig.get('tierConfig').tierName || '',
          pointsBalance: this.loyaltyConfig.get('pointsBalance'),
          activity     : this.loyaltyHistory.get('records') || []
        };
      }
    });
  })
;
