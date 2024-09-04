// @module Trevera.AddToCart.Message.View
define('Trevera.AddToCart.Message.View'
  , [
    'SCView'
    , 'Cart.Confirmation.Helpers'
    , 'add_to_cart_confirm_message.tpl'
    , 'Backbone'
  ]
  , function (
    SCViewModule
    , CartConfirmationHelpers
    , add_to_cart_confirm_message_tpl
    , Backbone
  ) {
    'use strict';

    // @class Trevera.AddToCart.Message.View @extends Backbone.View
    var SCView = SCViewModule.SCView;

    function AddToCartMessageView(options) {
      SCView.call(this, options);
      this.PDP         = options.PDP;
      this.LAYOUT      = options.application.getComponent('Layout');
      this.template    = add_to_cart_confirm_message_tpl;
      this.isQuickView = options.isQuickview;
      this.model       = {
        message            : options.message,
        requireConfirmation: options.requireConfirmation,
        dataConfirmAction  : options.dataConfirmAction
      };

      this.PDP.cancelableOn('dateSetOnPDP', function () {
        //jQuery('[data-type="add-to-cart"]').trigger('click');
      });
      this.updateDateField = function updateDateField(evt) {
        evt.preventDefault();
        var $acknowledged = this.isQuickView ? jQuery('#in-modal-confirm_message') : jQuery('#confirm_message');
        if ($acknowledged.is(":checked")) {
          var date       = new Date();
          var dateString = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1) + '/' + ((date.getDate()) < 10 ? '0' : '') + date.getDate() + '/' + date.getFullYear();
          jQuery('#custcol_trevera_popup_acknowledged').val(dateString).trigger('blur');
          setTimeout(function () {
            jQuery('[data-type="add-to-cart"]').trigger('click');
          }, 1000)

        }
        else {
          this.LAYOUT.showMessage({
            message : 'Please Confirm that you understand this message by checking the checkbox.',
            type    : 'error',
            selector: 'ConfirmMessageError'
          });
        }
      };
      this.continueWithAdd = function (evt) {
        evt.preventDefault();
        jQuery('[data-type="add-to-cart"]').trigger('click');
      };
    }

    AddToCartMessageView.prototype             = Object.create(SCView.prototype);
    AddToCartMessageView.prototype.constructor = AddToCartMessageView;
    AddToCartMessageView.prototype.getContext  = function () {
      return {
        message            : this.model.message,
        requireConfirmation: this.model.requireConfirmation,
        dataConfirmAction  : this.model.dataConfirmAction,
        inModal       : !this.isQuickView
      }
    };
    AddToCartMessageView.prototype.getEvents   = function () {
      return {
        'click [data-action="updatefieldandcontinue"]': 'updateDateField',
        'click [data-action="continue"]'              : 'continueWithAdd'
      }
    };

    return AddToCartMessageView
  });
