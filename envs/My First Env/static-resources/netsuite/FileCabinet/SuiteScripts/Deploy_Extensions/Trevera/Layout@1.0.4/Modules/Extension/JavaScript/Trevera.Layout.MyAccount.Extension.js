/*
 © 2021 Trevera
 Loads layout modifications
 */

define(
  'Trevera.Layout.MyAccount.Extension'
  , [
    'Trevera.Layout.Header'
    , 'Trevera.NamedAnchors.Extension'
    , 'Trevera.AddressHelpers'
    , 'Trevera.MultiSite.Helpers'
    , 'underscore'
    , 'jQuery'
  ]
  , function (
    LayoutHeader
    , TreveraNamedAnchorsExtension
    , AddressHelpers
    , MultiSiteHelpers
    , _
    , jQuery
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var ENVIRONMENT = container.getComponent('Environment');
        var PROFILE     = container.getComponent('UserProfile');
        var LAYOUT      = container.getComponent('Layout');

        LayoutHeader.mountToApp(container);
        TreveraNamedAnchorsExtension.mountToApp(container);
        AddressHelpers.mountToApp(container);
        //MultiSiteHelpers.mountToApp(container);

        var profile_model;
        PROFILE.getUserProfile().done(function (profile) {
          profile_model = profile;
          if (!profile_model.internalid) {
            SC.PROFILE_PROMISE.done(function (data) {
              profile_model = data;
              console.log(data)
            });
          }
        });

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
              var lockedField  = _.find(customFields, { id: 'custentity_hf_customer_credit_locked' });
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
              var isLocked     = _.find(customFields, { id: 'custentity_hf_customer_credit_locked' });
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
