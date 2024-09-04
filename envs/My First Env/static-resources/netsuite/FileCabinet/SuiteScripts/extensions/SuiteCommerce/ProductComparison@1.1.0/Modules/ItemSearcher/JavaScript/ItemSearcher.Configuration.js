/// <amd-module name="SuiteCommerce.ProductComparison.ItemSearcher.Configuration"/>
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
define("SuiteCommerce.ProductComparison.ItemSearcher.Configuration", ["require", "exports", "SuiteCommerce.ProductComparison.Common.Configuration"], function (require, exports, Configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemSearcherConfiguration = /** @class */ (function (_super) {
        __extends(ItemSearcherConfiguration, _super);
        function ItemSearcherConfiguration() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(ItemSearcherConfiguration, "comparisonPageItemSearchLabel", {
            get: function () {
                return this.get('productcomparison.comparisonPageItemSearchLabel');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemSearcherConfiguration, "comparisonPageItemSearchPlaceholder", {
            get: function () {
                return this.get('productcomparison.comparisonPageItemSearchPlaceholder');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemSearcherConfiguration, "comparisonPageItemSearchHelper", {
            get: function () {
                return this.get('productcomparison.comparisonPageItemSearchHelper');
            },
            enumerable: true,
            configurable: true
        });
        return ItemSearcherConfiguration;
    }(Configuration_1.Configuration));
    exports.ItemSearcherConfiguration = ItemSearcherConfiguration;
});
