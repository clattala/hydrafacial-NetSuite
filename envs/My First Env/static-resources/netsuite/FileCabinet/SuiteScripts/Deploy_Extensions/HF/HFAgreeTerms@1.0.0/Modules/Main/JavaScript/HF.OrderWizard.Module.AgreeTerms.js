define('HF.OrderWizard.Module.AgreeTerms'
  , [
    'Wizard.Module',
    'hf_order_wizard_agree_terms.tpl',
    'underscore',
    'Utils',
    'jQuery'
  ]
  , function (
    WizardModule,
    module_tpl,
    _,
    Utils,
    jQuery
  ) {
    'use strict';

    return WizardModule.extend({

      template: module_tpl,

      className: 'HF.OrderWizard.Module.AgreeTerms',

      //@property {Object} attributes
      attributes: {
        'id'     : 'order_wizard_hf_agree_terms'
        , 'class': 'order-wizard--hf-agree-terms'
      },

      errors: [
        'ERR_AGREE_TERMS_REQUIRED'
      ],

      termsRequiredMessage: {
        errorCode   : 'ERR_AGREE_TERMS_REQUIRED',
        errorMessage: Utils.translate('You must agree to the terms and conditions in order to place your order.')
      },

      events: {
        'change [data-action="validate-checked"]': 'validateChecked'
      },

      initialize: function (options) {
        WizardModule.prototype.initialize.apply(this, arguments);
        this.application = this.wizard.application;
        this.CART        = this.application.getComponent('Cart');
        this.ENVIRONMENT = this.application.getComponent('Environment');
        this.config      = this.ENVIRONMENT.getConfig('hf.agreeTerms');

        this.CART.on('beforeSubmit', function (data) {
          // check if checked
        })
      },

      isActive: function () {
        return this.wizard.application.getComponent('Environment').getConfig('hf.agreeTerms.enabled', false);
      },

      submit: function () {
        return this.isValid();
      },

      validateChecked: function validateChecked(evt) {
        var self  = this;
        var $elem = jQuery(evt.currentTarget);
        jQuery('#order_wizard_hf_agree_terms [data-type="alert-placeholder-module"]').empty();
        if ($elem.is(':checked')) {
          this.CART.setTransactionBodyField({
            fieldId: this.config.bodyField,
            type   : 'boolean',
            value  : true
          }).then(function (data) {
            jQuery('[data-action="validate-checked"]').prop('checked', true);
          }).fail(function (error) {
            console.log('setTransactionBodyField failed.', error);
            jQuery('[data-action="validate-checked"]').prop('checked', false);
            self.manageError({
              errorCode   : 'ERR_UNKNOWN',
              errorMessage: Utils.translate('There was a problem agreeing to the terms. Please try again.')
            });
          });
        } else {
          this.CART.setTransactionBodyField({
            fieldId: this.config.bodyField,
            type   : 'boolean',
            value  : false
          }).then(function (data) {
            jQuery('[data-action="validate-checked"]').prop('checked', false);
            self.manageError(self.termsRequiredMessage);
          }).fail(function (error) {
            console.log('setTransactionBodyField failed.', error);
            jQuery('[data-action="validate-checked"]').prop('checked', true)
          });
        }

      },

      isValid: function () {
        var options     = this.wizard.model.get('options');
        var termsOption = options[this.config.bodyField];
        if (termsOption == 'T') return jQuery.Deferred().resolve();
        return jQuery.Deferred().reject(this.termsRequiredMessage);
      },

      getContext: function () {
        console.log('options', this.wizard.model.get('options'), this.config);
        return {
          isChecked: this.wizard.model.get('options')[this.config.bodyField] == 'T',
          label    : this.config.label
        }
      }
    })
  });
