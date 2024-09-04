/*
 © 2021 Trevera
 Loads layout modifications

 */

define('Trevera.Layout.Checkout.Extension'
  , [
    'Trevera.Layout.Header'
    , 'Trevera.NamedAnchors.Extension'
    , 'underscore'
    , 'jQuery'
  ]
  , function (
    LayoutHeader
    , TreveraNamedAnchorsExtension
    , _
    , jQuery
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var ENVIRONMENT = container.getComponent('Environment')
          , LAYOUT      = container.getComponent('Layout')
          , PROFILE     = container.getComponent('UserProfile');

        var profile_model;
        PROFILE.getUserProfile().then(function (profile) {
          profile_model = profile;
        });

        LayoutHeader.mountToApp(container);
        TreveraNamedAnchorsExtension.mountToApp(container);

        if (LAYOUT) {
          LAYOUT.addToViewContextDefinition(
            'Footer.View'
            , 'footerLogo'
            , 'string'
            , function footerLogo(context) {
              return ENVIRONMENT.getConfig('trevera.footer.logoUrl');
            }
          );

          LAYOUT.addToViewContextDefinition(
            'Header.MiniCart.View'
            , 'canCheckout'
            , 'boolean'
            , function canCheckout(context) {
              var customFields = profile_model && profile_model.customfields;
              var lockedField  = _.find(customFields, {id: 'custentity_hf_customer_credit_locked'});
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
              var isLocked     = _.find(customFields, {id: 'custentity_hf_customer_credit_locked'});
              if (isLocked) {
                return {
                  creditLocked : isLocked.value,
                  creditMessage: ENVIRONMENT.getConfig('trevera.creditLock.message')
                }
              }
              return {
                creditLocked : false,
                creditMessage: ''
              }
            }
          );

          LAYOUT.addToViewContextDefinition(
            'OrderWizard.Step'
            , 'treveraExtras'
            , 'object'
            , function treveraExtras(context) {
              var customFields = profile_model && profile_model.customfields;
              var isLocked     = _.find(customFields, {id: 'custentity_hf_customer_credit_locked'});
              if (isLocked) {
                return {
                  creditLocked : isLocked.value,
                  creditMessage: ENVIRONMENT.getConfig('trevera.creditLock.message')
                }
              }
              return {
                creditLocked : false,
                creditMessage: ''
              }
            }
          );
        }
      }
    }
  });
