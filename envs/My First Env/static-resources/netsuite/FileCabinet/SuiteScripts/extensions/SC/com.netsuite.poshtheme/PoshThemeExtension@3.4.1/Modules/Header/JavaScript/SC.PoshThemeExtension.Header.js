define('SC.PoshThemeExtension.Header', [
  'underscore',
  'SC.PoshThemeExtension.Common.Configuration',
  'SC.PoshThemeExtension.Common.LayoutHelper'
], function ThemeExtensionHeader(_, Configuration, LayoutHelper) {
  'use strict';

  return {
    loadModule: function loadModule() {
      // for Social Media Links
      var socialMediaLinks = Configuration.get('footer.socialMediaLinks', []);

      LayoutHelper.addToViewContextDefinition(
        'Header.View',
        'extraHeaderView',
        'object',
        function () {
          return {
            bannertext: Configuration.get('header.bannerText'),
            welcometext: Configuration.get('header.welcomeText'),
            socialMediaLinks: socialMediaLinks
          };
        }
      );
    }
  };
});
