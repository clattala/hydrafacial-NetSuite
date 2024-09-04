// @module TermsTracking.Extension
define('TermsTracking.Extension.View'
  , [
    'SCView'
    , 'TermsTracking.Extension.SS2Model'
    , 'GlobalViews.Message.View'
    , 'trevera_terms_modal.tpl'
    , 'underscore'
    , 'Backbone'
  ]
  , function (
    SCViewModule
    , TermsTrackingSS2Model
    , GlobalViewsMessage
    , view_tpl
    , _
    , Backbone
  ) {
    'use strict';

    var SCView = SCViewModule.SCView;

    function AgreeTermsView(options) {
      SCView.call(this, options);
      this.application = options.application;
      this.template    = view_tpl;
      this.termsCode   = '';
      this.LAYOUT      = this.application.getComponent('Layout');
      var self         = this;
      var config       = this.application.getComponent('Environment').getConfig('treveraTerms') || {};
      if (config.termsCMSPage && config.termsCMSPage.length > 0) {
        jQuery.ajax(config.termsCMSPage).done(function (data) {
          console.log(data);
          if (data && data.data && data.data.length > 0) {
            self.termsCode = data.data[0].fields.custrecord_html_clob_html;
            self.render();
          }
        })
      }
      else {
        console.log('terms not configured - configure or popup will be blank.')
      }
    }

    AgreeTermsView.prototype             = Object.create(SCView.prototype);
    AgreeTermsView.prototype.constructor = AgreeTermsView;

    AgreeTermsView.prototype.getTitle = function () { return 'Please Agree to the Terms and Conditions' }

    AgreeTermsView.prototype.showError = function () {
      this.LAYOUT.showMessage({message: this.error.errorMessage, type: 'error', selector: 'Terms.Alerts',});
      this.error = null;
    }

    AgreeTermsView.prototype.agreeTerms = function (evt) {
      var self    = this;
      var model   = new TermsTrackingSS2Model();
      var PROFILE = this.application.getComponent('UserProfile');
      PROFILE.getUserProfile().then(function (profile) {
        model.set({action: 'confirmTerms', email: profile.email});
        model.save().done(function (data) {
          console.log(data);
          if (data.success) {
            window.localStorage.setItem('hfot', 'T');
            self.$containerModal && self.$containerModal.removeClass('fade').modal('hide').data('bs.modal', null);
            jQuery('.confirm-terms-modal, .modal-backdrop-custom').hide();
            window.location.reload();
          }
        }).fail(function (data) {
          console.log('fail', data);
          self.error              = {}
          self.error.errorMessage = 'Problem confirming terms.'
        });
      });
    }

    AgreeTermsView.prototype.declineTerms = function (evt) {
      var self = this;
      if (SC.ENVIRONMENT.SCTouchpoint == 'shopping') {
        window.location.href = SC.SESSION.touchpoints.logout; // hit log out page. Server side log out doesn't work in shopping app
      }
      else {
        var model = new TermsTrackingSS2Model();
        model.set({action: 'declineTerms'});
        model.save().done(function (data) {
          console.log(data)
        }).fail(function (data) {
          console.log('fail', data);
          self.error              = {}
          self.error.errorMessage = 'Problem confirming terms.'
        });
      }
    }

    AgreeTermsView.prototype.getContext = function () {
      return {
        terms: this.termsCode
      }
    };

    AgreeTermsView.prototype.getEvents  = function () {
      return {
        'click [data-action="decline-terms"]': 'declineTerms',
        'click [data-action="confirm-terms"]': 'agreeTerms'
      }
    };

    return AgreeTermsView
  });
