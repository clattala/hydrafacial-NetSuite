define('HF.AgreeTerms.Main'
  , [
    'HF.OrderWizard.Module.AgreeTerms',
    'underscore'
  ]
  , function (
    CustomWizardModule
    , _
  ) {
    'use strict';

    function addModuleToCheckout(container) {
      var CHECKOUT = container.getComponent('Checkout');

      if (CHECKOUT) {
        CHECKOUT.addModuleToStep({
          step_url: 'review',
          module  : {
            id       : 'hf_agree_terms_module',
            index    : 10,
            classname: 'HF.OrderWizard.Module.AgreeTerms'
          }
        });
        CHECKOUT.addModuleToStep({
          step_url: 'review',
          module  : {
            id       : 'hf_agree_terms_module',
            index    : 12,
            classname: 'HF.OrderWizard.Module.AgreeTerms',
            options: {
              container: '#wizard-step-content-right'
            }
          }
        });
        CHECKOUT.addModuleToStep({
          step_url: 'opc',
          module  : {
            id       : 'hf_agree_terms_module',
            index    : 15,
            classname: 'HF.OrderWizard.Module.AgreeTerms'
          }
        });
        CHECKOUT.addModuleToStep({
          step_url: 'opc',
          module  : {
            id       : 'hf_agree_terms_module',
            index    : 14,
            classname: 'HF.OrderWizard.Module.AgreeTerms',
            options: {
              container: '#wizard-step-content-right'
            }
          }
        });
        CHECKOUT.addModuleToStep({
          step_url: 'billing',
          module  : {
            id       : 'hf_agree_terms_module',
            index    : 3,
            classname: 'HF.OrderWizard.Module.AgreeTerms'
          }
        });
      }
    }

    return {
      mountToApp: function mountToApp(container) {
        var ENVIRONMENT     = container.getComponent('Environment')
          , extensionConfig = ENVIRONMENT.getConfig('hf.agreeTerms') || { enabled: true, bodyField: 'custbody_hf_purchagreeacceptance', labelHtml: 'Agree to the terms' }

        if (extensionConfig.enabled) {
          addModuleToCheckout(container);
        }
      }
    }
  });
