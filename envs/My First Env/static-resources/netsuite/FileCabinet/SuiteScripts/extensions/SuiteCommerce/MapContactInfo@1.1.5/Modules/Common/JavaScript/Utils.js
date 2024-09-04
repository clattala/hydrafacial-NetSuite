/// <amd-module name="SuiteCommerce.MapAndContactUs.Utils"/>
define("SuiteCommerce.MapAndContactUs.Utils", ["require", "exports", "SuiteCommerce.MapAndContactUs.Common.DependencyProvider"], function (require, exports, DependencyProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Utils = /** @class */ (function () {
        function Utils() {
        }
        Utils.getAbsoluteUrl = function (file, isServices2) {
            return DependencyProvider_1.UtilsModule.getAbsoluteUrl(file, isServices2);
        };
        return Utils;
    }());
    exports.Utils = Utils;
});
