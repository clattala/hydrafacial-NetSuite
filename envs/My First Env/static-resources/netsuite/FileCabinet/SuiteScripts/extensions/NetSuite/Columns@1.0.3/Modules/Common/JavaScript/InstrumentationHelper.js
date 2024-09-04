/// <amd-module name="SuiteCommerce.Columns.Common.InstrumentationHelper"/>
define("SuiteCommerce.Columns.Common.InstrumentationHelper", ["require", "exports", "SuiteCommerce.Columns.Instrumentation"], function (require, exports, Instrumentation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var QueueNameSuffix = '-Columns';
    var ExtensionVersion = '1.0.2';
    var ComponentArea = 'SC Columns';
    var InstrumentationHelper = /** @class */ (function () {
        function InstrumentationHelper() {
        }
        InstrumentationHelper.initializeInstrumentation = function (environment) {
            Instrumentation_1.default.initialize({
                environment: environment,
                queueNameSuffix: QueueNameSuffix,
                defaultParameters: {
                    componentArea: ComponentArea,
                    extensionVersion: ExtensionVersion,
                },
            });
        };
        return InstrumentationHelper;
    }());
    exports.InstrumentationHelper = InstrumentationHelper;
});
