/*
 © 2020 Trevera
 */

//@module ProductDetails
define('Trevera.ProductDetails'
  , [
    'Trevera.ProductDetails.Information.View.Extension'
    //, 'Trevera.ProductDetailsAttributes.Extension'
    //, 'Trevera.ProductDetails.Slider.Extension'
    , 'Trevera.AddToCart.Message.View'
    , 'Trevera.PDP.Helpers'
    , 'underscore'
    , 'Utils'
    , 'jQuery'
    , 'HF.StickyButton'

  ]
  , function (
    ProductDetailsInformationView
    //, ProductDetailsAttributesExtension
    //, ProductDetailsImageGalleryVideoView
    , AddToCartMessageView
    , PDPHelpers
    , _
    , Utils
    , jQuery
    , HFStickyButton
  ) {
    'use strict';

    window.CUSTOMIMAGES = {};

    var customSliderOn          = true;
    var limitQuantityOnItems    = false;
    var autoSelectSingleOptions = false;

    try {
      var ItemModel      = require('Item.Model');
      var ItemKeyMapping = require('Item.KeyMapping');
      var Configuration  = require('Configuration');
      if (Configuration.Configuration) Configuration = Configuration.Configuration;
      _.extend(ItemModel.prototype, {
        getImages: _.wrap(ItemModel.prototype.getImages, function (fn, options) {
          var images              = fn.apply(this, _.toArray(arguments).slice(1));
          var filterImages        = Configuration.get('hf.filterImages') || false;
          var filterImagesKey     = Configuration.get('hf.filterImagesKey');
          var filterImagesExclude = Configuration.get('hf.filterImagesExclude') || false;
          var filteredImages      = images;
          if (filterImages && filterImagesKey) {
            if (filterImagesExclude) filteredImages = _.reject(images, function (image) {
              return image.url.indexOf(filterImagesKey) > -1
            })
            else filteredImages = _.reject(images, function (image) {
              return image.url.indexOf(filterImagesKey) < 0
            })
          }
          if (!filteredImages || filteredImages.length < 1) filteredImages = images; // if none were found, then don't filter
          console.log(filteredImages);
          return filteredImages;
        })
      });

      console.log('ItemKeyMapping', ItemKeyMapping);
      _.extend(ItemKeyMapping, {
        getKeyMapping: _.wrap(ItemKeyMapping.getKeyMapping, function (fn, options) {
          var config = fn.apply(this, _.toArray(arguments).slice(1));
          config['_thumbnail'] = function(item) {
            var item_images_detail = item.get('itemimages_detail') || {};

            // If you generate a thumbnail position in the itemimages_detail it will be used
            if (item_images_detail.thumbnail) {
              if (_.isArray(item_images_detail.thumbnail.urls) && item_images_detail.thumbnail.urls.length) {
                return item_images_detail.thumbnail.urls[0];
              }
              return item_images_detail.thumbnail;
            }

            // otherwise it will try to use the storedisplaythumbnail
            if (SC.ENVIRONMENT.siteType && SC.ENVIRONMENT.siteType === 'STANDARD' && item.get('storedisplaythumbnail')) {
              return {
                url: item.get('storedisplaythumbnail'),
                altimagetext: item.get('_name')
              };
            }
            // No images huh? carry on
            var parent_item = item.get('_matrixParent');
            // If the item is a matrix child, it will return the thumbnail of the parent
            if (parent_item && parent_item.get('internalid')) {
              return parent_item.get('_thumbnail');
            }

            var images = Utils.imageFlatten(item_images_detail);
            var filterImages        = Configuration.get('hf.filterImages') || false;
            var filterImagesKey     = Configuration.get('hf.filterImagesKey');
            var filterImagesExclude = Configuration.get('hf.filterImagesExclude') || false;
            if (filterImages && filterImagesKey) {
              if (filterImagesExclude) images = _.reject(images, function (image) {
                return image.url.indexOf(filterImagesKey) > -1
              })
              else images = _.reject(images, function (image) {
                return image.url.indexOf(filterImagesKey) < 0
              })
            }
            if (!images || images.length < 1) images = Utils.imageFlatten(item_images_detail);
            // If you using the advance images features it will grab the 1st one
            if (images.length) {
              for (let i = 0; i < images.length; i++) {
                const detail = images[i];
                const splitted = detail.url.split('.');
                if (splitted[splitted.length - 2] === 'default') {
                  return detail;
                }
              }
              return images[0];
            }

            // still nothing? image the not available
            return {
              url: Utils.getThemeAbsoluteUrlOfNonManagedResources('img/no_image_available.jpeg', Configuration.get('imageNotAvailable')),
              altimagetext: item.get('_name')
            };
          };
          return config;
        })
      });
    } catch (e) {
      console.log('Error: ', e);
    }

    return {
      mountToApp: function mountToApp(container) {
        var LAYOUT                = container.getComponent('Layout');
        var PDP                   = container.getComponent('PDP');
        var ENVIRONMENT           = container.getComponent('Environment');
        var PROFILE               = container.getComponent('UserProfile');
        var CART                  = container.getComponent('Cart');
        var limitQuantitiesConfig = ENVIRONMENT.getConfig('trevera.limitRepQty') || {};

        var filterImages        = ENVIRONMENT.getConfig('hf.filterImages') || true;
        var filterImagesKey     = ENVIRONMENT.getConfig('hf.filterImagesKey') || '_UK';
        var filterImagesExclude = ENVIRONMENT.getConfig('hf.filterImagesExclude') || false;

        var profile;
        PROFILE.getUserProfile().then(function (data) {
          profile = data;
          LAYOUT.cancelableTrigger('profileComponent:DataLoaded');
          PDPHelpers.limitQuantityFeaturePerChannelOn(limitQuantitiesConfig, limitQuantityOnItems, profile, container)
        });

        PDPHelpers.mountToApp(container, limitQuantityOnItems, autoSelectSingleOptions);

        if (PDP) {
          var jumpstartItems   = ENVIRONMENT.getConfig('hf.jsItemIds') || '';
          var jumpstartItemIds = jumpstartItems.split(',');
          jumpstartItemIds     = _.map(jumpstartItemIds, function (id) { return id.trim() });
          PDPHelpers.handleJumpstartItems(CART, LAYOUT, jumpstartItemIds)
          PDP.on('afterOptionSelection', function (data) {
            var matrixChilds   = PDP.getAllMatrixChilds();
            var selectedChilds = PDP.getSelectedMatrixChilds();
            if (matrixChilds.length === selectedChilds.length && matrixChilds.length > 1) {  // no option selected and there is more than one possible matrix child
              jQuery('.product-details-full-matrix-desc').html();
            } else {
              if (selectedChilds.length === 1) {
                // console.log('selector', selector);
                jQuery('.product-details-full-matrix-desc').html(selectedChilds[0].custitem_hf_matrix_item_desc);
              } else {
                jQuery('.product-details-full-matrix-desc').html();
              }
            }
          });
          //ProductDetailsAttributesExtension.mountToApp(container);
          PDP.addToViewContextDefinition(
            PDP.PDP_FULL_VIEW
            , 'treveraExtras'
            , 'object'
            , function treveraExtras(context) {
              var selectedChilds = PDP.getSelectedMatrixChilds();
              console.log('selectedChilds', selectedChilds)
              return {
                isMobile         : Utils.getViewportWidth() < 768,
                showAddToWishList: ENVIRONMENT.getConfig('trevera.pdp.showAddToWishList'),
                showAddToQuote   : ENVIRONMENT.getConfig('trevera.pdp.showAddToQuote') && SC.ENVIRONMENT.permissions.transactions.tranEstimate >= 2,
                showInstagramLink: ENVIRONMENT.getConfig('trevera.pdp.showInstagramLink') && ENVIRONMENT.getConfig('trevera.pdp.instagramLink').length > 0,
                instagramLink    : ENVIRONMENT.getConfig('trevera.pdp.instagramLink'),
                isInStock        : context.model.item.isinstock,
                hasPopupMessage  : context.model.item.custitem_trevera_popup_message && context.model.item.custitem_trevera_popup_message.length > 0,
                customMatrixDesc : selectedChilds.length == 1 ? selectedChilds[0].custitem_hf_matrix_item_desc : ''
              };
            }
          );

          PDP.addToViewContextDefinition(
            'ProductDetails.ImageGallery.View',
            'images',
            'object',
            function (context) {
              var images = context.images;
              if (filterImages && filterImagesKey) {
                if (filterImagesExclude) images = _.reject(context.images, function (image) {
                  return image.url.indexOf(filterImagesKey) > -1
                })
                else images = _.reject(context.images, function (image) {
                  return image.url.indexOf(filterImagesKey) < 0
                })
              }
              if (images.length < 1) images = context.images; // if none were found, then don't filter
              console.log(images);
              return images;
            })

          PDP.addToViewContextDefinition(
            'ProductDetails.ImageGallery.View',
            'firstImage',
            'object',
            function firstImage(context) {
              var images = context.images;
              if (filterImages && filterImagesKey) {
                if (filterImagesExclude) images = _.reject(context.images, function (image) {
                  return image.url.indexOf(filterImagesKey) > -1
                })
                else images = _.reject(context.images, function (image) {
                  return image.url.indexOf(filterImagesKey) < 0
                })
              }
              if (images.length < 1) images = context.images; // if none were found, then don't filter
              console.log(_.first(images));
              return _.first(images);
            });

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

                LAYOUT.showContent(modalView, { showInModal: true, options: { className: 'modal-confirm-addtocart' } })
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

              } else {
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

          PDP.on('afterShowContent', function () {
            var pdp          = PDP.getItemInfo();
            var hideFromAnon = pdp.item.custitem_hf_hide_from_anon;
            PROFILE.getUserProfile().then(function (profile) {
              if (!profile.isloggedin && hideFromAnon) {
                Backbone.history.navigate('/', { trigger: true });
              }
            });
            setTimeout(function () {
              if(Utils.getViewportWidth() <= 992) jQuery('[data-action="hf-sticky"]').HFStickyButton();
            }, 1000)
          });
        }
      }
    }
  });
