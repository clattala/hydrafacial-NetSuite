/// <amd-module name="SuiteCommerce.ProductComparison.ComparisonPage.ItemPriceColumns.PartialController"/>
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
define("SuiteCommerce.ProductComparison.ComparisonPage.ItemPriceColumns.PartialController", ["require", "exports", "SuiteCommerce.ProductComparison.ComparisonPage.Partial.Controller", "SuiteCommerce.ProductComparison.Common.DependencyProvider", "comparison_page_item_price_columns.partial.tpl"], function (require, exports, ComparisonPage_PartialController_1, DependencyProvider_1, PartialTemplate) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemPriceColumnsPartialController = /** @class */ (function (_super) {
        __extends(ItemPriceColumnsPartialController, _super);
        function ItemPriceColumnsPartialController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(ItemPriceColumnsPartialController.prototype, "template", {
            get: function () {
                return PartialTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemPriceColumnsPartialController.prototype, "partialName", {
            get: function () {
                return 'itemPriceColumns';
            },
            enumerable: true,
            configurable: true
        });
        ItemPriceColumnsPartialController.prototype.prepareHelpers = function () {
            var _this = this;
            this.helpers = [
                {
                    name: 'isEnabledLoginToSeePrice',
                    helperAction: function () {
                        return _this.isEnabledLoginToSeePrice();
                    },
                },
            ];
        };
        ItemPriceColumnsPartialController.prototype.isEnabledLoginToSeePrice = function () {
            return DependencyProvider_1.ProfileModel.getInstance().hidePrices();
        };
        return ItemPriceColumnsPartialController;
    }(ComparisonPage_PartialController_1.PartialController));
    exports.ItemPriceColumnsPartialController = ItemPriceColumnsPartialController;
});
