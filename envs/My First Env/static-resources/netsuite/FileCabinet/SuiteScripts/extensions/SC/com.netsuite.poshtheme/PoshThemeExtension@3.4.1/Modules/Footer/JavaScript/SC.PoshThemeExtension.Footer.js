define('SC.PoshThemeExtension.Footer', [
  'underscore',
  'SC.PoshThemeExtension.Common.Configuration',
  'SC.PoshThemeExtension.Common.LayoutHelper',
  'jQuery',
  'Utils'
], function ThemeExtensionFooter(
  _,
  Configuration,
  LayoutHelper,
  jQuery,
  Utils
) {
  'use strict';

  var getColLinks = function getColLinks(whichColumn) {
    // for large format footer with up to four columns of links
    var multiColLinks = Configuration.get('footer.multiColLinks', []);
    var targetColLinks = jQuery.grep(multiColLinks, function targetColLinks(e) {
      return e.column === whichColumn;
    });
    return targetColLinks;
  };

  return {
    loadModule: function loadModule() {
      // for Social Media Links
      var socialMediaLinks = Configuration.get('footer.socialMediaLinks', []);
      // for Copyright message
      var initialConfigYear = Configuration.get('footer.copyright.initialYear');
      var initialYear = initialConfigYear
        ? parseInt(initialConfigYear, 10)
        : new Date().getFullYear();
      var currentYear = new Date().getFullYear();

      LayoutHelper.addToViewContextDefinition(
        'Footer.View',
        'extraFooterView',
        'object',
        function () {
          return {
            col1Links: getColLinks('Column 1'),
            col2Links: getColLinks('Column 2'),
            col3Links: getColLinks('Column 3'),
            col4Links: getColLinks('Column 4'),
            socialMediaLinks: socialMediaLinks,
            copyright: {
              hide: !!Configuration.get('footer.copyright.hide'),
              companyName: Configuration.get('footer.copyright.companyName'),
              initialYear: initialYear,
              currentYear: currentYear,
              showRange: initialYear < currentYear
            },
            text: Configuration.get('footer.text'),
            logoUrl: Utils.getAbsoluteUrlOfNonManagedResources(Configuration.get('header.logoUrl')),
            showLegacyNewsletter: Configuration.get('footer.showLegacyNewsletter')
          };
        }
      );
    }
  };
});
