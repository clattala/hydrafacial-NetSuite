/// <amd-module name="SuiteCommerce.Newsletter.Main.Module"/>
define("SuiteCommerce.Newsletter.Main.Module", ["require", "exports", "SuiteCommerce.Newsletter.NewsletterCCT"], function (require, exports, NewsletterCCT) {
    "use strict";
    return {
        mountToApp: function (container) {
            NewsletterCCT.mountToApp(container);
        },
    };
});
