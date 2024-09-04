/// <amd-module name="SuiteCommerce.ProductComparison.ComparisonWidget.LimitMessage.View"/>
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
define("SuiteCommerce.ProductComparison.ComparisonWidget.LimitMessage.View", ["require", "exports", "SuiteCommerce.ProductComparison.ComparisonWidget.Configuration", "Backbone", "comparison_widget_limit_message.tpl"], function (require, exports, ComparisonWidget_Configuration_1, Backbone_1, comparisonWidgetLimitMessageTpl) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ComparisonWidgetLimitMessageView = /** @class */ (function (_super) {
        __extends(ComparisonWidgetLimitMessageView, _super);
        function ComparisonWidgetLimitMessageView(options) {
            var _this = _super.call(this, options) || this;
            _this.showMessage = options.showMessage;
            _this.template = comparisonWidgetLimitMessageTpl;
            return _this;
        }
        ComparisonWidgetLimitMessageView.prototype.getContext = function () {
            return {
                excessInItemsAllowedMessage: ComparisonWidget_Configuration_1.ComparisonWidgetConfiguration.excessInItemsAllowedMessage,
                showMessage: this.showMessage,
            };
        };
        return ComparisonWidgetLimitMessageView;
    }(Backbone_1.View));
    exports.ComparisonWidgetLimitMessageView = ComparisonWidgetLimitMessageView;
});
