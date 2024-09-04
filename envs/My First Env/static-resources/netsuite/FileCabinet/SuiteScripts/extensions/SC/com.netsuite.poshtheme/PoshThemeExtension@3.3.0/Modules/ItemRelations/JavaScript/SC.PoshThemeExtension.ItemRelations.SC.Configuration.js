define('SC.PoshThemeExtension.ItemRelations.SC.Configuration', [
  'SC.PoshThemeExtension.Common.Configuration'
], function ThemeExtensionItemRelations(Configuration) {
  'use strict';

  return {
    loadModule: function loadModule() {
      var overallConfiguration = Configuration.getOverallConfiguration();
      if (
        overallConfiguration.bxSliderDefaults &&
        overallConfiguration.bxSliderDefaults.slideWidth
      ) {
        overallConfiguration.bxSliderDefaults.slideWidth = 300;
        overallConfiguration.bxSliderDefaults.maxSlides = 4;
      }
    }
  };
});
