define('SC.PoshThemeExtension.HeaderProfile', [
  'underscore',
  'SC.PoshThemeExtension.Common.Configuration',
  'SC.PoshThemeExtension.Common.LayoutHelper'
], function ThemeExtensionHeader(_, Configuration, LayoutHelper) {
  'use strict';

  return {
    loadModule: function loadModule() {
      LayoutHelper.addToViewContextDefinition(
        'Header.Profile.View',
        'extraHeaderProfileView',
        'object',
        function () {
          return {
            welcometext: Configuration.get('header.welcomeText')
          };
        }
      );
    }
  };
});
