/// <amd-module name="SuiteCommerce.ProductComparison.ComparisonPage.Configuration"/>
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
define("SuiteCommerce.ProductComparison.ComparisonPage.Configuration", ["require", "exports", "SuiteCommerce.ProductComparison.Common.Configuration"], function (require, exports, Configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FieldType;
    (function (FieldType) {
        FieldType[FieldType["Text"] = 0] = "Text";
        FieldType[FieldType["Date"] = 1] = "Date";
        FieldType[FieldType["Check"] = 2] = "Check";
        FieldType[FieldType["Check/Cross"] = 3] = "Check/Cross";
        FieldType[FieldType["Image"] = 4] = "Image";
        FieldType[FieldType["Swatch"] = 5] = "Swatch";
        FieldType[FieldType["Link"] = 6] = "Link";
    })(FieldType = exports.FieldType || (exports.FieldType = {}));
    var ComparisonPageConfiguration = /** @class */ (function (_super) {
        __extends(ComparisonPageConfiguration, _super);
        function ComparisonPageConfiguration() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(ComparisonPageConfiguration, "queryParam", {
            get: function () {
                return this.QUERY_PARAM;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonPageConfiguration, "ratingLabel", {
            get: function () {
                return this.get('productcomparison.comparisonPageRatingLabel');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonPageConfiguration, "showPrice", {
            get: function () {
                return this.get('productcomparison.comparisonPageShowPrice');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonPageConfiguration, "priceLabel", {
            get: function () {
                return this.get('productcomparison.comparisonPagePriceLabel');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonPageConfiguration, "requireLoginForPricingMessage", {
            get: function () {
                return this.get('productcomparison.comparisonPageRequireLoginForPricingMessage');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonPageConfiguration, "showSKU", {
            get: function () {
                return this.get('productcomparison.comparisonPageShowSKU');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonPageConfiguration, "SKULabel", {
            get: function () {
                return this.get('productcomparison.comparisonPageSKULabel');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonPageConfiguration, "showAddToCartButton", {
            get: function () {
                return this.get('productcomparison.comparisonPageShowAddToCartButton');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonPageConfiguration, "addToCartButtonLabel", {
            get: function () {
                return this.get('productcomparison.comparisonPageAddToCartButtonLabel');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonPageConfiguration, "removeItemHelperText", {
            get: function () {
                return this.get('productcomparison.comparisonPageRemoveItemHelperText');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonPageConfiguration, "itemFields", {
            get: function () {
                return this.get('productcomparison.itemFields');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonPageConfiguration, "URL", {
            get: function () {
                return this.get('productcomparison.comparisonPageURL');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonPageConfiguration, "title", {
            get: function () {
                return this.get('productcomparison.comparisonPageTitle');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonPageConfiguration, "description", {
            get: function () {
                return this.get('productcomparison.comparisonPageDescription');
            },
            enumerable: true,
            configurable: true
        });
        ComparisonPageConfiguration.QUERY_PARAM = 'items';
        return ComparisonPageConfiguration;
    }(Configuration_1.Configuration));
    exports.ComparisonPageConfiguration = ComparisonPageConfiguration;
});
