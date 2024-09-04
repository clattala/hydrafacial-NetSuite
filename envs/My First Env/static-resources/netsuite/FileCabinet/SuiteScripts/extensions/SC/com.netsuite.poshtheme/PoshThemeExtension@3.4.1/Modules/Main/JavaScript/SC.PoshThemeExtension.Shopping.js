define('SC.PoshThemeExtension.Shopping', [
  'SC.PoshThemeExtension.Header',
  'SC.PoshThemeExtension.HeaderProfile',
  'SC.PoshThemeExtension.Footer',
  'SC.PoshThemeExtension.Home',
  'SC.PoshThemeExtension.ItemRelations.SC.Configuration',
  'SC.PoshThemeExtension.ErrorManagement.PageNotFound.View',
  'SC.PoshThemeExtension.LoadWebFont',
  'SC.PoshThemeExtension.Common.Configuration',
  'SC.PoshThemeExtension.Common.LayoutHelper',
  'Utils',
  'underscore'
], function PoshThemeExtensionShoppingEntryPoint(
  PoshThemeExtHeader,
  PoshThemeExtHeaderProfile,
  PoshThemeExtFooter,
  PoshThemeExtHome,
  PoshThemeExtItemRelations,
  PoshThemeExtErrorManagementPageNotFoundView,
  PoshThemeExtLoadWebFont,
  Configuration,
  LayoutHelper,
  Utils,
  _
) {
  'use strict';

  return {
    mountToApp: function (container) {
      Configuration.setEnvironment(container.getComponent('Environment'));
      LayoutHelper.setLayoutComponent(container.getComponent('Layout'));
      this.overwriteBxSliderInitialization();
      PoshThemeExtHeader.loadModule();
      PoshThemeExtHeaderProfile.loadModule();
      PoshThemeExtFooter.loadModule();
      PoshThemeExtHome.loadModule();
      PoshThemeExtItemRelations.loadModule();
      PoshThemeExtErrorManagementPageNotFoundView.loadModule();
      PoshThemeExtLoadWebFont.loadModule();
    },

    overwriteBxSliderInitialization: function () {
      Utils.initBxSlider = _.initBxSlider = _.wrap(
        _.initBxSlider,
        function initBxSlider(fn) {
          var autoPlayCarousel = Configuration.get('home.autoPlayCarousel');
          var carouselSpeed = Configuration.get('home.carouselSpeed');
          if (
            arguments.length !== 0 &&
            arguments[1] &&
            arguments[1][0] &&
            arguments[1][0].id === 'home-image-slider-list'
          ) {
            arguments[2] = _.extend(arguments[2], {
              auto: autoPlayCarousel,
              pause: carouselSpeed,
            });
          }
          return fn.apply(this, _.toArray(arguments).slice(1));
        }
      );
    }
  };
});
