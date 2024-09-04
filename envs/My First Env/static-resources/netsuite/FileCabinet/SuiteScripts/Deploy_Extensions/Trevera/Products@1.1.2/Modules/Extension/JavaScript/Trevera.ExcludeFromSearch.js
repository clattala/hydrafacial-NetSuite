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
    /** note the field has to be in the fieldsets in order for the code to function correctly.
    var facetName             = 'custitem_trv_sca_exclude_from_search';
    var facetValue            = 'F';
    var anonFilter            = 'custitem_hf_hide_from_anon';
    var anonFilterValue       = 'F';
    var subsidiaryFilter      = 'custitem_hf_show_for_uk';
     */


    return {
      mountToApp: function mountToApp(container) {
        var self        = this;
        var PDP         = container.getComponent('PDP');
        var CART        = container.getComponent('Cart');
        var PROFILE     = container.getComponent('UserProfile');
        var ENVIRONMENT = container.getComponent('Environment')

        var filterConfig           = ENVIRONMENT.getConfig('hf.excludeSearch') || {};
        this.anonFilter            = filterConfig.hiddenFromAnon;
        this.anonFilterValue       = filterConfig.hiddenFromAnonValue;
        this.filterName            = filterConfig.filterOn;
        this.filterValue           = filterConfig.filterOnValue;
        this.additionalFilterName  = filterConfig.additionalFilterOn;
        this.additionalFilterValue = filterConfig.additionalFilterOnValue;

        this.filterItemsFromSearch(container);
        this.facetExclude(container);

        this.profile_model = { isloggedin: false };
        PROFILE.getUserProfile().done(function (profile) {
          self.profile_model = profile;
        });

        if (PDP) {
          PDP.on('beforeShowContent', function beforeShowContent() {
            var promise  = jQuery.Deferred();
            var itemInfo = PDP.getItemInfo();
            var item     = itemInfo && itemInfo.item;

            if (item[self.anonFilter] !== self.normalizeFacetValue(self.anonFilterValue) && self.profile_model && !self.profile_model.isloggedin) {
              Backbone.history.navigate('', { trigger: true });
              return promise.reject();
            }
            if (self.additionalFilterName && item[self.additionalFilterName] !== self.normalizeFacetValue(self.additionalFilterValue)) {
              Backbone.history.navigate('', { trigger: true });
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
        var self        = this;
        var ENVIRONMENT = container.getComponent('Environment');
        var facets      = ENVIRONMENT.getConfig('searchApiMasterOptions.Facets');
        var facetNames  = [self.filterName, self.anonFilter];
        if (self.additionalFilterName) facetNames.push(self.additionalFilterName);
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
        var self        = this;
        var ENVIRONMENT = container.getComponent('Environment');
        try {
          if (SC.ENVIRONMENT.siteSettings.sitetype === 'ADVANCED') {
            var Configuration = require('Configuration');
            if (Configuration.Configuration) Configuration = Configuration.Configuration;
            _.each(Configuration.searchApiMasterOptions, function eachOption(option) {
              option[self.filterName] = self.filterValue;
              if (self.profile_model && !self.profile_model.isloggedin) option[self.anonFilter] = self.anonFilterValue;
              if (self.filterName) option[self.filterName] = self.filterValue;
            });
          }
        } catch (e) {
          console.log('error updating search.', e)
        }
        console.log('searchApiMasterOptions', ENVIRONMENT.getConfig('searchApiMasterOptions'))
        var UrlHelperLocal = UrlHelper;
        if (UrlHelperLocal.UrlHelper) UrlHelperLocal = UrlHelper.UrlHelper;
        if (UrlHelperLocal && UrlHelperLocal.setUrlParameter) {
          _(jQuery.ajaxSettings).extend({ // Ajax fix for Merchandising Zones delivered by CMS
            beforeSend: _(jQuery.ajaxSettings.beforeSend).wrap(function beforeSend(fn, jqXhr, options) {
              var urlOptions;

              if (/^\/api\/items/.test(options.url) || /^\/api\/cacheable\/items/.test(options.url)) {
                urlOptions = _(options.url).parseUrlOptions();
                if (_.isUndefined(urlOptions[self.filterName])) {
                  options.url = UrlHelperLocal.setUrlParameter(options.url, self.filterName, self.filterValue);
                }
                if (_.isUndefined(urlOptions[self.anonFilter]) && self.profile_model && !self.profile_model.isloggedin) {
                  options.url = UrlHelperLocal.setUrlParameter(options.url, self.anonFilter, self.anonFilterValue);
                }
                if (self.additionalFilterName && _.isUndefined(urlOptions[self.additionalFilterName])) {
                  options.url = UrlHelperLocal.setUrlParameter(options.url, self.additionalFilterName, self.additionalFilterValue);
                }
              }
              fn.apply(this, _(arguments).toArray().slice(1));
            })
          });
        }
      },

      rejectItemsFromRelatedItems: function (container) {
        var parent = this;
        try {
          var ItemRelationsRelatedView = require('ItemRelations.Related.View');
          if (ItemRelationsRelatedView.ItemRelationsRelatedView) ItemRelationsRelatedView = ItemRelationsRelatedView.ItemRelationsRelatedView;
          _.extend(ItemRelationsRelatedView.prototype, {
            initialze: _.wrap(ItemRelationsRelatedView.prototype.initialze, function (fn, options) {
              fn.apply(this, _.toArray(arguments).slice(1));
              var self = this;
              this.on('beforeViewRender', function () {
                if(self.collection) {
                  self.collection.models = _(self.collection.models).reject(function eachItem(item) {
                    return item.get(parent.filterName) !== self.normalizeFacetValue(parent.filterValue);
                  });
                  if (self.profile_model && !self.profile_model.isloggedin) {
                    self.collection.models = _(self.collection.models).reject(function eachItem(item) {
                      return item.get(parent.anonFilter) !== self.normalizeFacetValue(parent.anonFilterValue);
                    });
                  }
                  self.collection.models = _(self.collection.models).reject(function eachItem(item) {
                    return parent.additionalFilterName ? item.get(parent.additionalFilterName) !== self.normalizeFacetValue(parent.additionalFilterValue) : false;
                  });
                  self.collection.length = self.collection.models.length;
                }
              })
            })
          });
        } catch (e) {
          console.log('Error rejecting views', e);
        }
      },

      rejectHiddenItemsFromChildViews: function rejectHiddenItemsFromChildViews(childViewNames, viewToBeRendered, container) {
        var self        = this;
        if (viewToBeRendered) {
          viewToBeRendered.on('afterViewRender', function afterViewRender() {
            _(childViewNames || []).each(function eachChildViewName(childViewName) {
              var childView = viewToBeRendered.getChildViewInstance(childViewName);
              if (childView) {
                childView.on('beforeViewRender', function beforeViewRender() {
                  this.collection.models = _(this.collection.models).reject(function eachItem(item) {
                    return item.get(self.filterName) !== self.normalizeFacetValue(self.filterValue);
                  });
                  if (!self.profile_model.isloggedin) {
                    self.collection.models = _(this.collection.models).reject(function eachItem(item) {
                      return item.get(self.anonFilter) !== self.normalizeFacetValue(self.anonFilterValue);
                    });
                  }
                  this.collection.models = _(this.collection.models).reject(function eachItem(item) {
                    return self.additionalFilterName ? item.get(self.additionalFilterName) !== self.normalizeFacetValue(self.additionalFilterValue) : false;
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
