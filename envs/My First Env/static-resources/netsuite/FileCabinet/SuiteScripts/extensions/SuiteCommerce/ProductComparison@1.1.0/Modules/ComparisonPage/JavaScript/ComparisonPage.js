define("SuiteCommerce.ProductComparison.ComparisonPage", ["require", "exports", "SuiteCommerce.ProductComparison.ComparisonPage.Router"], function (require, exports, ComparisonPage_Router_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ComparisonPageModule = /** @class */ (function () {
        function ComparisonPageModule() {
        }
        ComparisonPageModule.mountToApp = function (container, storageCollection) {
            new ComparisonPage_Router_1.ComparisonPageRouter({ storageCollection: storageCollection, application: container, routes: {} });
        };
        return ComparisonPageModule;
    }());
    exports.ComparisonPageModule = ComparisonPageModule;
});
