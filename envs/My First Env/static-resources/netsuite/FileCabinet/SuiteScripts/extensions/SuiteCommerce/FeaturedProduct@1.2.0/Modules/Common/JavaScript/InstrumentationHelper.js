/// <amd-module name="SuiteCommerce.FeaturedProduct.Common.InstrumentationHelper"/>
define("SuiteCommerce.FeaturedProduct.Common.InstrumentationHelper", ["require", "exports", "SuiteCommerce.FeaturedProduct.Instrumentation"], function (require, exports, Instrumentation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var QueueNameSuffix = '-FeaturedProduct';
    var ExtensionVersion = '1.2.0';
    var ComponentArea = 'Featured Product';
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
        InstrumentationHelper.log = function (parameters) {
            var log = Instrumentation_1.default.getLog(parameters.activity.replace(' ', ''));
            log.setParameters(parameters);
            log.submit();
        };
        return InstrumentationHelper;
    }());
    exports.InstrumentationHelper = InstrumentationHelper;
});
