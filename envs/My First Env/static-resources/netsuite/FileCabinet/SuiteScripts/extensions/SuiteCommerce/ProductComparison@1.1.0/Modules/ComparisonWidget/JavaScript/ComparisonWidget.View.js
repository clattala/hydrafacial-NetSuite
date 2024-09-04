/// <amd-module name="SuiteCommerce.ProductComparison.ComparisonWidget.View"/>
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
define("SuiteCommerce.ProductComparison.ComparisonWidget.View", ["require", "exports", "Backbone", "comparison_widget.tpl", "SuiteCommerce.ProductComparison.ComparisonWidget.ItemCells.View", "SuiteCommerce.ProductComparison.ComparisonWidget.Header.View", "SuiteCommerce.ProductComparison.ComparisonWidget.LimitMessage.View"], function (require, exports, Backbone_1, comparisonWidgetTpl, ComparisonWidget_ItemCells_View_1, ComparisonWidget_Header_View_1, ComparisonWidget_LimitMessage_View_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ComparisonWidgetView = /** @class */ (function (_super) {
        __extends(ComparisonWidgetView, _super);
        function ComparisonWidgetView(options) {
            var _this = _super.call(this, options) || this;
            _this.template = comparisonWidgetTpl;
            _this.itemsToCompare = options.itemsToCompare;
            _this.isRequiredShowItemCells = false;
            _this.isRequiredShowWidget = _this.itemsToCompare.length > 0;
            _this.initializeChildViews();
            _this.registerListenersForItemsToCompare();
            _this.setupWidgetToggleEventListener();
            return _this;
        }
        Object.defineProperty(ComparisonWidgetView.prototype, "childViews", {
            get: function () {
                var _this = this;
                return {
                    'WidgetHeader.View': function () {
                        return _this.widgetHeaderView;
                    },
                    'ItemCells.View': function () {
                        return _this.itemCellsView;
                    },
                    'LimitMessage.View': function () {
                        return _this.limitMessageView;
                    },
                };
            },
            enumerable: true,
            configurable: true
        });
        ComparisonWidgetView.prototype.initializeChildViews = function () {
            this.widgetHeaderView = new ComparisonWidget_Header_View_1.ComparisonWidgetHeaderView({
                itemsToCompare: this.itemsToCompare,
            });
            this.itemCellsView = new ComparisonWidget_ItemCells_View_1.ComparisonWidgetItemCellsView({
                itemsToCompare: this.itemsToCompare,
            });
            this.limitMessageView = new ComparisonWidget_LimitMessage_View_1.ComparisonWidgetLimitMessageView({
                showMessage: this.itemsToCompare.length < 3 || !this.isRequiredShowItemCells,
            });
        };
        ComparisonWidgetView.prototype.registerListenersForItemsToCompare = function () {
            var _this = this;
            this.itemsToCompare.on('add', function () {
                _this.onAdditionsForItemsToCompare();
                _this.updateLimitMessageView();
            });
            this.itemsToCompare.on('remove reset', function () {
                _this.onDeletionsFromItemsToCompare();
                _this.updateLimitMessageView();
            });
        };
        ComparisonWidgetView.prototype.onAdditionsForItemsToCompare = function () {
            if (!this.isRequiredShowWidget) {
                this.showWidget();
            }
            if (!this.isRequiredShowItemCells && this.itemsToCompare.length > 0 && !this.isMobileDevice()) {
                this.widgetHeaderView.rotateArrowIcon();
                this.showItemCells();
            }
            this.itemCellsView.render();
        };
        ComparisonWidgetView.prototype.updateLimitMessageView = function () {
            this.limitMessageView.showMessage = this.itemsToCompare.length < 3 || !this.isRequiredShowItemCells;
            this.limitMessageView.render();
        };
        ComparisonWidgetView.prototype.onDeletionsFromItemsToCompare = function () {
            var _this = this;
            if (this.itemsToCompare.length === 0) {
                this.widgetHeaderView.rotateArrowIcon();
                this.hideItemCells();
                this.hideWidget();
                setTimeout(function () {
                    _this.itemCellsView.render();
                }, 500);
            }
            else {
                if (!this.isRequiredShowItemCells && this.itemsToCompare.length > 0 && !this.isMobileDevice()) {
                    this.widgetHeaderView.rotateArrowIcon();
                    this.showItemCells();
                }
                this.itemCellsView.render();
            }
        };
        ComparisonWidgetView.prototype.isMobileDevice = function () {
            var viewportWidth = jQuery(window).width();
            return viewportWidth < 768;
        };
        ComparisonWidgetView.prototype.setupWidgetToggleEventListener = function () {
            var _this = this;
            this.widgetHeaderView.on(ComparisonWidget_Header_View_1.WIDGET_TOGGLE_EVENT_NAME, function () { return _this.toggleWidget(); });
        };
        ComparisonWidgetView.prototype.toggleWidget = function () {
            if (this.isRequiredShowItemCells) {
                this.hideItemCells();
            }
            else {
                this.showItemCells();
            }
            this.updateLimitMessageView();
        };
        ComparisonWidgetView.prototype.showWidget = function () {
            this.isRequiredShowWidget = true;
            this.$('.sc-item-comparison-widget-container').addClass('shown');
        };
        ComparisonWidgetView.prototype.hideWidget = function () {
            this.isRequiredShowWidget = false;
            this.$('.sc-item-comparison-widget-container').removeClass('shown');
        };
        ComparisonWidgetView.prototype.hideItemCells = function () {
            this.$('.sc-widget-placeholders-container').addClass('hide-placeholders');
            this.isRequiredShowItemCells = false;
        };
        ComparisonWidgetView.prototype.showItemCells = function () {
            this.$('.sc-widget-placeholders-container').removeClass('hide-placeholders');
            this.isRequiredShowItemCells = true;
        };
        ComparisonWidgetView.prototype.getContext = function () {
            return {
                showWidget: this.isRequiredShowWidget,
                showItemCells: this.isRequiredShowItemCells,
            };
        };
        return ComparisonWidgetView;
    }(Backbone_1.View));
    exports.ComparisonWidgetView = ComparisonWidgetView;
});
