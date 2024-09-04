/// <amd-module name="SuiteCommerce.ContactUsFormCCT"/>
define("SuiteCommerce.ContactUsFormCCT", ["require", "exports", "SuiteCommerce.ContactUsForm.Model", "SuiteCommerce.ContactUsForm.View", "underscore"], function (require, exports, ContactUsForm_Model_1, ContactUsForm_View_1, _) {
    "use strict";
    return {
        mountToApp: function (container) {
            var environment = container.getComponent('Environment');
            var model = new ContactUsForm_Model_1.ContactUsFormModel();
            model.set('defaultSubsidiary', this.getDefaultSubsidiary(environment));
            model.set('domain', this.getSCDomain(environment));
            container.getComponent('CMS').registerCustomContentType({
                id: 'cct_sc_contactusform',
                view: ContactUsForm_View_1.ContactUsFormView,
                options: {
                    container: container,
                    model: model,
                },
            });
        },
        getDefaultSubsidiary: function (environment) {
            var subsidiaries = environment.getSiteSetting().subsidiaries;
            var defaultSubsidiary = _.find(subsidiaries, function (subsidiary) {
                return subsidiary.isdefault === 'T';
            });
            return defaultSubsidiary.internalid;
        },
        getSCDomain: function (environment) {
            var homeUrl = environment.getConfig().siteSettings.touchpoints.home;
            var match = homeUrl.match(/:\/\/((?:www[0-9]?\.)?.[^/:]+)/i);
            if (match !== null && match.length === 2 && typeof match[1] === 'string' && match[1].length > 0) {
                return match[1];
            }
            return null;
        },
    };
});
