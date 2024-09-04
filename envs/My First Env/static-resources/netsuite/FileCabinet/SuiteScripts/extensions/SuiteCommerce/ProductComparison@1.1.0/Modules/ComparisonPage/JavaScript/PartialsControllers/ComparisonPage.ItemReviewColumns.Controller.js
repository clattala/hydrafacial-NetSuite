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
define("SuiteCommerce.ProductComparison.ComparisonPage.ItemReviewColumns.PartialController", ["require", "exports", "SuiteCommerce.ProductComparison.ComparisonPage.Partial.Controller", "comparison_page_item_review_columns.partial.tpl"], function (require, exports, ComparisonPage_PartialController_1, PartialTemplate) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemReviewColumnsPartialController = /** @class */ (function (_super) {
        __extends(ItemReviewColumnsPartialController, _super);
        function ItemReviewColumnsPartialController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(ItemReviewColumnsPartialController.prototype, "template", {
            get: function () {
                return PartialTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemReviewColumnsPartialController.prototype, "partialName", {
            get: function () {
                return 'itemReviewColumns';
            },
            enumerable: true,
            configurable: true
        });
        ItemReviewColumnsPartialController.prototype.prepareHelpers = function () { };
        return ItemReviewColumnsPartialController;
    }(ComparisonPage_PartialController_1.PartialController));
    exports.ItemReviewColumnsPartialController = ItemReviewColumnsPartialController;
});
