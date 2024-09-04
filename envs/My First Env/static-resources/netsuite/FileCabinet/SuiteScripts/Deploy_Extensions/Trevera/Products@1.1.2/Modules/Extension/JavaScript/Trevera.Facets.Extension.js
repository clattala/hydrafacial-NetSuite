// Exclude additional facets from the faceted navigation on search and category pages
// usage in templates:
// <div data-view="Facets.FacetedNavigationItems" data-exclude-facets="commercecategoryname,category{{additionalExclude}}"></div>
// copy template into theme.
define(
  'Trevera.Facets.Extension'
  , [
    'Utils',
    'underscore',
    'jQuery'
  ]
  , function (
    Utils,
    _,
    jQuery
  ) {
    'use strict';

    return {
      toggleMenu: function (e) {
        var $target  = jQuery(e.currentTarget);
        var descArea = $target.parent('.facets-item-cell-grid-desc').find('.description-copy');
        if (jQuery(descArea).hasClass('open')) {
          jQuery(descArea).removeClass('open');
          $target.text('more...')
        }
        else {
          jQuery(descArea).addClass('open');
          $target.text('less...')
        }
      },

      mountToApp: function mountToApp(container) {
        var PLP         = container.getComponent('PLP')
          , LAYOUT      = container.getComponent('Layout')
          , ENVIRONMENT = container.getComponent('Environment')
          , PROFILE     = container.getComponent('UserProfile');

        var profile_model;

        PROFILE.getUserProfile().done(function (profile) {
          profile_model = profile;
          if (!profile_model.internalid) {
            SC.PROFILE_PROMISE.done(function (data) {
              profile_model = data;
              console.log(data)
            });
          }
        });

        if (PLP && LAYOUT) {

          LAYOUT.addToViewContextDefinition(
            'Facets.Browse.View'
            , 'treveraExtras'
            , 'object'
            , function treveraExtras(context) {

              var categoryInfo = PLP.getCategoryInfo() || {};
              var cssClass     = "category-level-unknown";
              if (categoryInfo && categoryInfo.idpath) {
                cssClass = "category-level-" + categoryInfo.idpath.split("|").length
              }
              if (categoryInfo && categoryInfo.fullurl) {
                cssClass = "category-level-" + categoryInfo.fullurl.split("/").length
              }

              var filters           = PLP.getAllFilters()
                , facets            = _.filter(filters, function (filter) {
                return filter.id !== 'category' && filter.values && filter.values.length > 1
              })
                , hasSelectedFacets = _.size(facets) > 0
                , hasSubcategories  = _.size(categoryInfo) > 0 //this.model.get('category') ? this.model.get('category').get('categories').length > 0 :// false
                , hasItems          = PLP.getItemsInfo().length > 0;
              return {
                categoryLevelCSSClass : cssClass,
                additionalExclude     : ',' + ENVIRONMENT.getConfig('trevera.facets.excludedFacets'),
                narrowByCopy          : ENVIRONMENT.getConfig('trevera.facets.narrowByCopy') || "Narrow By",
                showCategoryCellsTitle: categoryInfo.categories && categoryInfo.categories.length > 0 && ENVIRONMENT.getConfig('trevera.facets.showSubCategoryTitle'),
                categoryCellsTitle    : ENVIRONMENT.getConfig('trevera.facets.subcategoryTitle') || "Browse by Category",
                hasSelectedFacets     : hasSelectedFacets,
                hasSubcategories      : hasSubcategories,
                showItems             : hasItems || (!hasItems && hasSelectedFacets) || !(!hasItems && !hasSelectedFacets && hasSubcategories),
                hasFacets             : false //facets.length > 0
              }

            }
          );

          LAYOUT.addToViewContextDefinition(
            'Facets.ItemCell.View'
            , 'treveraExtras'
            , 'object'
            , function treveraExtras(context) {
              var items = PLP.getItemsInfo()
                , item  = _.find(items, {internalid: context.itemId});

              var thumbnail             = context.thumbnail;
              var images                = item.itemimages_detail ? item.itemimages_detail : "";
              var filters               = _.find(PLP.getFilters(), function (filter) {
                return filter.id == customColorId
              });
              var filterValueNormalized = !!filters && filters.value ? filters.value[0].replace(/-/g, ' ').replace(/~/g, '-') : '';
              if (images && filters && filters.value[0] && (images[filters.value[0]] || images[filterValueNormalized])) {
                _.each(filters.value, function (filter) {
                  if (images[filter] && images[filter].urls) {
                    thumbnail = images[filter].urls[0];
                  }
                  if (images[filterValueNormalized] && images[filterValueNormalized].urls) {
                    thumbnail = images[filterValueNormalized].urls[0];
                  }
                });
              }

              var filters     = _.find(PLP.getFilters(), function (filter) { return filter.id == customColorId })
                , existingUrl = context.url;
              return {
                thumbnail           : thumbnail,
                url                 : existingUrl,
                isEnvironmentBrowser: SC.ENVIRONMENT.jsEnvironment === 'browser',
                isTouch             : SC.ENVIRONMENT.isTouchEnabled,
                isSmallScreen       : Utils.getViewportWidth() < 768,
                storeDescription    : item.storedescription,
                isLoggedIn          : profile_model.isloggedin,
                itemResizeIDs       : {
                  grid   : ENVIRONMENT.getConfig('trevera.facets.gridResizeID') || 'thumbnail'
                  , table: ENVIRONMENT.getConfig('trevera.facets.tableResizeID') || 'thumbnail'
                  , list : ENVIRONMENT.getConfig('trevera.facets.listResizeID') || 'thumbnail'
                }
              }
            }
          );

          var self = this;
          //handle descriptions on PLP
          LAYOUT.addToViewEventsDefinition(
            'Facets.ItemCell.View',
            'click [data-action="show-full-description"]',
            function (event) {
              self.toggleMenu(event);
            }
          );
        }

      }
    }
  });
