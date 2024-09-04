/*
 © 2021 Trevera
 Loads layout modifications

 */

define('HF.CreditLock.Extension'
  , [
    'underscore'
  ]
  , function (
    _
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var ENVIRONMENT = container.getComponent('Environment'),
            LAYOUT      = container.getComponent('Layout'),
            PROFILE     = container.getComponent('UserProfile'),
            CHECKOUT    = container.getComponent('Checkout');

        var config = ENVIRONMENT.getConfig('trevera.creditLock');

        if (config.enabled) {
          var profile_model;
          PROFILE.getUserProfile().then(function (profile) { profile_model = profile; });

          if (LAYOUT) {
            LAYOUT.addToViewContextDefinition(
              'Header.MiniCart.View'
              , 'canCheckout'
              , 'boolean'
              , function canCheckout(context) {
                var customFields = profile_model && profile_model.customfields;
                var lockedField  = _.find(customFields, { id: config.fieldId });
                if (lockedField) {
                  return !lockedField.value;
                }
                return true
              }
            );

            LAYOUT.addToViewContextDefinition(
              'Cart.Summary.View'
              , 'treveraExtras'
              , 'object'
              , function treveraExtras(context) {
                var customFields = profile_model && profile_model.customfields;
                var isLocked     = _.find(customFields, { id: config.fieldId });
                if (isLocked) {
                  return {
                    creditLocked : isLocked.value,
                    creditMessage: config.message
                  }
                }
                return {
                  creditLocked : false,
                  creditMessage: ''
                }
              }
            );

            if (CHECKOUT) {
              try {
                LAYOUT.addToViewContextDefinition(
                  'OrderWizard.Step'
                  , 'treveraExtras'
                  , 'object'
                  , function treveraExtras(context) {
                    var customFields = profile_model && profile_model.customfields;
                    var isLocked     = _.find(customFields, { id: config.fieldId }); //'custentity_hf_customer_credit_locked'
                    if (isLocked) {
                      return {
                        creditLocked : isLocked.value,
                        creditMessage: config.message
                      }
                    }
                    return {
                      creditLocked : false,
                      creditMessage: ''
                    }
                  }
                );
              } catch (e) {
                console.log('checkout returned something but it\'s not actually checkout ', e)
              }
            }
          }
        }
      }
    }
  });
