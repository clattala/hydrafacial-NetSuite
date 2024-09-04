/// <amd-module name="SuiteCommerce.ProductComparison.Common.InstrumentationHelper"/>
define("SuiteCommerce.ProductComparison.Common.InstrumentationHelper", ["require", "exports", "SuiteCommerce.ProductComparison.Instrumentation"], function (require, exports, Instrumentation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var QueueNameSuffix = '-ProductComparison';
    var ExtensionVersion = '1.1.0';
    var ComponentArea = 'SC Product Comparison';
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
                }
            });
        };
        return InstrumentationHelper;
    }());
    exports.InstrumentationHelper = InstrumentationHelper;
});
