/// <amd-module name="SuiteCommerce.ProductComparison.Common.Configuration"/>
define("SuiteCommerce.ProductComparison.Common.Configuration", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var environment = null;
    var Configuration = /** @class */ (function () {
        function Configuration() {
        }
        Object.defineProperty(Configuration, "environment", {
            set: function (environmentComponent) {
                environment = environmentComponent;
            },
            enumerable: true,
            configurable: true
        });
        Configuration.get = function (key, defaultValue) {
            if (environment) {
                return environment.getConfig(key);
            }
            console.error('Please set the Environment Component in the Configuration.');
            return null;
        };
        Object.defineProperty(Configuration, "productReviewsMaxRate", {
            get: function () {
                return this.get('productReviews.maxRate', 5);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Configuration, "productReviews", {
            get: function () {
                return this.get('productReviews');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Configuration, "showRating", {
            get: function () {
                return this.get('productcomparison.comparisonPageShowRating');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Configuration, "itemOptions", {
            get: function () {
                return this.get('ItemOptions');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Configuration, "layout", {
            get: function () {
                return this.get('layout');
            },
            enumerable: true,
            configurable: true
        });
        return Configuration;
    }());
    exports.Configuration = Configuration;
});
