define('SC.PoshThemeExtension.Home', [
  'underscore',
  'SC.PoshThemeExtension.Common.Configuration',
  'SC.PoshThemeExtension.Common.LayoutHelper'
], function ThemeExtensionHome(_, Configuration, LayoutHelper) {
  'use strict';

  return {
    loadModule: function loadModule() {
      // for Carousel
      var carousel = Configuration.get('home.themeCarouselImages', []);
      var infoBlocks = Configuration.get('home.infoblock', []);
      var showCarousel = false;
      var carouselObj;
      var isReady = false;
      var promos = Configuration.get('home.promo', []);
      var firstPromo = promos[0];

      LayoutHelper.addToViewContextDefinition(
        'Home.View',
        'extraHomeView',
        'object',
        function (context) {
          carouselObj = context.carousel;
          isReady =
            _.has(context, 'isReady') && !_.isUndefined(context.isReady)
              ? context.isReady
              : true;

          if (!_.isEmpty(carouselObj)) {
            _.each(carouselObj, function (carousel) {
              if (!_.isEmpty(carousel.image)) {
                _.extend(carousel, {
                  isAbsoluteUrl: carousel.image.indexOf('core/media') !== -1,
                });
              }
            });
          } else {
            carouselObj = carousel;
          }

          return {
            isReady: isReady,
            showCarousel: carouselObj && !!carouselObj.length,
            carousel: carouselObj,
            showInfoblocks: infoBlocks && !!infoBlocks.length,
            infoBlocks: infoBlocks,
            promo: firstPromo
          };
        }
      );
    }
  };
});
