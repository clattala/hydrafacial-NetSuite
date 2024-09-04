/// <amd-module name="SuiteCommerce.ProductComparison.ComparisonPage.Router"/>
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
define("SuiteCommerce.ProductComparison.ComparisonPage.Router", ["require", "exports", "Backbone", "underscore", "SuiteCommerce.ProductComparison.Instrumentation", "SuiteCommerce.ProductComparison.Item.Collection", "SuiteCommerce.ProductComparison.ComparisonPage.Commons", "SuiteCommerce.ProductComparison.ComparisonPage.View", "SuiteCommerce.ProductComparison.ComparisonPage.Configuration"], function (require, exports, Backbone_1, _, Instrumentation_1, Item_Collection_1, ComparisonPage_Service_1, ComparisonPage_View_1, ComparisonPage_Configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ComparisonPageRouter = /** @class */ (function (_super) {
        __extends(ComparisonPageRouter, _super);
        function ComparisonPageRouter(options) {
            var _this = _super.call(this, options) || this;
            _this.application = options.application;
            _this.itemsToCompareInStorage = options.storageCollection;
            _this.environment = _this.application.getComponent('Environment');
            return _this;
        }
        Object.defineProperty(ComparisonPageRouter.prototype, "routes", {
            get: function () {
                var dynamicRoutes = {};
                dynamicRoutes[ComparisonPage_Configuration_1.ComparisonPageConfiguration.URL + "(/)"] = 'openComparisonPage';
                dynamicRoutes[ComparisonPage_Configuration_1.ComparisonPageConfiguration.URL + "(?queryString)"] = 'openComparisonPage';
                return dynamicRoutes;
            },
            enumerable: true,
            configurable: true
        });
        ComparisonPageRouter.prototype.openComparisonPage = function (queryString) {
            var decodedQueryString = decodeURIComponent(queryString);
            if (queryString) {
                if (decodedQueryString !== queryString) {
                    Backbone_1.history.navigate(ComparisonPage_Configuration_1.ComparisonPageConfiguration.URL + "?" + decodedQueryString, { trigger: false, replace: true });
                }
                this.openComparisonPageByQueryString(decodedQueryString);
            }
            else {
                this.openComparisonPageInBlank();
            }
        };
        ComparisonPageRouter.prototype.openComparisonPageByQueryString = function (queryString) {
            var _this = this;
            var comparisonPageView;
            var existItemQueryParam = this.existQueryParam(queryString, ComparisonPage_Configuration_1.ComparisonPageConfiguration.queryParam);
            if (existItemQueryParam) {
                var itemsIds_1 = this.parseQueryStringByParam(queryString, ComparisonPage_Configuration_1.ComparisonPageConfiguration.queryParam);
                if (itemsIds_1.length === 0) {
                    return this.openComparisonPageInBlank();
                }
                if (existItemQueryParam && queryString.split('&').length > 1) {
                    return ComparisonPage_Service_1.ComparisonPageService.navigateToComparisonPage(itemsIds_1);
                }
                this.removeExcessItems(itemsIds_1);
                this.removeDuplicatedItems(itemsIds_1);
                var items_1 = new Item_Collection_1.ItemCollection({
                    environment: this.environment,
                    ids: itemsIds_1,
                });
                comparisonPageView = new ComparisonPage_View_1.ComparisonPageView({
                    items: items_1,
                    application: this.application,
                    itemsToCompareInStorage: this.itemsToCompareInStorage,
                });
                items_1.fetch()
                    .done(function () {
                    var selectedMatrixChildItems = _this.getSelectedMatrixChildItems(items_1);
                    if (items_1.length !== itemsIds_1.length) {
                        return ComparisonPage_Service_1.ComparisonPageService.navigateToComparisonPage(items_1.pluck('internalid'));
                    }
                    items_1 = _this.getItemsSortedByQueryStringOrder(items_1);
                    if (selectedMatrixChildItems.length > 0) {
                        return _this.navigateToComparisonPageReplacingChildren(items_1);
                    }
                    ComparisonPage_Service_1.ComparisonPageService.updateItemsInLocalStorage(_this.itemsToCompareInStorage, items_1);
                    _this.registerLogForComparison(items_1.length);
                    return comparisonPageView.showContent();
                })
                    .fail(function () {
                    // Defers invoking the function until the current call stack has cleared
                    // in order to avoid error messages rendered in the Global.View.Messages View
                    _.defer(function () {
                        // eslint-disable-next-line no-console
                        console.warn('Unexpected error searching items.');
                        return ComparisonPage_Service_1.ComparisonPageService.navigateToComparisonPage([]);
                    });
                });
                return null;
            }
            return ComparisonPage_Service_1.ComparisonPageService.navigateToComparisonPage([]);
        };
        ComparisonPageRouter.prototype.existQueryParam = function (queryString, paramName) {
            var queryParamNames = [];
            _.each(queryString.split('&'), function (queryParam) {
                queryParamNames.push(queryParam.split('=')[0]);
            });
            return queryParamNames.indexOf(paramName) !== -1;
        };
        ComparisonPageRouter.prototype.removeExcessItems = function (itemsIds) {
            if (itemsIds.length > this.itemsToCompareInStorage.maxLength) {
                return ComparisonPage_Service_1.ComparisonPageService.navigateToComparisonPage(itemsIds.slice(0, this.itemsToCompareInStorage.maxLength));
            }
        };
        ComparisonPageRouter.prototype.removeDuplicatedItems = function (itemsIds) {
            var itemsIdsUnrepeated = _.uniq(itemsIds);
            if (itemsIds.length !== itemsIdsUnrepeated.length) {
                return ComparisonPage_Service_1.ComparisonPageService.navigateToComparisonPage(itemsIdsUnrepeated);
            }
        };
        ComparisonPageRouter.prototype.registerLogForComparison = function (quantityOfItems) {
            var registerComparisonLog = Instrumentation_1.default.getLog('registerComparisonLog');
            registerComparisonLog.setParameters({
                componentArea: 'SC Product Comparison',
                activity: 'Item Comparison',
                quantity: quantityOfItems,
            });
            registerComparisonLog.submit();
        };
        ComparisonPageRouter.prototype.getItemsSortedByQueryStringOrder = function (items) {
            var itemsWrapper = items;
            var newModelArray = [];
            var originalSortArray = itemsWrapper.ids;
            _.each(originalSortArray, function (itemId) {
                newModelArray.push(items.get(itemId));
            });
            itemsWrapper.models = newModelArray;
            return itemsWrapper;
        };
        ComparisonPageRouter.prototype.navigateToComparisonPageReplacingChildren = function (items) {
            var parentIds = [];
            items.each(function (item) {
                if (item.isMatrixChild) {
                    parentIds.push(item.get('itemoptions_detail').parentid);
                }
                else {
                    parentIds.push(item.internalId);
                }
            });
            if (typeof nsglobal !== 'undefined') {
                // eslint-disable-next-line no-undef
                nsglobal.statusCode = 301;
                // eslint-disable-next-line no-undef
                nsglobal.location = ComparisonPage_Service_1.ComparisonPageService.getUrlToNavigateToComparisonPageWithItemList();
            }
            else {
                ComparisonPage_Service_1.ComparisonPageService.navigateToComparisonPage(parentIds);
            }
        };
        ComparisonPageRouter.prototype.parseQueryStringByParam = function (queryString, paramName) {
            var paramValue;
            _.each(queryString.split('&'), function (param) {
                if (param.split('=')[0] === paramName) {
                    paramValue = param.split('=')[1] || '';
                }
            });
            return (paramValue) ? paramValue.split(',') : [];
        };
        ComparisonPageRouter.prototype.getSelectedMatrixChildItems = function (items) {
            return items.filter(function (item) {
                return item.isMatrixChild;
            });
        };
        ComparisonPageRouter.prototype.openComparisonPageInBlank = function () {
            var items = new Item_Collection_1.ItemCollection({
                environment: this.environment,
                ids: [],
            });
            var comparisonPageView = new ComparisonPage_View_1.ComparisonPageView({
                items: items,
                application: this.application,
                itemsToCompareInStorage: this.itemsToCompareInStorage,
            });
            ComparisonPage_Service_1.ComparisonPageService.updateItemsInLocalStorage(this.itemsToCompareInStorage, items);
            comparisonPageView.showContent();
        };
        return ComparisonPageRouter;
    }(Backbone_1.Router));
    exports.ComparisonPageRouter = ComparisonPageRouter;
});
