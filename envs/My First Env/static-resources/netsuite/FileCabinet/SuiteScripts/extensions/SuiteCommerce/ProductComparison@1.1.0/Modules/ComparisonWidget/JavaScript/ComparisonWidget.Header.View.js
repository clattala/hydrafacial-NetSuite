/// <amd-module name="SuiteCommerce.ProductComparison.ComparisonWidget.Header.View"/>
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
define("SuiteCommerce.ProductComparison.ComparisonWidget.Header.View", ["require", "exports", "Backbone", "comparison_widget_header.tpl", "SuiteCommerce.ProductComparison.ComparisonWidget.CompareButton.View", "SuiteCommerce.ProductComparison.ComparisonWidget.LimitMessage.View"], function (require, exports, Backbone_1, comparisonWidgetHeaderTpl, ComparisonWidget_CompareButton_View_1, ComparisonWidget_LimitMessage_View_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WIDGET_TOGGLE_EVENT_NAME = 'WidgetToggleEvent';
    var ComparisonWidgetHeaderView = /** @class */ (function (_super) {
        __extends(ComparisonWidgetHeaderView, _super);
        function ComparisonWidgetHeaderView(options) {
            var _this = _super.call(this, options) || this;
            _this.template = comparisonWidgetHeaderTpl;
            _this.itemsToCompare = options.itemsToCompare;
            _this.events = {
                'click [data-action="open-compare-products-widget"]': 'triggerToggleWidgetEvent',
            };
            return _this;
        }
        ComparisonWidgetHeaderView.prototype.triggerToggleWidgetEvent = function () {
            this.rotateArrowIcon();
            this.trigger(exports.WIDGET_TOGGLE_EVENT_NAME);
        };
        ComparisonWidgetHeaderView.prototype.rotateArrowIcon = function () {
            this.$('.sc-icon-toggle').toggleClass('active');
        };
        Object.defineProperty(ComparisonWidgetHeaderView.prototype, "childViews", {
            get: function () {
                var _this = this;
                return {
                    'CompareButton.View': function () {
                        return new ComparisonWidget_CompareButton_View_1.ComparisonWidgetCompareButtonView({
                            itemsToCompare: _this.itemsToCompare,
                        });
                    },
                    'LimitMessage.View': function () {
                        return new ComparisonWidget_LimitMessage_View_1.ComparisonWidgetLimitMessageView({
                            showMessage: true,
                        });
                    },
                };
            },
            enumerable: true,
            configurable: true
        });
        return ComparisonWidgetHeaderView;
    }(Backbone_1.View));
    exports.ComparisonWidgetHeaderView = ComparisonWidgetHeaderView;
});
