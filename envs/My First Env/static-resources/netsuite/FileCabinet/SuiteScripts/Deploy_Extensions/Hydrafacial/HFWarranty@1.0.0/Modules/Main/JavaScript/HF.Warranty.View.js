// @module HF.Warranty.View
define('HF.Warranty.View'
  , [
    'hf_warranty_dashboard.tpl',
    'HF.Warranty.SS2Model',
    'Backbone',
    'underscore'
  ]
  , function (
    main_tpl,
    SS2Model,
    Backbone,
    _
  ) {
    'use strict';

    // @class HF.Warranty.View.View @extends Backbone.View
    return Backbone.View.extend({

      template: main_tpl

      , initialize: function (options) {
        var self         = this;
        var PROFILE      = options.application.getComponent('UserProfile');
        var LAYOUT       = options.application.getComponent('Layout');
        this.ENVIRONMENT = options.application.getComponent('Environment');
        this.config      = this.ENVIRONMENT.getConfig('hf.warranty');
        this.model       = new SS2Model();
        this.profile;
        this.isLoading = true;

        PROFILE.getUserProfile().then(function (data) {
          self.profile = data;
          self.model.fetch({ data: { customerId: self.profile.internalid } }).done(function (data) {
            self.model.set('warranties', data.records);
            LAYOUT.cancelableTrigger('hfWarranty:DataLoaded');
            self.render();
          })
        });
      },

      //@method getContext @return HF.Warranty.View.View.Context
      getContext: function getContext() {
        return {
          showWarranties: this.model.get('warranties') && this.model.get('warranties').length > 0,
          warranties    : this.model.get('warranties'),
          copyHeader    : this.config.copyHeader,
          copyFooter    : this.config.copyFooter
        };
      }
    });
  });
