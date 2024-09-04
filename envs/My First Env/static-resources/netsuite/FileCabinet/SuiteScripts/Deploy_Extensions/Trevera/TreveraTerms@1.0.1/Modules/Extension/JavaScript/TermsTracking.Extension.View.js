// @module TermsTracking.Extension
define('TermsTracking.Extension.View',
  [
    'SCView',
    'TermsTracking.Extension.SS2Model',
    'trevera_terms_modal.tpl',
    'underscore'
  ],
  function defineTermsTrackingExtensionView(
    SCViewModule,
    TermsTrackingSS2Model,
    view_tpl,
    _
  ) {
    'use strict';

    var SCView = SCViewModule.SCView;

    function AgreeTermsView(options) {
      SCView.call(this, options);
      this.application   = options.application;
      this.template      = view_tpl;
      this.termsCode     = '';
      this.termsDeclined = false;
      this.LAYOUT        = this.application.getComponent('Layout');
      var self           = this;
      this.config        = this.application.getComponent('Environment').getConfig('treveraTerms') || {};

      if (this.config.termsCMSPage && this.config.termsCMSPage.length > 0) {
        jQuery.ajax(this.config.termsCMSPage).done(function (data) {
          if (data && data.data && data.data.length > 0) {
            var termsContent = {};
            if (self.config.termsPageName && self.config.termsPageName.length > 0) {
              termsContent = _.find(data.data, function (item) {
                return item.areaName === self.config.termsPageName;
              })
            }
            if (self.config.termsCMSArea && self.config.termsCMSArea.length > 0) {
              termsContent = _.find(data.data, function (item) {
                return item.areaName === self.config.termsCMSArea;
              })
            }
            self.termsCode = termsContent && termsContent.fields.custrecord_html_clob_html.replace(/\r\n/g, '');
            console.log(termsContent.fields.custrecord_html_clob_html.replace(/\r\n/g, ''))
            self.render();
          }
        })
      } else {
        console.log('terms not configured - configure or popup will be blank.')
      }
    }

    AgreeTermsView.prototype             = Object.create(SCView.prototype);
    AgreeTermsView.prototype.constructor = AgreeTermsView;

    AgreeTermsView.prototype.getEvents = function () {
      return {
        'click [data-action="confirm-terms"]'  : 'agreeTerms',
        'click [data-action="decline-terms"]'  : 'declineTerms',
        'click [data-action="changed-my-mind"]': 'changedMyMind'
      }
    };

    AgreeTermsView.prototype.changedMyMind = function () {
      this.termsDeclined = false;
      this.render();
    }

    AgreeTermsView.prototype.agreeTerms = function () {
      var self    = this;
      var model   = new TermsTrackingSS2Model();
      var PROFILE = this.application.getComponent('UserProfile');
      PROFILE.getUserProfile().then(function (profile) {
        model.set({ action: 'confirmTerms', email: profile.email });
        model.save().done(function (data) {
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

    AgreeTermsView.prototype.declineTerms = function () {
      var self = this;
      if (this.termsDeclined) {
        window.location.href = SC.SESSION.touchpoints.logout; // hit log out page. Server side log out doesn't work in shopping app
      } else {
        this.termsDeclined = true;
        this.render();
      }
    }

    AgreeTermsView.prototype.showError = function () {
      this.LAYOUT.showMessage({ message: this.error.errorMessage, type: 'error', selector: 'Terms.Alerts', });
      this.error = null;
    }

    AgreeTermsView.prototype.getContext = function () {
      return {
        terms                : this.termsCode,
        termsDeclined        : this.termsDeclined,
        termsTitle           : this.config.termsTitle,
        reConfirmationMessage: this.config.reConfirmationMessage,
        confirmButtonCopy    : this.config.confirmButtonCopy,
        cancelButtonCopy     : this.config.cancelButtonCopy
      }
    };

    return AgreeTermsView
  });
