/// <amd-module name="SuiteCommerce.ProductComparison.ComparisonWidget.ItemCell.View"/>
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
define("SuiteCommerce.ProductComparison.ComparisonWidget.ItemCell.View", ["require", "exports", "Backbone", "comparison_widget_item_cell.tpl"], function (require, exports, Backbone_1, itemCellTemplate) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ComparisonWidgetItemCellView = /** @class */ (function (_super) {
        __extends(ComparisonWidgetItemCellView, _super);
        function ComparisonWidgetItemCellView(options) {
            var _this = _super.call(this, options) || this;
            _this.template = itemCellTemplate;
            _this.model = options.model;
            return _this;
        }
        ComparisonWidgetItemCellView.prototype.getContext = function () {
            return {
                internalid: this.model.internalid,
                name: this.getSimplifiedItemName(),
                thumbnail: this.model.thumbnail,
            };
        };
        ComparisonWidgetItemCellView.prototype.getSimplifiedItemName = function () {
            if (this.model.name.length > 40) {
                var simplifiedItemName = this.model.name.trim();
                simplifiedItemName = simplifiedItemName.substr(0, 39);
                simplifiedItemName += '...';
                return simplifiedItemName;
            }
            return this.model.name;
        };
        return ComparisonWidgetItemCellView;
    }(Backbone_1.View));
    exports.ComparisonWidgetItemCellView = ComparisonWidgetItemCellView;
});
