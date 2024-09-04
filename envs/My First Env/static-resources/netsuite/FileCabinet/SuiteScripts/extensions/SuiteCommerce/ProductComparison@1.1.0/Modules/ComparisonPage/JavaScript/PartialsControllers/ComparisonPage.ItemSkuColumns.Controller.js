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
define("SuiteCommerce.ProductComparison.ComparisonPage.ItemSKUColumns.PartialController", ["require", "exports", "SuiteCommerce.ProductComparison.ComparisonPage.Partial.Controller", "comparison_page_item_sku_columns.partial.tpl"], function (require, exports, ComparisonPage_PartialController_1, PartialTemplate) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemSKUColumnsPartialController = /** @class */ (function (_super) {
        __extends(ItemSKUColumnsPartialController, _super);
        function ItemSKUColumnsPartialController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(ItemSKUColumnsPartialController.prototype, "template", {
            get: function () {
                return PartialTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemSKUColumnsPartialController.prototype, "partialName", {
            get: function () {
                return 'itemSKUColumns';
            },
            enumerable: true,
            configurable: true
        });
        ItemSKUColumnsPartialController.prototype.prepareHelpers = function () { };
        return ItemSKUColumnsPartialController;
    }(ComparisonPage_PartialController_1.PartialController));
    exports.ItemSKUColumnsPartialController = ItemSKUColumnsPartialController;
});
