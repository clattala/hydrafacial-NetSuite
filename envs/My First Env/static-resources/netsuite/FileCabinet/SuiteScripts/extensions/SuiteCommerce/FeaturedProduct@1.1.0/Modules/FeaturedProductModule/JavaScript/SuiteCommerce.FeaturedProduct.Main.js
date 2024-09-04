/// <amd-module name="SuiteCommerce.FeaturedProduct.Main"/>
define("SuiteCommerce.FeaturedProduct.Main", ["require", "exports", "SC.FeaturedProduct.Common.Configuration", "SuiteCommerce.FeaturedProduct.Common.InstrumentationHelper", "NetSuite.FeaturedProduct.FeaturedProductCCT"], function (require, exports, Common_Configuration_1, InstrumentationHelper_1, FeaturedProductCCT) {
    "use strict";
    return {
        mountToApp: function (container) {
            var environment = container.getComponent('Environment');
            Common_Configuration_1.Configuration.environment = environment;
            InstrumentationHelper_1.InstrumentationHelper.initializeInstrumentation(environment);
            FeaturedProductCCT.mountToApp(container);
        },
    };
});
