/// <amd-module name="SuiteCommerce.ProductComparison.StorageHelper"/>
define("SuiteCommerce.ProductComparison.StorageHelper", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var StorageHelper = /** @class */ (function () {
        function StorageHelper() {
        }
        StorageHelper.load = function (key) {
            var elements = [];
            if (localStorage && localStorage.getItem(key)) {
                try {
                    elements = JSON.parse(localStorage.getItem(key));
                }
                catch (e) {
                    // eslint-disable-next-line no-console
                    console.warn(e);
                }
            }
            return elements;
        };
        StorageHelper.save = function (key, data) {
            if (localStorage) {
                try {
                    localStorage.setItem(key, JSON.stringify(data));
                }
                catch (e) {
                    // eslint-disable-next-line no-console
                    console.warn(e);
                }
            }
        };
        return StorageHelper;
    }());
    exports.StorageHelper = StorageHelper;
});
