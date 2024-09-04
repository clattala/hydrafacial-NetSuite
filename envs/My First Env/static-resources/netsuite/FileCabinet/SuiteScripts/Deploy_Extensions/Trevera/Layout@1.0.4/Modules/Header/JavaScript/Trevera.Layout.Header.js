/*
 © 2021 Trevera
 Method to show search isn't implemented - adds so search works.
 */
define('Trevera.Layout.Header'
  , [
    'Trevera.CategoryHelpers'
    , 'underscore'
    , 'Utils'
  ]
  , function (
    TreveraCategoryHelpers
    , _
    , Utils
  ) {
    'use strict';

    var _permissionField = 'custentity_ecomm_channel';

    return {
      mountToApp: function mountToApp(container) {
        var LAYOUT      = container.getComponent('Layout')
          , ENVIRONMENT = container.getComponent('Environment')
          , PLP         = container.getComponent('PLP')
          , PROFILE     = container.getComponent('UserProfile');

        var excludedCategories = TreveraCategoryHelpers.getExcludedCategories(ENVIRONMENT);
        var profile_model;
        PROFILE.getUserProfile().done(function (profile) {
          profile_model = profile;
          if (!profile_model.internalid) {
            SC.PROFILE_PROMISE.done(function (data) {
              profile_model = data;
              console.log('profile_model', data);
            });
          }
        });

        if (LAYOUT) {
          LAYOUT.addToViewContextDefinition(
            'Header.View'
            , 'treveraExtras'
            , 'object'
            , function treveraExtras(context) {

              /** filter header links based on permissions in the config */
              var headerRightLinks = ENVIRONMENT.getConfig('trevera.header.rightLinks');
              var customFields     = profile_model && profile_model.customfields;
              var permissionField  = _.find(customFields, {id: _permissionField}) || {value: ''};
              var permissions      = permissionField && permissionField.value && permissionField.value.split(',') || [];
              headerRightLinks     = _.filter(headerRightLinks, function (link) {
                var linkPermission = link.permissions && link.permissions.split(',') || [];
                if (linkPermission.length === 0) return true;
                return _.intersection(permissions, linkPermission).length > 0
              })

              return {
                showQuoteHeader     : ENVIRONMENT.getConfig('trevera.quotes.showHeaderLink'),
                showQuickOrderHeader: ENVIRONMENT.getConfig('trevera.quickOrder.showHeaderLink'),
                showSocialMediaLinks: ENVIRONMENT.getConfig('trevera.header.showSocialMediaLinks'),
                socialMediaLinks    : ENVIRONMENT.getConfig('footer.socialMediaLinks'),
                showSearchControl   : true,
                isMobile            : Utils.getViewportWidth() <= 992,
                isLoggedIn          : profile_model.isloggedin,
                headerRightLinks    : headerRightLinks
              };
            }
          );

          LAYOUT.addToViewContextDefinition(
            'Header.Menu.View'
            , 'treveraExtras'
            , 'object'
            , function treveraExtras(context) {
              var navigationData                 = context.categories
                , hasCommerceCategoryPlaceholder = _.size(_.filter(context.categories, function (cat) {
                return cat.placeholder && cat.placeholder === "Categories";
              })) > 0;

              if (hasCommerceCategoryPlaceholder) {
                navigationData = TreveraCategoryHelpers.getParentCategoryNavigation(ENVIRONMENT, context.categories, excludedCategories, profile_model) || context.categories;
              }
              navigationData = TreveraCategoryHelpers.makeSubMenuFromCategoryID(ENVIRONMENT, navigationData, excludedCategories, profile_model);

              /** filter header links based on permissions in the config */
              var headerRightLinks = ENVIRONMENT.getConfig('trevera.header.rightLinks');
              var customFields     = profile_model && profile_model.customfields;
              var permissionField  = _.find(customFields, {id: _permissionField}) || '';
              var permissions      = permissionField && permissionField.value && permissionField.value.split(',') || [];
              headerRightLinks     = _.filter(headerRightLinks, function (link) {
                var linkPermission = link.permissions && link.permissions.split(',') || [];
                if (linkPermission.length === 0) return true;
                return _.intersection(permissions, linkPermission).length > 0
              })

              return {
                categories       : navigationData,
                showSearchControl: (profile_model.isloggedin) ? ENVIRONMENT.getConfig('trevera.header.showSearchControl') : false,
                isMobile         : Utils.getViewportWidth() <= 992,
                isLoggedIn       : profile_model.isloggedin,
                headerRightLinks : headerRightLinks
              };
            }
          );

          LAYOUT.addToViewContextDefinition(
            'SiteSearch.View'
            , 'showSearchControl'
            , 'boolean'
            , function showSearchControl(context) {
              return true;
            });
        }
      }
    };
  });
