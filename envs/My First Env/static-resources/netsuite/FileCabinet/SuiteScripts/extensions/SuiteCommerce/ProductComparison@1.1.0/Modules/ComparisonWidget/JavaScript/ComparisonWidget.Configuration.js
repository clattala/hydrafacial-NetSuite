/// <amd-module name="SuiteCommerce.ProductComparison.ComparisonWidget.Configuration"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("SuiteCommerce.ProductComparison.ComparisonWidget.Configuration", ["require", "exports", "SuiteCommerce.ProductComparison.Common.Configuration"], function (require, exports, Configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ComparisonWidgetConfiguration = /** @class */ (function (_super) {
        __extends(ComparisonWidgetConfiguration, _super);
        function ComparisonWidgetConfiguration() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(ComparisonWidgetConfiguration, "addToCompareLabel", {
            get: function () {
                return this.get('productcomparison.addToCompareLabel');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonWidgetConfiguration, "excessInItemsAllowedMessage", {
            get: function () {
                return this.get('productcomparison.excessInItemsAllowedMessage');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonWidgetConfiguration, "compareButtonLabel", {
            get: function () {
                return this.get('productcomparison.compareButtonLabel');
            },
            enumerable: true,
            configurable: true
        });
        return ComparisonWidgetConfiguration;
    }(Configuration_1.Configuration));
    exports.ComparisonWidgetConfiguration = ComparisonWidgetConfiguration;
});
