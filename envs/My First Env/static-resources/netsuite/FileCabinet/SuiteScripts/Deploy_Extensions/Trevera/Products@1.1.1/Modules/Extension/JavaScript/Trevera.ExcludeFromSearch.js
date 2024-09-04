define('Trevera.ExcludeFromSearch'
  , [
    'Backbone',
    'UrlHelper',
    'underscore'
  ]
  , function (
    Backbone,
    UrlHelper,
    _
  ) {
    'use strict';

    var relatedChildViewNames = [
      'Related.Items',
      'Correlated.Items',
      'RecentlyViewed.Items'
    ];
    var facetName             = 'custitem_trv_sca_exclude_from_search';
    var facetValue            = 'F';
    /** note the field has to be in the fieldssets in order for the code to function correctly. */
    var subsidiaryFilter      = 'custitem_hf_show_for_uk';


    return {
      mountToApp: function mountToApp(container) {
        var PDP         = container.getComponent('PDP');
        var CART        = container.getComponent('Cart');
        var self        = this;
        var ENVIRONMENT = container.getComponent('Environment')
        var facetConfig = ENVIRONMENT.getConfig('trevera.facets') || {};

        this.filterItemsFromSearch(container);
        this.facetExclude(container);

        if (PDP) {
          PDP.on('beforeShowContent', function beforeShowContent() {
            var promise  = jQuery.Deferred();
            var itemInfo = PDP.getItemInfo();
            var item     = itemInfo && itemInfo.item;

            if (item[facetName] !== self.normalizeFacetValue(facetValue)) {
              Backbone.history.navigate('', {trigger: true});
              return promise.reject();
            }
            if (facetConfig.filterOnFacet && item[subsidiaryFilter] !== self.normalizeFacetValue(facetConfig.filterOnFacetValue)) {
              Backbone.history.navigate('', {trigger: true});
              return promise.reject();
            }
            self.rejectHiddenItemsFromChildViews(relatedChildViewNames, PDP.viewToBeRendered, container);
            self.rejectItemsFromRelatedItems(container);
            return promise.resolve();
          });
        }

        if (CART) {
          CART.on('beforeShowContent', function beforeShowContent() {
            self.rejectHiddenItemsFromChildViews(relatedChildViewNames, CART.viewToBeRendered, container);
          });
        }

      },

      facetExclude: function facetExclude(container) {
        var ENVIRONMENT = container.getComponent('Environment');
        var facets      = ENVIRONMENT.getConfig('searchApiMasterOptions.Facets');
        var facetNames  = [facetName];
        var facetConfig = ENVIRONMENT.getConfig('trevera.facets') || {};
        if (facetConfig.filterOnFacet) facetNames.push(subsidiaryFilter);

        facets['facet.exclude'] = (facets['facet.exclude'] || '').split(',');

        if (_(facetNames).isArray()) {
          facets['facet.exclude'] = facets['facet.exclude'].concat(facetNames);

          if (!_(container.Configuration.itemOptions).isArray()) {
            container.Configuration.itemOptions = [];
          }
          /*_(facetNames).each(function eachOption(optionId) {
            container.Configuration.itemOptions.push({
              cartOptionId: optionId,
              templates: {
                selector: itemViewsOptionHiddenTemplate,
                selected: itemViewsOptionHiddenTemplate
              }
            });
          });*/
        }

        facets['facet.exclude'] = _(facets['facet.exclude']).compact().join(',');
      },

      normalizeFacetValue: function normalizeFacetValue(value) {
        switch (value.toString()) {
          case 'T':
            return true;
          case 'F':
            return false;
          default:
            break;
        }
        return value;
      },

      filterItemsFromSearch: function filterItemsFromSearch(container) {
        var ENVIRONMENT = container.getComponent('Environment');
        var facetConfig = ENVIRONMENT.getConfig('trevera.facets') || {};
        try {
          if(SC.ENVIRONMENT.siteSettings.sitetype === 'ADVANCED') {
            var Configuration = require('Configuration');
            if(Configuration.Configuration) Configuration = Configuration.Configuration;

            _.each(Configuration.searchApiMasterOptions, function eachOption(option) {
              option[facetName] = facetValue;
              if (facetConfig.filterOnFacet) option[subsidiaryFilter] = facetConfig.filterOnFacetValue;
            });
          }
        } catch(e) {
          console.log('error updating search.')
        }

        console.log('searchApiMasterOptions', ENVIRONMENT.getConfig('searchApiMasterOptions'))

        var UrlHelperLocal = UrlHelper;
        if(UrlHelperLocal.UrlHelper) UrlHelperLocal = UrlHelper.UrlHelper;
        if (UrlHelperLocal && UrlHelperLocal.setUrlParameter) {
          _(jQuery.ajaxSettings).extend({ // Ajax fix for Merchandising Zones delivered by CMS
            beforeSend: _(jQuery.ajaxSettings.beforeSend).wrap(function beforeSend(fn, jqXhr, options) {
              var urlOptions;

              if (/^\/api\/items/.test(options.url) || /^\/api\/cacheable\/items/.test(options.url)) {
                urlOptions = _(options.url).parseUrlOptions();
                if (_.isUndefined(urlOptions[facetName])) {
                  options.url = UrlHelperLocal.setUrlParameter(options.url, facetName, facetValue);
                }
                if (_.isUndefined(urlOptions[subsidiaryFilter]) && facetConfig.filterOnFacet) {
                  options.url = UrlHelperLocal.setUrlParameter(options.url, subsidiaryFilter, facetConfig.filterOnFacetValue);
                }
              }
              fn.apply(this, _(arguments).toArray().slice(1));
            })
          });
        }
      },

      rejectItemsFromRelatedItems: function (container) {
        var ENVIRONMENT = container.getComponent('Environment');
        var facetConfig = ENVIRONMENT.getConfig('trevera.facets') || {};
        try {
          //loadRelatedItem
          var ItemRelationsRelatedView = require('ItemRelations.Related.View');
          if(ItemRelationsRelatedView.ItemRelationsRelatedView) ItemRelationsRelatedView = ItemRelationsRelatedView.ItemRelationsRelatedView;

          _.extend(ItemRelationsRelatedView.prototype, {
            initialze: _.wrap(ItemRelationsRelatedView.prototype.initialze, function (fn, options) {
              fn.apply(this, _.toArray(arguments).slice(1));

              var self = this;
              this.on('beforeViewRender', function () {
                self.collection.models = _(this.collection.models).reject(function eachItem(item) {
                  return item.get(facetName) !== self.normalizeFacetValue(facetValue);
                });
                self.collection.models = _(this.collection.models).reject(function eachItem(item) {
                  return facetConfig.filterOnFacet ? item.get(subsidiaryFilter) !== self.normalizeFacetValue(facetConfig.filterOnFacetValue) : false;
                });
                self.collection.length = this.collection.models.length;
              })
            })
          })

        } catch(e) {

        }
      },

      rejectHiddenItemsFromChildViews: function rejectHiddenItemsFromChildViews(childViewNames, viewToBeRendered, container) {
        var ENVIRONMENT = container.getComponent('Environment');
        var facetConfig = ENVIRONMENT.getConfig('trevera.facets') || {};
        var self = this;
        if (viewToBeRendered) {
          viewToBeRendered.on('afterViewRender', function afterViewRender() {
            _(childViewNames || []).each(function eachChildViewName(childViewName) {
              var childView = viewToBeRendered.getChildViewInstance(childViewName);
              if (childView) {
                childView.on('beforeViewRender', function beforeViewRender() {
                  this.collection.models = _(this.collection.models).reject(function eachItem(item) {
                    return item.get(facetName) !== self.normalizeFacetValue(facetValue);
                  });
                  this.collection.models = _(this.collection.models).reject(function eachItem(item) {
                    return facetConfig.filterOnFacet ? item.get(subsidiaryFilter) !== self.normalizeFacetValue(facetConfig.filterOnFacetValue) : false;
                  });
                  this.collection.length = this.collection.models.length;
                });
              }
            });
          });
        }
      }
    };
  });
