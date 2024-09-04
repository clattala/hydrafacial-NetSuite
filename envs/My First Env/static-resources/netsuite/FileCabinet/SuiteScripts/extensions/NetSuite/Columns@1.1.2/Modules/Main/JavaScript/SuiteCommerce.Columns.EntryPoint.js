/// <amd-module name="SuiteCommerce.Columns.EntryPoint"/>
define("SuiteCommerce.Columns.EntryPoint", ["require", "exports", "SuiteCommerce.Columns.ColumnsCCT", "SuiteCommerce.Columns.Common.InstrumentationHelper"], function (require, exports, ColumnsCCT, InstrumentationHelper_1) {
    "use strict";
    return {
        mountToApp: function (container) {
            InstrumentationHelper_1.InstrumentationHelper.initializeInstrumentation(container.getComponent('Environment'));
            ColumnsCCT.mountToApp(container);
        },
    };
});
