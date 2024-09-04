/*
 © 2022 Trevera
 Hides address buttons

 */

define('Trevera.MultiSite.Helpers'
  , [
    'MultiSite.ProfileFields.SS2Model',
    'Utils'
  ]
  , function (
    MultiSiteProfileFieldsSS2Model,
    Utils
  ) {
    'use strict';

    return {
      mountToApp: function mountToApp(container) {
        var LAYOUT      = container.getComponent('Layout'),
            PROFILE = container.getComponent('UserProfile');

        var self = this;
        this.profile;
        this.isLoading = true;
        this.multiSiteData = {};
        MultiSiteProfileFieldsSS2Model.getPromise().done(function (data) {
          console.log('multisite data: ', data);
          self.multiSiteData = data;
          if(data.isLoggedIn) {
            var domain = data.domain.domainName;
            if(domain != window.location.host) {
              LAYOUT.showMessage({
                type    : 'error',
                message : Utils.translate('You are currently viewing the wrong site. Please <a href="$(1)">click here</a> to go to the $(0) site.', self.multiSiteData.domain.siteName, 'https://'+self.multiSiteData.domain.domainName),
                selector: 'Message.Placeholder'
              })
            }
          }
          LAYOUT.cancelableTrigger('MultiSite:DataLoaded');
        })

        LAYOUT.on('afterShowContent', function () {
          if(self.multiSiteData.isLoggedIn) {
            var domain = self.multiSiteData.domain.domainName;
            if(domain != window.location.host) {
              LAYOUT.showMessage({
                type    : 'error',
                message : Utils.translate('You are currently viewing the wrong site. Please <a href="$(1)">click here</a> to go to the $(0) site.', self.multiSiteData.domain.siteName, 'https://'+self.multiSiteData.domain.domainName),
                selector: 'Message.Placeholder'
              })
            }
          }
        })

      }
    }
  });
