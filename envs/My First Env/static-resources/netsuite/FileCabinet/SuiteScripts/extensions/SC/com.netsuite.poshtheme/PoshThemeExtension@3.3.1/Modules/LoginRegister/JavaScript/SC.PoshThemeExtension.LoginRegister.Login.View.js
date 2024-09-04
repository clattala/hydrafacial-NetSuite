// @module LoginRegister View
define('SC.PoshThemeExtension.LoginRegister.Login.View', [
  'underscore',
  'SC.PoshThemeExtension.Common.Configuration',
  'SC.PoshThemeExtension.Common.LayoutHelper'
], function ThemeExtensionLoginRegister(_, Configuration, LayoutHelper) {
  'use strict';

  return {
    loadModule: function loadModule() {
      LayoutHelper.addToViewContextDefinition(
        'LoginRegister.Login.View',
        'extraLoginRegisterLoginView',
        'object',
        function () {
          return {
            loginSubtitle: Configuration.get('loginRegister.loginSubtitle'),
            loginText: Configuration.get('loginRegister.loginText')
          };
        }
      );
    }
  };
});
