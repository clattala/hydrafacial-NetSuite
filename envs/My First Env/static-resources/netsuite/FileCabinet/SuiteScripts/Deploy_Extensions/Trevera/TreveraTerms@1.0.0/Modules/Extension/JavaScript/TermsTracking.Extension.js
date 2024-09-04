define('TermsTracking.Extension'
  , [
    'TermsTracking.Extension.View',
    'Hydrafacial.ProfileFields.SS2Model',
    'underscore'
  ]
  , function (
    TermsTrackingExtensionView,
    ProfileFieldsSS2Model,
    _
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var PROFILE       = container.getComponent('UserProfile');
        var ENVIRONMENT   = container.getComponent('Environment');
        var LAYOUT        = container.getComponent('Layout');
        var LOGINREGISTER = container.getComponent('LoginRegisterPage');
        var self = this;
        this.profileFields = {};

        var featureConfig = ENVIRONMENT.getConfig('treveraTerms') || {enabled: 'true', entityField: 'custentity_hf_loyalty_agree_terms'};
        if (featureConfig.enabled) {
          LOGINREGISTER && LOGINREGISTER.on('beforeLogin', function (formFields) {
            window.localStorage.setItem('hfot', 'F'); // clear the terms
          });

          ProfileFieldsSS2Model.getPromise().then(function (data) {
            self.profileFields = ProfileFieldsSS2Model.getInstance();
            console.log('profileFields loaded', self.profileFields)
            LAYOUT && LAYOUT.cancelableTrigger('profileFields:Loaded', data);
          })

          LAYOUT.on('profileFields:Loaded', function () {
            if (!self.profileFields.get('agreeTerms') && self.profileFields.isLoggedIn) {
              var modalView = new TermsTrackingExtensionView({application: container});
              LAYOUT.showContent(modalView, {showInModal: false, options: {className: 'modal-confirm-confirm-terms'}});
            }
          });
        }
      }
    };
  });
