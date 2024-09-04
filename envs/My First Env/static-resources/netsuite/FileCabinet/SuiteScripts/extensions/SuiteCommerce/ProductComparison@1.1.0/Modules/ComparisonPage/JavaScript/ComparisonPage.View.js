/// <amd-module name="SuiteCommerce.ProductComparison.ComparisonPage.View"/>
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
define("SuiteCommerce.ProductComparison.ComparisonPage.View", ["require", "exports", "Backbone", "SuiteCommerce.ProductComparison.ComparisonPage.Configuration", "comparison_page.tpl", "SuiteCommerce.ProductComparison.ItemSearcher.View", "underscore", "SuiteCommerce.ProductComparison.Instrumentation", "SuiteCommerce.ProductComparison.ComparisonPage.Commons", "SuiteCommerce.ProductComparison.ComparisonPage.PartialsCatalog"], function (require, exports, Backbone_1, ComparisonPage_Configuration_1, comparisonPageTpl, ItemSearcher_View_1, _, Instrumentation_1, ComparisonPage_Service_1, ComparisonPage_Partials_Catalog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ComparisonPageView = /** @class */ (function (_super) {
        __extends(ComparisonPageView, _super);
        function ComparisonPageView(options) {
            var _this = _super.call(this, options) || this;
            _this.template = comparisonPageTpl;
            _this.events = {
                'click [data-action="remove-item-from-comparison"]': 'removeItemFromComparison',
                'click [data-action="navigate-to-item-pdp"]': 'navigateToItemPDP',
                'click [data-action="add-to-cart"]': 'loginAddToCartAction'
            };
            _this.title = ComparisonPage_Configuration_1.ComparisonPageConfiguration.title;
            _this.itemsToCompareInStorage = options.itemsToCompareInStorage;
            _this.items = options.items;
            _this.fieldsToCompare = ComparisonPage_Configuration_1.ComparisonPageConfiguration.itemFields;
            _this.maxRating = ComparisonPage_Configuration_1.ComparisonPageConfiguration.productReviewsMaxRate;
            _this.environment = options.application.getComponent('Environment');
            _this.items.on('changeInComparison', function () {
                _this.updateComparison();
            });
            ComparisonPage_Partials_Catalog_1.PartialsCatalog.initializePartials();
            return _this;
        }
        Object.defineProperty(ComparisonPageView.prototype, "childViews", {
            get: function () {
                var _this = this;
                return {
                    'ItemSearcher.View': function () {
                        return new ItemSearcher_View_1.ItemSearcherView({
                            isSearchDisabled: !_this.itemsToCompareInStorage.isSlotsRemaining(),
                            environment: _this.environment,
                            itemsInComparison: _this.items,
                        });
                    },
                };
            },
            enumerable: true,
            configurable: true
        });
        ComparisonPageView.prototype.getBreadcrumbPages = function () {
            return [{
                    text: this.title,
                    href: "/" + this.title,
                }];
        };
        ComparisonPageView.prototype.getContext = function () {
            var items = this.getProcessedItems();
            var groupsOfFieldsToCompare = this.getGroupsOfFieldsToCompare();
            return {
                items: items,
                groupsOfFieldsToCompare: groupsOfFieldsToCompare,
                title: this.title,
                comparisonPageDescription: ComparisonPage_Configuration_1.ComparisonPageConfiguration.description,
                comparisonPageShowPrice: ComparisonPage_Configuration_1.ComparisonPageConfiguration.showPrice,
                comparisonPageShowSKU: ComparisonPage_Configuration_1.ComparisonPageConfiguration.showSKU,
                comparisonPageShowAddToCartButton: ComparisonPage_Configuration_1.ComparisonPageConfiguration.showAddToCartButton,
                comparisonPageAddToCartButtonLabel: ComparisonPage_Configuration_1.ComparisonPageConfiguration.addToCartButtonLabel,
                comparisonPageRemoveItemHelperText: ComparisonPage_Configuration_1.ComparisonPageConfiguration.removeItemHelperText,
                comparisonPageRequireLoginForPricingMessage: ComparisonPage_Configuration_1.ComparisonPageConfiguration.requireLoginForPricingMessage,
                comparisonPagePriceLabel: ComparisonPage_Configuration_1.ComparisonPageConfiguration.priceLabel,
                comparisonPageRatingLabel: ComparisonPage_Configuration_1.ComparisonPageConfiguration.ratingLabel,
                comparisonPageSKULabel: ComparisonPage_Configuration_1.ComparisonPageConfiguration.SKULabel,
                isEnabledRating: ComparisonPage_Configuration_1.ComparisonPageConfiguration.productReviews && ComparisonPage_Configuration_1.ComparisonPageConfiguration.showRating,
                showComparisonTable: items.length > 0,
                showComparisonRows: this.fieldsToCompare.length > 0,
            };
        };
        ComparisonPageView.prototype.getGroupsOfFieldsToCompare = function () {
            var _this = this;
            var groupsOfFields = {};
            var groups;
            var currentGroupCounter = 0;
            var currentGroupLabel;
            _.each(this.fieldsToCompare, function (field) {
                if (_this.isFieldAvailableInAllItems(field.fieldId)) {
                    if (currentGroupLabel === field.group && currentGroupCounter > 0) {
                        groupsOfFields[currentGroupCounter].fields.push(field);
                    }
                    else {
                        currentGroupCounter += 1;
                        currentGroupLabel = field.group;
                        groupsOfFields[currentGroupCounter] = {
                            label: field.group.trim(),
                            showRow: !!field.group.trim(),
                            fields: [field],
                        };
                    }
                }
            });
            groups = _.values(groupsOfFields);
            return groups;
        };
        ComparisonPageView.prototype.isFieldAvailableInAllItems = function (fieldId) {
            var itemsWithFieldPopulated = this.items.filter(function (item) {
                var fieldValue = item.get(fieldId);
                return fieldValue !== undefined && fieldValue !== '&nbsp;' && fieldValue !== '';
            });
            return itemsWithFieldPopulated.length > 0;
        };
        ComparisonPageView.prototype.getProcessedItems = function () {
            var _this = this;
            var processedItems = [];
            this.items.each(function (item) {
                processedItems.push(_this.filterItemOptions(item));
            });
            return processedItems;
        };
        ComparisonPageView.prototype.filterItemOptions = function (item) {
            var ratingRounded = item.get('custitem_ns_pr_rating')
                ? Math.round(item.get('custitem_ns_pr_rating') * 2) / 2
                : 0;
            var filteredItem = {
                internalid: item.internalId,
                name: item.name,
                rating: ratingRounded * 100 / this.maxRating,
                realRating: item.get('custitem_ns_pr_rating'),
                stars: _.range(this.maxRating),
                thumbnail: item.thumbnail,
                price: item.price,
                sku: item.itemid,
                url: item.url,
                isPurchasable: item.isPurchasable
            };
            var fieldsToCompare = this.getFieldsToCompareValuesForItem(item);
            return _.extend(filteredItem, fieldsToCompare);
        };
        ComparisonPageView.prototype.getFieldsToCompareValuesForItem = function (item) {
            var fieldsToCompareValues = _.extend({});
            _.each(this.fieldsToCompare, function (field) {
                var fieldValue = item.get(field.fieldId) instanceof Object
                    ? String(item.get(field.fieldId))
                    : item.get(field.fieldId);
                fieldsToCompareValues[field.fieldId] = fieldValue;
            });
            return fieldsToCompareValues;
        };
        ComparisonPageView.prototype.removeItemFromComparison = function (event) {
            var selectedItemModel = this.items.findWhere({
                internalid: this.$el.find(event.target).data('itemid'),
            });
            this.items.remove(selectedItemModel);
            this.items.trigger('changeInComparison');
        };
        ComparisonPageView.prototype.updateComparison = function () {
            var itemIds = this.items.pluck('internalid');
            var registerComparisonLog = Instrumentation_1.default.getLog('registerComparisonLog');
            registerComparisonLog.setParameters({
                activity: 'Item Comparison',
                quantity: this.items.length,
            });
            registerComparisonLog.submit();
            ComparisonPage_Service_1.ComparisonPageService.updateItemsInLocalStorage(this.itemsToCompareInStorage, this.items);
            ComparisonPage_Service_1.ComparisonPageService.navigateToComparisonPageWithoutRender(itemIds);
            this.render();
        };
        ComparisonPageView.prototype.navigateToItemPDP = function (event) {
            var itemUrl = this.$el.find(event.target).data('itemurl');
            Backbone_1.history.navigate(itemUrl, { trigger: true });
        };
        ComparisonPageView.prototype.loginAddToCartAction = function () {
            var salesProspectLog = Instrumentation_1.default.getLog('salesProspectLog');
            salesProspectLog.setParameters({
                activity: 'Sales Prospect',
            });
            salesProspectLog.submit();
        };
        return ComparisonPageView;
    }(Backbone_1.View));
    exports.ComparisonPageView = ComparisonPageView;
});
