define('RemoveCreditCard.Main'
  , [
    'underscore'
  ]
  , function (
    _
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        /**
         * Remove credit card as a payment option in checkout.
         * (Note terms are required for all customers if this module is enabled or checkout will fail.)
         */
        try {
          var OrderWizardModulePaymentMethodSelector = require('OrderWizard.Module.PaymentMethod.Selector');
          if(OrderWizardModulePaymentMethodSelector.OrderWizardModulePaymentMethodSelector) OrderWizardModulePaymentMethodSelector = OrderWizardModulePaymentMethodSelector.OrderWizardModulePaymentMethodSelector
          _.extend(OrderWizardModulePaymentMethodSelector.prototype, {
            initialize: _.wrap(OrderWizardModulePaymentMethodSelector.prototype.initialize, function (fn, options) {
              fn.apply(this, _.toArray(arguments).slice(1));
              this.modules = _.reject(this.modules, function (module) { return module.type === 'creditcard' });
            }),

            renderModule: _.wrap(OrderWizardModulePaymentMethodSelector.prototype.renderModule, function (fn, module) {
              module.instance.isReady = false;
              if (module.type === 'creditcard') {
                return;
              }
              fn.apply(this, _.toArray(arguments).slice(1));
            })
          })

        } catch (e) {
          console.warn('problem extending order wizard', e)
        }
      }
    };
  });
