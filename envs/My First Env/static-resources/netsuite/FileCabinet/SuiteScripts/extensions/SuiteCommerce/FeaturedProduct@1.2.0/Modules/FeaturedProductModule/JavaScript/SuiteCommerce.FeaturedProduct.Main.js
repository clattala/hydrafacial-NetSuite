/// <amd-module name="SuiteCommerce.FeaturedProduct.Main"/>
define("SuiteCommerce.FeaturedProduct.Main", ["require", "exports", "SC.FeaturedProduct.Common.Configuration", "SuiteCommerce.FeaturedProduct.Common.InstrumentationHelper", "NetSuite.FeaturedProduct.FeaturedProductCCT", "SC.FeaturedProduct.Common.Utils"], function (require, exports, Common_Configuration_1, InstrumentationHelper_1, FeaturedProductCCT, Common_Utils_1) {
    "use strict";
    return {
        mountToApp: function (container) {
            var environment = container.getComponent('Environment');
            Common_Configuration_1.Configuration.environment = environment;
            var userProfile = container.getComponent('UserProfile');
            if (userProfile) {
                userProfile
                    .getUserProfile()
                    .then(function (userProfileData) {
                    Common_Utils_1.default.userProfileData = userProfileData;
                });
            }
            InstrumentationHelper_1.InstrumentationHelper.initializeInstrumentation(environment);
            FeaturedProductCCT.mountToApp(container);
        },
    };
});
