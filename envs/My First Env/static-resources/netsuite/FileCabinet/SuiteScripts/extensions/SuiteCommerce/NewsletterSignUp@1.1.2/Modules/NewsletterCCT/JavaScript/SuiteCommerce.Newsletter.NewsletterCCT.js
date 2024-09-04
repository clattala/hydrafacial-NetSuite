/// <amd-module name="SuiteCommerce.Newsletter.NewsletterCCT"/>
define("SuiteCommerce.Newsletter.NewsletterCCT", ["require", "exports", "SuiteCommerce.Newsletter.Instrumentation.Helper", "SuiteCommerce.Newsletter.NewsletterCCT.View"], function (require, exports, Instrumentation_Helper_1, SuiteCommerce_Newsletter_NewsletterCCT_View_1) {
    "use strict";
    return {
        mountToApp: function (container) {
            Instrumentation_Helper_1.InstrumentationHelper.initializeInstrumentation(container);
            this.registerCCT(container);
        },
        registerCCT: function (container) {
            var cms = container.getComponent('CMS');
            cms.registerCustomContentType({
                id: 'cct_netsuite_newsletter',
                view: SuiteCommerce_Newsletter_NewsletterCCT_View_1.NewsletterCCTView,
                options: {
                    container: container,
                },
            });
        },
    };
});
