/*
	© 2021 Trevera
*/

// @module ProductDetails
define('Trevera.ProductDetails.Slider.Extension'
  , [
    'product_details_image_gallery_video_support.tpl'

    , 'Backbone'
    , 'Backbone.CompositeView'
    , 'underscore'
    , 'jQuery'
    , 'Utils'
  ]
  , function (
    product_details_image_gallery_video_tpl
    , Backbone
    , BackboneCompositeView
    , _
    , jQuery
    , Utils
  ) {
    'use strict';

    var altImageKey = 'alt';

    function filterImages(item_options, selected_options_map, item_images_detail, image_option_filters) {
      var images_container = item_images_detail;
      var selected_option_filter;

      _.each(image_option_filters, function (image_filter) {
        selected_option_filter = _.findWhere(item_options, { cartOptionId: image_filter });
        var options_map        = !!selected_option_filter ? selected_options_map[selected_option_filter.itemOptionId] : [];
        // if the option/dimension has a value set
        if (
          selected_option_filter && selected_option_filter.value && selected_option_filter.value.label
        ) {
          const label = selected_option_filter.value.label.replace(/\//g, '~').toLowerCase();
          _.each(images_container, function (value, key) {
            if (key.toLowerCase() === label) {
              images_container = value;
            }
          });
        } else if (options_map && options_map.length == 1) {
          const label = options_map[0].replace(/\//g, '~').toLowerCase(); // slashes are replaced with tildes
          _.each(images_container, function (value, key) {
            if (key.toLowerCase() === label) {
              images_container = value;
            }
          });
        }
      });

      return images_container;
    }

    function getSelectedOptions(item_options, matrixChilds) {
      var item_map = {};
      _.each(item_options, function (option_filter) {
        if (option_filter.itemOptionId.length > 0) {
          if (!item_map[option_filter.itemOptionId]) item_map[option_filter.itemOptionId] = [];
          _.each(matrixChilds, function (child) {
            var optValue = child[option_filter.itemOptionId];
            if (item_map[option_filter.itemOptionId].indexOf(optValue) < 0) item_map[option_filter.itemOptionId].push(child[option_filter.itemOptionId]);
          })
        }
      });

      console.log(item_map);
      return item_map;
    }

    function resizeImage(url, size, ENVIRONMENT) {
      url  = url || Utils.getThemeAbsoluteUrlOfNonManagedResources('img/no_image_available.jpeg', ENVIRONMENT.getConfig('imageNotAvailable'));
      size = ENVIRONMENT.getConfig('imageSizeMapping.' + size) || size;

      var resize = _.first(
        _.where(ENVIRONMENT.getConfig('siteSettings.imagesizes', []), { name: size })
      );

      if (resize) {
        return url + (~url.indexOf('?') ? '&' : '?') + resize.urlsuffix;
      }

      return url;
    }

    return Backbone.View.extend({
      template: product_details_image_gallery_video_tpl,

      contextDataRequest: ['item'],

      initialize: function (options) {
        this.application = options.application;
        this.ENVIRONMENT = this.application.getComponent('Environment');
        this.PDP         = options.PDP;
        this.fallBack    = _.getAbsoluteUrl(this.ENVIRONMENT.getConfig('videoThumbFallback', '/img/video.png'), 'tiny');
        BackboneCompositeView.add(this);

        this.isZoomEnabled = SC.CONFIGURATION.isZoomEnabled;
        this.application.getLayout().on('afterAppendView', this.initSliderZoom, this);

        var self = this;
        this.PDP.on('afterOptionSelection', function (data) {
          self.render();
          self.initSliderZoom();
        })
      },

      initSliderZoom: function initSliderZoom(forceInit) {
        if (this.isZoomEnabled) {
          this.initZoom();
        }
        this.initSlider(forceInit);
      },

      initZoom: function () {
        var self = this;
        if (!SC.ENVIRONMENT.isTouchEnabled) {
          var { images } = this;
          this.$('[data-zoom]:not(.bx-clone)').each(function (slide_index) {
            self.$(this).zoom(resizeImage(images[slide_index].url, 'zoom', self.ENVIRONMENT), slide_index);
          });
        }
      },

      // @method buildSliderPager @param {Number}slide_index
      buildSliderPager: function (slide_index) {
        var image = this.images && this.images[slide_index];

        if (image && image.isVideo) {
          return "<img src='" + this.fallBack + "' alt='play video' class='bx-video-fallback' />"
        } else {
          return '<img src="' + resizeImage(image.url, 'tiny', this.ENVIRONMENT) + '" alt="' + image.altimagetext + '">';
        }
      }

      // Override to turnoff adaptive height
      // @method initSlider Initialize the bxSlider
      // @return {Void}
      , initSlider: function initSlider() {
        var self = this;

        if (self.images.length > 1) {
          this.$slider = Utils.initBxSlider(self.$('[data-slider]'), {
            /*buildPager: _.bind(self.buildSliderPager, self)
            ,	*/startSlide: 0
            , adaptiveHeight           : false
            , touchEnabled             : true
            , nextText                 : '<a class="product-details-image-gallery-next-icon" data-action="next-image"></a>'
            , prevText                 : '<a class="product-details-image-gallery-prev-icon" data-action="prev-image"></a>'
            , controls                 : true
            , pager                    : false
            , hideControlOnEnd         : true
            , infiniteLoop             : false
            , responsive               : true

            , onSlideBefore: function ($slideElement, oldIndex, newIndex) {
              self.changeThumbnail(self.getPagerSliderSlide());
            }
            , onSlideAfter : function ($slideElement, oldIndex, newIndex) {
              //console.log('onSlideAfter - slider', oldIndex, 'newIndex', newIndex, self.getPagerSliderSlide());
            }
          });

          this.$pagerSlider = Utils.initBxSlider(self.$('.product-details-image-gallery-thumbs > ul'), {
            adaptiveHeight    : false
            , touchEnabled    : true
            , nextText        : '<a class="product-details-image-gallery-tiles-next-icon"></a>'
            , prevText        : '<a class="product-details-image-gallery-tiles-prev-icon"></a>'
            , controls        : true
            , pager           : false
            , infiniteLoop    : false
            , hideControlOnEnd: true
            , slideWidth      : 60
            , slideMargin     : 10
            , minSlides       : 7
            , maxSlides       : 7
            , randomStart     : false

            , onSlideBefore: function ($slideElement, oldIndex, newIndex) {
              //console.log('onSlideBefore - pager', oldIndex, 'newIndex', newIndex, self.$pagerSlider.getCurrentSlide());
            }

            , onSlideAfter: function ($slideElement, oldIndex, newIndex) {
              //console.log('onSlideAfter - pager', oldIndex, 'newIndex', newIndex, self.$pagerSlider.getCurrentSlide());
            }
          });

          self.linkSliders();

          if (SC.ENVIRONMENT.jsEnvironment === 'browser') {
            setTimeout(function () {
              self.$pagerSlider && self.$pagerSlider.goToSlide && self.$pagerSlider.goToSlide(0);
            }, 1000)
          }

        }
      }

      , linkSliders: function linkSliders() {
        var self = this;

        self.$pagerSlider.find('li[data-slideIndex="0"]').addClass('active');
        self.$pagerSlider && self.$pagerSlider.goToSlide && self.$pagerSlider.goToSlide(0);

        self.$pagerSlider.on("click", "li", function (event) {
          event.preventDefault();

          var newIndex = jQuery(this).data("slideindex");
          //console.log('slider go to slide', newIndex)
          self.$pagerSlider && self.$pagerSlider.goToSlide && self.$slider.goToSlide(parseInt(newIndex));
        });

        //console.log('linkSliders', this.$pagerSlider.getCurrentSlide(), this.$slider.getCurrentSlide(), self.getPagerSliderSlide())

      }

      , getPagerSliderSlide: function () {
        var calculatedIndex = Math.round(this.$slider.getCurrentSlide() / this.$pagerSlider.getSlideCount());

        console.log(calculatedIndex, this.$slider.getCurrentSlide(), this.$pagerSlider.getSlideCount());

        if (_.isNaN(calculatedIndex) || calculatedIndex === Infinity || calculatedIndex < 0) return 0;

        if (calculatedIndex > this.$pagerSlider.getSlideCount()) calculatedIndex = this.$pagerSlider.getSlideCount() - 1;

        return calculatedIndex;
      }

      , destroy: function destroy() {
        this.application.getLayout().off('afterAppendView', this.initSliderZoom, this);
        this._destroy();
      }

      , slideCount: 7

      , changeThumbnail: function () {
        this.$pagerSlider && this.$pagerSlider.goToSlide && this.$pagerSlider.goToSlide(this.getPagerSliderSlide());
        this.$pagerSlider.find('.active').removeClass("active");
        this.$pagerSlider.find('li[data-slideIndex="' + this.$slider.getCurrentSlide() + '"]').addClass("active");

        //if(this.$slider.getSlideCount()-this.$slider.getCurrentSlide() >= this.slideCount) this.$slider.goToSlide(this.$slider.getCurrentSlide());
        //else this.$slider.goToSlide(this.$slider.getSlideCount() - this.slideCount);
        //console.log('pager current slide', this.$pagerSlider.getCurrentSlide(), this.$pagerSlider.getPagerQty());

      }

      , hasNewBadge: function getBadges() {
        var thisItem             = this.contextData.item();
        var ENVIRONMENT          = this.application.getComponent('Environment');
        var badgesField          = ENVIRONMENT.getConfig('sc.badgesItemFieldID') || 'custitem_product_badges';
        var productBadgesEnabled = ENVIRONMENT.getConfig('sc.badgesEnabled') || false;
        var itemBadges           = thisItem[badgesField] || '';
        var badgesArr            = _.without(itemBadges.split(/,/g), '&nbsp;', '', ' ');
        var hasNew               = _.find(badgesArr, function (badge) {
          return badge.trim() === "New Product"
        });

        return productBadgesEnabled && _.size(hasNew) > 0
      }

      , getContext: function () {
        var thisItem       = this.contextData.item();
        var image_filters  = this.ENVIRONMENT.getConfig('productline.multiImageOption', []);
        var images         = thisItem.itemimages_detail;
        var matrixChild    = this.PDP.getAllMatrixChilds();
        var selectedChilds = this.PDP.getSelectedMatrixChilds();
        var optionMap      = getSelectedOptions(thisItem.options, selectedChilds);
        images             = filterImages(thisItem.options, optionMap, images, image_filters);
        var altImages      = thisItem.itemimages_detail[altImageKey];
        if (images && images.urls && altImages && altImages.urls && !images[altImageKey]) {
          images.urls = images.urls.concat(altImages.urls);
        }
        this.images = images;
        if (!!images) this.images = Utils.imageFlatten(images);
        else this.images = [{ url: Utils.getThemeAbsoluteUrlOfNonManagedResources('img/no_image_available.jpeg', ENVIRONMENT.getConfig('imageNotAvailable')) }];

        var returnVariable = {
          // @property {String} imageResizeId
          imageResizeId: Utils.getViewportWidth() < 768 ? 'thumbnail' : 'main',
          // @property {Array<ImageContainer>} images
          images: this.images || [],
          // @property {ImageContainer} firstImage
          firstImage: images.urls && images.urls[0] || {},
          // @property {Boolean} showImages
          showImages: this.images.length > 0,
          // @property {Boolean} showImageSlider
          showImageSlider: this.images.length > 1
        };
        var imageResizeId  = this.options.inModal ? 'quickview' : 'main';
        if (Utils.getViewportWidth() < 540) {
          imageResizeId = 'searchmobile'
        }
        if (Utils.getViewportWidth() < 480) {
          imageResizeId = 'quickview'
        }

        // extend it with new variables
        _.extend(returnVariable, {
          showNewProductBadge: this.hasNewBadge(),
          imageResizeId      : imageResizeId,
          fallBack           : this.fallBack
        });
        return returnVariable;
      }
    });


  });
