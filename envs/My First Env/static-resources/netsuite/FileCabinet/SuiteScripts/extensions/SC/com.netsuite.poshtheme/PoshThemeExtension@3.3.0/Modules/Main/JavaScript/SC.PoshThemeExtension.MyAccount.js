define('SC.PoshThemeExtension.MyAccount', [
  'SC.PoshThemeExtension.Header',
  'SC.PoshThemeExtension.Footer',
  'SC.PoshThemeExtension.ItemRelations.SC.Configuration',
  'SC.PoshThemeExtension.ErrorManagement.PageNotFound.View',
  'SC.PoshThemeExtension.LoadWebFont',
  'SC.PoshThemeExtension.Common.Configuration',
  'SC.PoshThemeExtension.Common.LayoutHelper'
], function SCPoshThemeExtensionMyAccountEntryPoint(
  PoshThemeExtHeader,
  PoshThemeExtFooter,
  PoshThemeExtItemRelations,
  PoshThemeExtErrorManagementPageNotFoundView,
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
      PoshThemeExtItemRelations.loadModule();
      PoshThemeExtErrorManagementPageNotFoundView.loadModule();
      PoshThemeExtLoadWebFont.loadModule();
    },
  };
});
