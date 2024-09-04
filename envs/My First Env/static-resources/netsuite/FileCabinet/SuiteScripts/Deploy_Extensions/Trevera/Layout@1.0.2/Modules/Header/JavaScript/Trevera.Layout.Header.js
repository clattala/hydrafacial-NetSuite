/*
 © 2021 Trevera
 Method to show search isn't implemented - adds so search works.
 */


define(
  'Trevera.Layout.Header'
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
              {
                profile_model = data;
                console.log(data)
              }
            });
          }
        });

        if (LAYOUT) {
          LAYOUT.addToViewContextDefinition(
            'Header.View'
            , 'treveraExtras'
            , 'object'
            , function treveraExtras(context) {
              //trevera.header.rightLinks
              return {
                showQuoteHeader: ENVIRONMENT.getConfig('trevera.quotes.showHeaderLink'),
                showQuickOrderHeader: ENVIRONMENT.getConfig('trevera.quickOrder.showHeaderLink'),
                showSocialMediaLinks: ENVIRONMENT.getConfig('trevera.header.showSocialMediaLinks'),
                socialMediaLinks: ENVIRONMENT.getConfig('footer.socialMediaLinks'),
                showSearchControl: true,
                isMobile: Utils.getViewportWidth() <= 992,
                isLoggedIn: profile_model.isloggedin,
                headerRightLinks: ENVIRONMENT.getConfig('trevera.header.rightLinks')
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

              return {
                categories: navigationData,
                showSearchControl: (profile_model.isloggedin) ? ENVIRONMENT.getConfig('trevera.header.showSearchControl') :  false,
                isMobile: Utils.getViewportWidth() <= 992,
                isLoggedIn: profile_model.isloggedin,
                readerRightLinks: ENVIRONMENT.getConfig('trevera.header.rightLinks')
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
