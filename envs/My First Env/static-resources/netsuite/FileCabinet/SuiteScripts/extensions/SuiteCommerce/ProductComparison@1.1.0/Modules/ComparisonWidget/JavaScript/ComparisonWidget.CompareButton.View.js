/// <amd-module name="SuiteCommerce.ProductComparison.ComparisonWidget.CompareButton.View"/>
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
define("SuiteCommerce.ProductComparison.ComparisonWidget.CompareButton.View", ["require", "exports", "Backbone", "comparison_widget_compare_button.tpl", "SuiteCommerce.ProductComparison.ComparisonPage.Commons", "SuiteCommerce.ProductComparison.ComparisonWidget.Configuration", "SuiteCommerce.ProductComparison.Common.Utils"], function (require, exports, Backbone_1, CompareButtonTpl, ComparisonPage_Service_1, ComparisonWidget_Configuration_1, Utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ComparisonWidgetCompareButtonView = /** @class */ (function (_super) {
        __extends(ComparisonWidgetCompareButtonView, _super);
        function ComparisonWidgetCompareButtonView(options) {
            var _this = _super.call(this, options) || this;
            _this.itemsToCompare = options.itemsToCompare;
            _this.template = CompareButtonTpl;
            _this.events = {
                'click [data-action="proceed-to-compare-products"]': 'compareItems',
            };
            _this.setupCollectionListener();
            return _this;
        }
        ComparisonWidgetCompareButtonView.prototype.compareItems = function () {
            var itemsIds = this.itemsToCompare.pluck('internalid');
            ComparisonPage_Service_1.ComparisonPageService.navigateToComparisonPage(itemsIds);
        };
        ComparisonWidgetCompareButtonView.prototype.setupCollectionListener = function () {
            var _this = this;
            this.itemsToCompare.on('add remove', function () {
                if (_this.itemsToCompare.length > 0) {
                    _this.render();
                }
            });
        };
        ComparisonWidgetCompareButtonView.prototype.getContext = function () {
            return {
                compareButtonLabel: this.injectItemQuantityBadgeInString(ComparisonWidget_Configuration_1.ComparisonWidgetConfiguration.compareButtonLabel),
            };
        };
        ComparisonWidgetCompareButtonView.prototype.injectItemQuantityBadgeInString = function (label) {
            var itemQuantityBadge = "<span class=\"items-to-compare-quantity\">" + this.itemsToCompare.length + "</span>";
            var labelWrapper = Utils_1.Utils.translate(label);
            if (labelWrapper.indexOf('[[items]]') !== -1) {
                labelWrapper = labelWrapper.replace('[[items]]', itemQuantityBadge);
            }
            return labelWrapper;
        };
        return ComparisonWidgetCompareButtonView;
    }(Backbone_1.View));
    exports.ComparisonWidgetCompareButtonView = ComparisonWidgetCompareButtonView;
});
