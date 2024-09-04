/// <amd-module name="SuiteCommerce.ProductComparison.PLP"/>
define("SuiteCommerce.ProductComparison.PLP", ["require", "exports", "SuiteCommerce.ProductComparison.PLP.View", "SuiteCommerce.ProductComparison.ComparisonWidget.View"], function (require, exports, PLP_View_1, ComparisonWidget_View_1) {
    "use strict";
    return {
        mountToApp: function (container, storageCollection) {
            if (container.getComponent('PLP')) {
                var PLPComponent = container.getComponent('PLP');
                PLPComponent.addChildView('ItemDetails.Options', function () {
                    return new PLP_View_1.PLPView({ itemsToCompare: storageCollection });
                });
                PLPComponent.addChildView('GlobalViews.Pagination', function () {
                    return new ComparisonWidget_View_1.ComparisonWidgetView({ itemsToCompare: storageCollection });
                });
            }
        },
    };
});
