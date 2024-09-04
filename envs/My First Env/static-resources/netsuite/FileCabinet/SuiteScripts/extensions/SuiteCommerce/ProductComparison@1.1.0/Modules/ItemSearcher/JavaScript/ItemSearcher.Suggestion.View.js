/// <amd-module name="SuiteCommerce.ProductComparison.ItemSearcher.Suggestion.View"/>
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
define("SuiteCommerce.ProductComparison.ItemSearcher.Suggestion.View", ["require", "exports", "underscore", "item_searcher_suggestion.tpl", "SuiteCommerce.ProductComparison.RecordSearcher.Suggestion.View", "SuiteCommerce.ProductComparison.ItemSearcher.Configuration"], function (require, exports, _, itemSuggestionTpl, RecordSearcher_Suggestion_View_1, ItemSearcher_Configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemSuggestionView = /** @class */ (function (_super) {
        __extends(ItemSuggestionView, _super);
        function ItemSuggestionView(options) {
            var _this = _super.call(this, options) || this;
            _this.template = itemSuggestionTpl;
            _this.model = options.model;
            _this.maxRating = ItemSearcher_Configuration_1.ItemSearcherConfiguration.productReviewsMaxRate || 0;
            return _this;
        }
        ItemSuggestionView.prototype.getContext = function () {
            var ratingRounded = this.model.get('custitem_ns_pr_rating')
                ? Math.round(this.model.get('custitem_ns_pr_rating') * 2) / 2
                : 0;
            return {
                internalId: this.model.internalId,
                name: this.model.name,
                rating: ratingRounded * 100 / this.maxRating,
                realRating: this.model.rating,
                stars: _.range(this.maxRating),
                isEnabledRating: !!(ItemSearcher_Configuration_1.ItemSearcherConfiguration.productReviews) && ItemSearcher_Configuration_1.ItemSearcherConfiguration.showRating,
                thumbnail: this.model.thumbnail,
                sku: this.model.itemid,
            };
        };
        return ItemSuggestionView;
    }(RecordSearcher_Suggestion_View_1.RecordSuggestionSearcherView));
    exports.ItemSuggestionView = ItemSuggestionView;
});
