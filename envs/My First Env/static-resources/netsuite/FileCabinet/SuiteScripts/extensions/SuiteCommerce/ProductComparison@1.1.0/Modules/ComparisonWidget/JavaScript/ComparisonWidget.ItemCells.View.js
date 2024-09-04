/// <amd-module name="SuiteCommerce.ProductComparison.ComparisonWidget.ItemCells.View"/>
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
define("SuiteCommerce.ProductComparison.ComparisonWidget.ItemCells.View", ["require", "exports", "Backbone", "comparison_widget_item_cells.tpl", "Backbone.CollectionView", "SuiteCommerce.ProductComparison.ComparisonWidget.ItemCell.View"], function (require, exports, Backbone_1, comparisonAdderWidgetContentViewTpl, BackboneCollectionView, ComparisonWidget_ItemCell_View_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ComparisonWidgetItemCellsView = /** @class */ (function (_super) {
        __extends(ComparisonWidgetItemCellsView, _super);
        function ComparisonWidgetItemCellsView(options) {
            var _this = _super.call(this, options) || this;
            _this.events = {
                'click [data-action="remove-from-add-to-compare"]': 'removeItemFromList',
            };
            _this.items = options.itemsToCompare;
            _this.template = comparisonAdderWidgetContentViewTpl;
            return _this;
        }
        Object.defineProperty(ComparisonWidgetItemCellsView.prototype, "childViews", {
            get: function () {
                var _this = this;
                return {
                    'ItemCells.CollectionView': function () {
                        return new BackboneCollectionView({
                            childView: ComparisonWidget_ItemCell_View_1.ComparisonWidgetItemCellView,
                            collection: _this.items,
                        });
                    },
                };
            },
            enumerable: true,
            configurable: true
        });
        ComparisonWidgetItemCellsView.prototype.removeItemFromList = function (event) {
            var selectedItemId = this.$el.find(event.target).data('itemid');
            var selectedItemModel = this.items.findWhere({
                internalid: selectedItemId,
            });
            this.items.remove(selectedItemModel);
        };
        ComparisonWidgetItemCellsView.prototype.getContext = function () {
            return {
                items: this.items,
            };
        };
        return ComparisonWidgetItemCellsView;
    }(Backbone_1.View));
    exports.ComparisonWidgetItemCellsView = ComparisonWidgetItemCellsView;
});
