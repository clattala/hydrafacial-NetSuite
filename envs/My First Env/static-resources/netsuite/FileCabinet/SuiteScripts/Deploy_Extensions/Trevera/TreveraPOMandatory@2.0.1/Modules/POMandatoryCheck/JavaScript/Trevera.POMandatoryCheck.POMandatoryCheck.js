define(
  'Trevera.POMandatoryCheck.POMandatoryCheck'
  , [
    'Trevera.OrderWizard.Module.PaymentMethod.PurchaseNumber'
    , 'underscore'
  ]
  , function (
    TreveraOrderWizardModulePaymentMethodPurchaseNumber
    , _
  ) {
    'use strict';

    function addPORequirementsToModule(container) {
      var CHECKOUT        = container.getComponent('Checkout');

      if (CHECKOUT) {
        try {
          CHECKOUT.removeModuleFromStep({'step_url': 'billing', 'module_id': 'order_wizard_paymentmethod_purchasenumber_module'});
          CHECKOUT.removeModuleFromStep({'step_url': 'billing', 'module_id': 'trv__purchasenumber_module'});
          CHECKOUT.removeModuleFromStep({'step_url': 'review', 'module_id': 'order_wizard_paymentmethod_purchasenumber_module'});
          CHECKOUT.removeModuleFromStep({'step_url': 'review', 'module_id': 'trv__purchasenumber_module'});
          CHECKOUT.removeModuleFromStep({'step_url': 'opc', 'module_id': 'order_wizard_paymentmethod_purchasenumber_module'});
          CHECKOUT.removeModuleFromStep({'step_url': 'opc', 'module_id': 'trv__purchasenumber_module'});
        } catch(e) {
          console.log('error removing steps', e)
        }

        CHECKOUT.addModuleToStep({
          step_url: 'review',
          module  : {
            id         : 'trv__purchasenumber_module'
            , index    : 5
            , classname: 'Trevera.OrderWizard.Module.PaymentMethod.PurchaseNumber'
          }
        });
        CHECKOUT.addModuleToStep({
          step_url: 'opc'
          , module: {
            id         : 'trv__purchasenumber_module'
            , index    : 8
            , classname: 'Trevera.OrderWizard.Module.PaymentMethod.PurchaseNumber'
          }
        });
        CHECKOUT.addModuleToStep({
          step_url: 'billing'
          , module: {
            id         : 'trv__purchasenumber_module'
            , index    : 3
            , classname: 'Trevera.OrderWizard.Module.PaymentMethod.PurchaseNumber'
          }
        });
      }
    }

    return {
      mountToApp: function mountToApp(container) {
        var ENVIRONMENT     = container.getComponent('Environment')
          , extensionConfig = ENVIRONMENT.getConfig('trv.poRequired') || {}

        if (true || extensionConfig.enabled) {
          addPORequirementsToModule(container);
        }
      }
    }
  });
