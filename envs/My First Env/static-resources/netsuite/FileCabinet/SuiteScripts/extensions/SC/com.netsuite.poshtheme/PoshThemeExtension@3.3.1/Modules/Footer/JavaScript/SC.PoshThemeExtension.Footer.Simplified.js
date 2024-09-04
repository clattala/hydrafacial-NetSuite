define('SC.PoshThemeExtension.Footer.Simplified', [
  'underscore',
  'SC.PoshThemeExtension.Common.Configuration',
  'SC.PoshThemeExtension.Common.LayoutHelper',
  'Utils'
], function ThemeExtensionFooterSimplified(
  _,
  Configuration,
  LayoutHelper,
  Utils
) {
  'use strict';

  return {
    loadModule: function loadModule() {
      // for Copyright message
      var initialConfigYear = Configuration.get('footer.copyright.initialYear');
      var initialYear = initialConfigYear
        ? parseInt(initialConfigYear, 10)
        : new Date().getFullYear();
      var currentYear = new Date().getFullYear();

      LayoutHelper.addToViewContextDefinition(
        'Footer.Simplified.View',
        'extraFooterSimplifiedView',
        'object',
        function () {
          return {
            copyright: {
              hide: !!Configuration.get('footer.copyright.hide'),
              companyName: Configuration.get('footer.copyright.companyName'),
              initialYear: initialYear,
              currentYear: currentYear,
              showRange: initialYear < currentYear,
            },
            text: Configuration.get('footer.text'),
            logoUrl: Utils.getAbsoluteUrlOfNonManagedResources(Configuration.get('header.logoUrl'))
          };
        }
      );
    }
  };
});
