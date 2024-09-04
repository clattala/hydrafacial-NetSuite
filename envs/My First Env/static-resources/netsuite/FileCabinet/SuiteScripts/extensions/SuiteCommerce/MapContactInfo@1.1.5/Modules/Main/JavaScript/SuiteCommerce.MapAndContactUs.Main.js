/// <amd-module name="SuiteCommerce.MapAndContactUs.Main"/>
define("SuiteCommerce.MapAndContactUs.Main", ["require", "exports", "SuiteCommerce.MapAndContactInfoCCT", "SuiteCommerce.ContactUsFormCCT", "SuiteCommerce.MapAndContactUs.Common.Instrumentation.Helper"], function (require, exports, MapAndContactInfoCCT, ContactUsFormCCT, Instrumentation_Helper_1) {
    "use strict";
    return {
        mountToApp: function (container) {
            Instrumentation_Helper_1.InstrumentationHelper.initializeInstrumentation(container);
            MapAndContactInfoCCT.mountToApp(container);
            ContactUsFormCCT.mountToApp(container);
        },
    };
});
