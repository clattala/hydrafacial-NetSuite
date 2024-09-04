define('Trevera.OrderWizard.Module.PaymentMethod.PurchaseNumber'
  , [
    'Wizard.Module'

    , 'trv_order_wizard_paymentmethod_purchasenumber_module.tpl'

    , 'Backbone'
    , 'Backbone.CompositeView'
    , 'underscore'
    , 'Utils'
    , 'jQuery'
  ]
  , function (
    WizardModule
    , trv_order_wizard_paymentmethod_purchasenumber_module_tpl
    , Backbone
    , BackboneCompositeView
    , _
    , Utils
    , jQuery
  ) {
    'use strict';

    return WizardModule.extend({

      template: trv_order_wizard_paymentmethod_purchasenumber_module_tpl,

      className: 'OrderWizard.Module.PaymentMethod.PurchaseNumber.Custom',

      //@property {Object} attributes
      attributes: {
        'id'     : 'order-wizard-layout-custom'
        , 'class': 'order-wizard-layout-custom'
      },

      errors: [
        'ERR_PO_REQUIRED'
      ],

      poRequiredMessage: {
        errorCode   : 'ERR_PO_REQUIRED',
        errorMessage: Utils.translate('PO Number is Required')
      },

      initialize: function (options) {
        var self = this;
        WizardModule.prototype.initialize.apply(this, arguments);
        this.application   = this.wizard.application;
        this.wizard.model.on('change', this.render, this);
        this.wizard.model.on('change:paymentmethods', this.render, this);
        this.CART = this.application.getComponent('Cart');
        this.CART.cancelableOn('afterAddPayment', function (data) {
          self.render();
        })

        var paymentMethod = this.wizard.model.get('paymentmethods');
        if (paymentMethod && paymentMethod.length === 1) { this.selectedPaymentMethod = paymentMethod.models[0].get('type')}
        this.wizard.on('paymentMethod:changed', function (data) {
          console.log('paymentMethod:changed', data);
          self.selectedPaymentMethod = data.toLowerCase();
          setTimeout(function ( ) {
            self.render();
          }, 10)

        });

      },

      isActive: function () {
        return this.wizard.application.getComponent('Environment').getConfig('siteSettings.checkout.showpofieldonpayment', 'T') === 'T';
      },

      submit: function () {
        //var purchase_order_number = this.$('[name=purchase-order-number]').val() || '';
        //this.wizard.model.set('purchasenumber', purchase_order_number);
        return this.isValid();
      },

      isValid: function () {
        var purchase_order_number = this.$('[name="purchase-order-number"]').val() || this.wizard.model.get('purchasenumber');
        this.wizard.model.set('purchasenumber', purchase_order_number);
        var paymentMethod = this.wizard.model.get('paymentmethods');
        if (paymentMethod && paymentMethod.length === 1) {
          if (paymentMethod.models[0].get('type') === 'invoice') {
            if (purchase_order_number.length < 1) {
              return jQuery.Deferred().reject(this.poRequiredMessage);
            }
          }
        }
        return jQuery.Deferred().resolve();
      },

      getContext: function () {
        console.log('selectedPaymentMethod', this.selectedPaymentMethod, this.selectedPaymentMethod === 'invoice');
        return {
          purchasenumber: this.wizard.model.get('purchasenumber'),
          isRequired    : this.selectedPaymentMethod === 'invoice'
        }
      }
    })
  });
