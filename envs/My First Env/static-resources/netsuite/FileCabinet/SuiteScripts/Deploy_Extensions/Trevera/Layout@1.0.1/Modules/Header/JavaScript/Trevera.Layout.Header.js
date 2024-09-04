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
            , 'showQuoteHeader'
            , 'boolean'
            , function showQuoteHeader(context) {
              return ENVIRONMENT.getConfig('trevera.quotes.showHeaderLink');
            }
          );

          LAYOUT.addToViewContextDefinition(
            'Header.View'
            , 'showQuickOrderHeader'
            , 'boolean'
            , function showQuoteHeader(context) {
              return ENVIRONMENT.getConfig('trevera.quickOrder.showHeaderLink');
            }
          );

          LAYOUT.addToViewContextDefinition(
            'Header.View'
            , 'showSocialMediaLinks'
            , 'boolean'
            , function showSocialMediaLinks(context) {
              return ENVIRONMENT.getConfig('trevera.header.showSocialMediaLinks');
            }
          );

          LAYOUT.addToViewContextDefinition(
            'Header.View'
            , 'socialMediaLinks'
            , 'array'
            , function socialMediaLinks(context) {
              console.log('showHeaderLink', ENVIRONMENT.getConfig('footer.socialMediaLinks'))
              return ENVIRONMENT.getConfig('footer.socialMediaLinks')
            });


          LAYOUT.addToViewContextDefinition(
            'Header.View'
            , 'showSearchControl'
            , 'boolean'
            , function showSearchControl(context) {
              return true;
            });

          LAYOUT.addToViewContextDefinition(
            'Header.View'
            , 'isMobile'
            , 'boolean'
            , function isMobile(context) {
              return Utils.getViewportWidth() <= 992
            });

          LAYOUT.addToViewContextDefinition(
            'Header.View'
            , 'isLoggedIn'
            , 'boolean'
            , function isLoggedIn(context) {
              return profile_model.isloggedin;
            });

          LAYOUT.addToViewContextDefinition(
            'Header.Menu.View'
            , 'showSearchControl'
            , 'boolean'
            , function showSearchControl(context) {
              if (profile_model.isloggedin) return ENVIRONMENT.getConfig('trevera.header.showSearchControl');
              return false;
            });

          LAYOUT.addToViewContextDefinition(
            'Header.Menu.View'
            , 'isMobile'
            , 'boolean'
            , function isMobile(context) {
              return Utils.getViewportWidth() <= 992
            });

          LAYOUT.addToViewContextDefinition(
            'Header.Menu.View'
            , 'isLoggedIn'
            , 'boolean'
            , function isLoggedIn(context) {
              return profile_model.isloggedin;
            });
          LAYOUT.addToViewContextDefinition(
            'Header.Menu.View'
            , 'categories'
            , 'array'
            , function categories(context) {
              var navigationData                 = context.categories
                , hasCommerceCategoryPlaceholder = _.size(_.filter(context.categories, function (cat) {
                return cat.placeholder && cat.placeholder === "Categories";
              })) > 0;

              if (hasCommerceCategoryPlaceholder) {
                navigationData = TreveraCategoryHelpers.getParentCategoryNavigation(ENVIRONMENT, context.categories, excludedCategories, profile_model) || context.categories;
              }

              navigationData = TreveraCategoryHelpers.makeSubMenuFromCategoryID(ENVIRONMENT, navigationData, excludedCategories, profile_model);

              return navigationData;
            });

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
