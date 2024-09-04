define('SC.PoshThemeExtension.Checkout', [
  'SC.PoshThemeExtension.Header',
  'SC.PoshThemeExtension.Footer',
  'SC.PoshThemeExtension.Footer.Simplified',
  'SC.PoshThemeExtension.ItemRelations.SC.Configuration',
  'SC.PoshThemeExtension.ErrorManagement.PageNotFound.View',
  'SC.PoshThemeExtension.LoginRegister.Login.View',
  'SC.PoshThemeExtension.LoadWebFont',
  'SC.PoshThemeExtension.Common.Configuration',
  'SC.PoshThemeExtension.Common.LayoutHelper'
], function SCPoshThemeExtensionCheckoutEntryPoint(
  PoshThemeExtHeader,
  PoshThemeExtFooter,
  PoshThemeExtFooterSimplified,
  PoshThemeExtItemRelations,
  PoshThemeExtErrorManagementPageNotFoundView,
  PoshThemeExtLoginRegister,
  PoshThemeExtLoadWebFont,
  Configuration,
  LayoutHelper
) {
  'use strict';

  return {
    mountToApp: function (container) {
      Configuration.setEnvironment(container.getComponent('Environment'));
      LayoutHelper.setLayoutComponent(container.getComponent('Layout'));
      PoshThemeExtHeader.loadModule();
      PoshThemeExtFooter.loadModule();
      PoshThemeExtFooterSimplified.loadModule();
      PoshThemeExtItemRelations.loadModule();
      PoshThemeExtErrorManagementPageNotFoundView.loadModule();
      PoshThemeExtLoginRegister.loadModule();
      PoshThemeExtLoadWebFont.loadModule();
    }
  };
});
