define("SuiteCommerce.ProductComparison.ComparisonPage.PartialsCatalog", ["require", "exports", "SuiteCommerce.ProductComparison.ComparisonPage.ComparisonRows.PartialController", "SuiteCommerce.ProductComparison.ComparisonPage.ItemActionsColumns.PartialController", "SuiteCommerce.ProductComparison.ComparisonPage.ItemNameColumns.PartialController", "SuiteCommerce.ProductComparison.ComparisonPage.ItemPriceColumns.PartialController", "SuiteCommerce.ProductComparison.ComparisonPage.ItemReviewColumns.PartialController", "SuiteCommerce.ProductComparison.ComparisonPage.ItemSKUColumns.PartialController", "SuiteCommerce.ProductComparison.ComparisonPage.ItemThumbnailColumns.PartialController", "SuiteCommerce.ProductComparison.ComparisonPage.ItemValueColumn.PartialController", "SuiteCommerce.ProductComparison.ComparisonPage.FieldValueSwatch.PartialController", "SuiteCommerce.ProductComparison.ComparisonPage.FieldValueText.PartialController", "SuiteCommerce.ProductComparison.ComparisonPage.FieldValueDate.PartialController", "SuiteCommerce.ProductComparison.ComparisonPage.FieldValueCheck.PartialController", "SuiteCommerce.ProductComparison.ComparisonPage.FieldValueImage.PartialController", "SuiteCommerce.ProductComparison.ComparisonPage.FieldValueLink.PartialController"], function (require, exports, ComparisonPage_ComparisonRows_Controller_1, ComparisonPage_ItemActionsColumns_Controller_1, ComparisonPage_ItemNameColumns_Controller_1, ComparisonPage_ItemPriceColumns_Controller_1, ComparisonPage_ItemReviewColumns_Controller_1, ComparisonPage_ItemSkuColumns_Controller_1, ComparisonPage_ItemThumbnailColumns_Controller_1, ComparisonPage_ItemValueColumns_Controller_1, ComparisonPage_FieldValueSwatch_Controller_1, ComparisonPage_FieldValueText_Controller_1, ComparisonPage_FieldValueDate_Controller_1, ComparisonPage_FieldValueCheck_Controller_1, ComparisonPage_FieldValueImage_Controller_1, ComparisonPage_FieldValueLink_Controller_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PartialsCatalog = /** @class */ (function () {
        function PartialsCatalog() {
        }
        PartialsCatalog.initializePartials = function () {
            new ComparisonPage_ComparisonRows_Controller_1.ComparisonRowsPartialController();
            new ComparisonPage_ItemActionsColumns_Controller_1.ItemActionsColumnsPartialController();
            new ComparisonPage_ItemNameColumns_Controller_1.ItemNameColumnsPartialController();
            new ComparisonPage_ItemPriceColumns_Controller_1.ItemPriceColumnsPartialController();
            new ComparisonPage_ItemReviewColumns_Controller_1.ItemReviewColumnsPartialController();
            new ComparisonPage_ItemSkuColumns_Controller_1.ItemSKUColumnsPartialController();
            new ComparisonPage_ItemThumbnailColumns_Controller_1.ItemThumbnailColumnsPartialController();
            new ComparisonPage_ItemValueColumns_Controller_1.ItemValueColumnPartialController();
            new ComparisonPage_FieldValueSwatch_Controller_1.FieldValueSwatchPartialController();
            new ComparisonPage_FieldValueText_Controller_1.FieldValueTextPartialController();
            new ComparisonPage_FieldValueDate_Controller_1.FieldValueDatePartialController();
            new ComparisonPage_FieldValueCheck_Controller_1.FieldValueCheckPartialController();
            new ComparisonPage_FieldValueImage_Controller_1.FieldValueImagePartialController();
            new ComparisonPage_FieldValueLink_Controller_1.FieldValueLinkPartialController();
        };
        return PartialsCatalog;
    }());
    exports.PartialsCatalog = PartialsCatalog;
});
