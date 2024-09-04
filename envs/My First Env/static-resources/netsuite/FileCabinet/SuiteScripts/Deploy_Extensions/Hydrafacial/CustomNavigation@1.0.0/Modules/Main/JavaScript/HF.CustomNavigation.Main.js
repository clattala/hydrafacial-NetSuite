define('HF.CustomNavigation.Main'
  , [
    'underscore'
  ]
  , function (
    _
  ) {
    'use strict';

    function mapNavigationItems(navItems, permissions, website) {
      return _.map(navItems, function (item) {
        //console.log(item)
        _.each(item.categories, function (category) {
          filterSubItems(category, permissions, website)
          if (category.categories) {
            _.each(category.categories, function (subcategory) {
              filterSubItems(subcategory, permissions, website);
            })
          }
        });
      });
    }

    function filterSubItems(subItem, permissions, website) {
      var includeItem = false;
      if (subItem.website && subItem.website.length > 0) {
        var websiteIds = _.pluck(subItem.website, 'value');
        console.log(websiteIds);
        if (websiteIds.indexOf(website.toString())) includeItem = true;
      }
      var inArr        = [];
      subItem.subItems = _.filter(subItem.subItems, function (i) {
        if (inArr.indexOf(i.text) < 0) {
          inArr.push(i.text);
          return true;
        }
        return false;
      });
      subItem.subItems = _.filter(subItem.subItems, function (i) {
        var linkPermission = i.permissions && i.permissions.split(',') || [];
        if (linkPermission.length === 0) return true;
        return _.intersection(permissions, linkPermission).length > 0
      });
      subItem.subItems = _.filter(subItem.subItems, function (i) {
        var websiteIds = i.website && i.website.length > 0 ? _.pluck(i.website, 'value') : [];
        if (websiteIds.length > 0) return websiteIds.indexOf(website.toString());
        return true;
      });
      return subItem
    }

    var _permissionField = 'custentity_ecomm_channel';

    return {
      mountToApp: function mountToApp(container) {
        var self               = this;
        // get the published data object
        var hfCustomNavigation = SC.ENVIRONMENT.published.HFCustomNavigation;


        var PROFILE     = container.getComponent('UserProfile');
        var LAYOUT      = container.getComponent('Layout');
        var ENVIRONMENT = container.getComponent('Environment');
        var website     = ENVIRONMENT.getConfig('siteSettings.id')
        this.profile;

        // get the user's data
        PROFILE.getUserProfile().then(function (data) {
          self.profile = data;
        });

        if (LAYOUT) {
          /**
           * map the custom object into a format for consumption in menus.
           * header_menu.tpl and sidebar_menu.tpl need updates in the theme.
           * */
          LAYOUT.addToViewContextDefinition(
            'Header.Menu.View'
            , 'hfExtras'
            , 'object'
            , function hfExtras(context) {
              if (hfCustomNavigation) {
                // get permissions
                var customFields        = self.profile && self.profile.customfields;
                var permissionField     = _.find(customFields, {id: _permissionField}) || {value: ''};
                var customerPermissions = permissionField && permissionField.value && permissionField.value.split(',') || [];

                var hfNavJSON = {};
                try {
                  hfNavJSON = JSON.parse(hfCustomNavigation);
                } catch (e) {
                  return {
                    overrideAllNav: false
                  }
                }

                var navData = _.filter(hfNavJSON['navigation'], function (navItem) {
                  var includeItem = false;
                  if (navItem.website && navItem.website.length > 0) {
                    var websiteIds = _.pluck(navItem.website, 'text');
                    if (websiteIds.indexOf(location.host) > -1) includeItem = true;
                  }
                  if (navItem.permission && navItem.permission.length > 0) {
                    var permissions = _.pluck(navItem.permission, 'value');
                    var hasPermissions = _.intersection(permissions, customerPermissions)
                    includeItem = hasPermissions.length > 0
                  }
                  if (includeItem) return navItem;
                })
                navData     = _.map(navData, function (navItem) {
                  _.each(navItem.subItems, function (subItem) {
                    subItem.subItems = mapNavigationItems(hfCustomNavigation, customerPermissions, website);
                  })
                  return navItem;
                });
                return {
                  categories    : navData,
                  overrideAllNav: true
                }
              }

              return {
                overrideAllNav: false
              }
            });
        }

      }
    };
  });
