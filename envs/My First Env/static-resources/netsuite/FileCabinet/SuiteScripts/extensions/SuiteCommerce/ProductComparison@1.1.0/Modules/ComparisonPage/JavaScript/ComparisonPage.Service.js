/// <amd-module name="SuiteCommerce.ProductComparison.ComparisonPage.Commons"/>
define("SuiteCommerce.ProductComparison.ComparisonPage.Commons", ["require", "exports", "Backbone", "SuiteCommerce.ProductComparison.ComparisonPage.Configuration"], function (require, exports, Backbone_1, ComparisonPage_Configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ComparisonPageService = /** @class */ (function () {
        function ComparisonPageService() {
        }
        ComparisonPageService.navigateToComparisonPage = function (itemIds) {
            Backbone_1.history.navigate(this.getUrlToNavigateToComparisonPageWithItemList(itemIds), { trigger: true });
        };
        ComparisonPageService.navigateToComparisonPageWithoutRender = function (itemIds) {
            Backbone_1.history.navigate(this.getUrlToNavigateToComparisonPageWithItemList(itemIds), { trigger: false });
        };
        ComparisonPageService.getUrlToNavigateToComparisonPageWithItemList = function (itemsIds) {
            return ComparisonPage_Configuration_1.ComparisonPageConfiguration.URL + "?" + ComparisonPage_Configuration_1.ComparisonPageConfiguration.queryParam + "=" + itemsIds;
        };
        ComparisonPageService.updateItemsInLocalStorage = function (localStorageCollection, itemCollection) {
            localStorageCollection.reset();
            itemCollection.each(function (itemModel) {
                // @ts-ignore
                localStorageCollection.add({
                    internalid: itemModel.internalId,
                    thumbnail: itemModel.thumbnail,
                    name: itemModel.name,
                });
            });
        };
        return ComparisonPageService;
    }());
    exports.ComparisonPageService = ComparisonPageService;
});
