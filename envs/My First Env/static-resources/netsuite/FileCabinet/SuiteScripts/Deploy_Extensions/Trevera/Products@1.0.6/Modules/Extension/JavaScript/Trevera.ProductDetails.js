/*
 © 2020 Trevera
 */

//@module ProductDetails
define(
  'Trevera.ProductDetails'
  , [
    'Trevera.ProductDetails.Information.View.Extension'
    //, 'Trevera.ProductDetailsAttributes.Extension'
    , 'Trevera.ProductDetails.Slider.Extension'
    , 'Trevera.AddToCart.Message.View'
    , 'Trevera.PDP.Helpers'
    , 'underscore'
    , 'Utils'
    , 'jQuery'

  ]
  , function (
    ProductDetailsInformationView
    //, ProductDetailsAttributesExtension
    , ProductDetailsImageGalleryVideoView
    , AddToCartMessageView
    , PDPHelpers
    , _
    , Utils
    , jQuery
  ) {
    'use strict';

    window.CUSTOMIMAGES = {};

    var customSliderOn          = true;
    var autoSelectSingleOptions = false;
    var limitQuantityOnItems    = false;

    return {
      mountToApp: function mountToApp(container) {
        var LAYOUT      = container.getComponent('Layout');
        var PDP         = container.getComponent('PDP');
        var ENVIRONMENT = container.getComponent('Environment');
        var PROFILE     = container.getComponent('UserProfile');
        var CART        = container.getComponent('Cart');

        var profile;
        PROFILE.getUserProfile().then(function (data) {
          profile = data;
          console.log('profile data', data);
          LAYOUT.cancelableTrigger('profileComponent:DataLoaded');
        });

        PDPHelpers.mountToApp(container, autoSelectSingleOptions, limitQuantityOnItems);

        if (PDP) {
          //ProductDetailsAttributesExtension.mountToApp(container);

          PDP.addToViewContextDefinition(
            PDP.PDP_FULL_VIEW
            , 'treveraExtras'
            , 'object'
            , function treveraExtras(context) {
              return {
                isMobile         : Utils.getViewportWidth() < 768,
                showAddToWishList: ENVIRONMENT.getConfig('trevera.pdp.showAddToWishList'),
                showAddToQuote   : ENVIRONMENT.getConfig('trevera.pdp.showAddToQuote') && SC.ENVIRONMENT.permissions.transactions.tranEstimate >= 2,
                showInstagramLink: ENVIRONMENT.getConfig('trevera.pdp.showInstagramLink') && ENVIRONMENT.getConfig('trevera.pdp.instagramLink').length > 0,
                instagramLink    : ENVIRONMENT.getConfig('trevera.pdp.instagramLink'),
                isInStock        : context.model.item.isinstock,
                hasPopupMessage  : context.model.item.custitem_trevera_popup_message && context.model.item.custitem_trevera_popup_message.length > 0
              };
            }
          );

          PDP.addToViewContextDefinition(
            PDP.PDP_QUICK_VIEW
            , 'treveraExtras'
            , 'object'
            , function treveraExtras(context) {
              var hasPopupMessage = context.model.item.custitem_trevera_popup_message && context.model.item.custitem_trevera_popup_message.length
              return {
                storeDescription            : context.model.item.storedescription,
                isMobile                    : Utils.getViewportWidth() < 768,
                showAddToWishList           : ENVIRONMENT.getConfig('trevera.pdp.showAddToWishList'),
                showAddToQuote              : ENVIRONMENT.getConfig('trevera.pdp.showAddToQuote') && SC.ENVIRONMENT.permissions.transactions.tranEstimate >= 2,
                isInStock                   : context.model.item.isinstock,
                hasPopupMessage             : hasPopupMessage,
                popupRequiresAcknowledgement: hasPopupMessage ? context.model.item.custitem_trevera_requires_confirmation : false
              };
            }
          );

          PDP.addToViewEventsDefinition(
            PDP.PDP_FULL_VIEW,
            'click [data-action="show-confirmation-message"]',
            function (event) {
              event.preventDefault();
              var pdp             = PDP.getItemInfo();
              var popupMessage    = pdp.item.custitem_trevera_popup_message;
              var hasPopupMessage = popupMessage.length > 0;
              if (hasPopupMessage) {
                var popupRequiresAcknowledgement = pdp.item.custitem_trevera_requires_confirmation;
                var modalView                    = new AddToCartMessageView({
                  application        : container,
                  message            : popupMessage,
                  requireConfirmation: popupRequiresAcknowledgement,
                  dataConfirmAction  : popupRequiresAcknowledgement ? 'updatefieldandcontinue' : 'continue',
                  PDP                : PDP,
                  isQuickview        : false
                });

                LAYOUT.showContent(modalView, {showInModal: true, options: {className: 'modal-confirm-addtocart'}})
              }
            }
          );

          LAYOUT.registerView('Quickview.AddToCart.Message', function () {
            var pdp                          = PDP.getItemInfo();
            var popupMessage                 = pdp.item.custitem_trevera_popup_message;
            var hasPopupMessage              = popupMessage.length > 0;
            var popupRequiresAcknowledgement = hasPopupMessage ? pdp.item.custitem_trevera_requires_confirmation : false;
            return new AddToCartMessageView({
              application        : container,
              message            : popupMessage,
              requireConfirmation: popupRequiresAcknowledgement,
              dataConfirmAction  : popupRequiresAcknowledgement ? 'updatefieldandcontinue' : 'continue',
              PDP                : PDP,
              isQuickview        : true
            });
          });

          // add listener for confirmation to QuickView
          PDP.addToViewEventsDefinition(
            PDP.PDP_QUICK_VIEW,
            'click [data-action="updatefieldandcontinue"]',
            function (event) {
              var $acknowledged = jQuery('#in-modal-confirm_message');
              if ($acknowledged.is(":checked")) {
                var date       = new Date();
                var dateString = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1) + '/' + ((date.getDate()) < 10 ? '0' : '') + date.getDate() + '/' + date.getFullYear();
                jQuery('#custcol_trevera_popup_acknowledged').val(dateString).trigger('blur');
                setTimeout(function () {
                  jQuery('[data-type="add-to-cart"]').trigger('click');
                }, 1000)

              }
              else {
                LAYOUT.showMessage({
                  message : 'Please Confirm that you understand this message by checking the checkbox.',
                  type    : 'error',
                  selector: 'ConfirmMessageError'
                });
              }
            }
            )

          //TODO: update this for default images handling
          LAYOUT.addToViewContextDefinition(
            'ItemRelations.RelatedItem.View'
            , 'thumbnail'
            , 'array'
            , function thumbnail(context) {
              // console.log('context', context);
              var images = context.model.itemimages_detail;
              return !!images && images.alt && _.size(images.alt.urls) > 0 ? images.alt.urls[0] : context.thumbnail;
            }
          );

          window.onpopstate = function (event) {
            //console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
            jQuery('.layout-container').removeClass('sc-pushing');
            jQuery('#content').removeAttr('data-pushing');
            jQuery('.sc-pushing-reopened').removeClass('sc-pushing-reopened');
          };

          PDP.removeChildView(PDP.PDP_FULL_VIEW, 'Product.Information', 'Product.Information');

          PDP.addChildView( // use addChildView to replace the content
            'Product.Information'
            , function () {
              return new ProductDetailsInformationView({
                application: container,
                PDP        : PDP
              })
            }
          );
        }
      }
    }
  });

