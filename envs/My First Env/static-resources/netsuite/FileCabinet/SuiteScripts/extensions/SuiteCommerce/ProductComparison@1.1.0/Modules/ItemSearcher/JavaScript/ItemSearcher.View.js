/// <amd-module name="SuiteCommerce.ProductComparison.ItemSearcher.View"/>
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
define("SuiteCommerce.ProductComparison.ItemSearcher.View", ["require", "exports", "SuiteCommerce.ProductComparison.RecordSearcher.View", "SuiteCommerce.ProductComparison.ItemSearcher.Suggestion.View", "Backbone.CollectionView", "SuiteCommerce.ProductComparison.ItemSearcher.Configuration", "SuiteCommerce.ProductComparison.Item.Collection"], function (require, exports, RecordSearcher_View_1, ItemSearcher_Suggestion_View_1, BackboneCollectionView, ItemSearcher_Configuration_1, Item_Collection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemSearcherView = /** @class */ (function (_super) {
        __extends(ItemSearcherView, _super);
        function ItemSearcherView(options) {
            var _this = _super.call(this, options) || this;
            _this.searcherBoxId = 'product-comparison-search';
            _this.title = ItemSearcher_Configuration_1.ItemSearcherConfiguration.comparisonPageItemSearchLabel;
            _this.inputPlaceholder = ItemSearcher_Configuration_1.ItemSearcherConfiguration.comparisonPageItemSearchPlaceholder;
            _this.helperText = ItemSearcher_Configuration_1.ItemSearcherConfiguration.comparisonPageItemSearchHelper;
            _this.queryParam = 'q';
            _this.queryMinLength = 3;
            _this.additionalParameters = [{ limit: 10 }];
            _this.events = _this.getEventsHash();
            _this.options = options;
            _this.isSearchDisabled = options.isSearchDisabled;
            _this.itemsInComparison = options.itemsInComparison;
            _this.environment = options.environment;
            _this.on('RecordSearcher.SuggestionClicked', function (item) {
                _this.addItemToComparison(item);
            });
            return _this;
        }
        ItemSearcherView.prototype.getCollection = function () {
            return new Item_Collection_1.ItemCollection({
                environment: this.options.environment,
                ids: [],
            });
        };
        ItemSearcherView.prototype.addItemToComparison = function (item) {
            this.itemsInComparison.add(item);
            this.itemsInComparison.trigger('changeInComparison');
        };
        Object.defineProperty(ItemSearcherView.prototype, "childViews", {
            get: function () {
                var _this = this;
                return {
                    'RecordSearcher.Suggestions': function () {
                        return new BackboneCollectionView({
                            childView: ItemSearcher_Suggestion_View_1.ItemSuggestionView,
                            collection: _this.collection,
                        });
                    },
                };
            },
            enumerable: true,
            configurable: true
        });
        return ItemSearcherView;
    }(RecordSearcher_View_1.RecordSearcherView));
    exports.ItemSearcherView = ItemSearcherView;
});
