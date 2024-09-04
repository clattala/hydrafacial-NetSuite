/// <amd-module name="SuiteCommerce.MapAndContactUs.Common.Instrumentation.Helper"/>
define("SuiteCommerce.MapAndContactUs.Common.Instrumentation.Helper", ["require", "exports", "SuiteCommerce.MapAndContactUs.Instrumentation"], function (require, exports, Instrumentation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ComponentArea = 'SC Map and Contact';
    var ExtensionVersion = '1.1.5';
    var QueueNameSuffix = '-MapAndContact';
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
