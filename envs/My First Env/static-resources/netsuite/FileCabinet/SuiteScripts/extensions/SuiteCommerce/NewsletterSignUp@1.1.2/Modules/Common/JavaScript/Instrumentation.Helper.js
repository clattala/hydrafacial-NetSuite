/// <amd-module name="SuiteCommerce.Newsletter.Instrumentation.Helper"/>
define("SuiteCommerce.Newsletter.Instrumentation.Helper", ["require", "exports", "SuiteCommerce.Newsletter.Instrumentation"], function (require, exports, Instrumentation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ComponentArea = 'SC Newsletter Sign Up';
    var ExtensionVersion = '1.1.2';
    var QueueNameSuffix = '-Newsletter';
    var InstrumentationHelper = /** @class */ (function () {
        function InstrumentationHelper() {
        }
        InstrumentationHelper.initializeInstrumentation = function (container) {
            Instrumentation_1.default.initialize({
                environment: container.getComponent('Environment'),
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
