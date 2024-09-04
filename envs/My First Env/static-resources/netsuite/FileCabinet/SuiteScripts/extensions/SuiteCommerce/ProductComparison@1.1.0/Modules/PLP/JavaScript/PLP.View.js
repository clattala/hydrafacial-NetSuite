/// <amd-module name="SuiteCommerce.ProductComparison.PLP.View"/>
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
define("SuiteCommerce.ProductComparison.PLP.View", ["require", "exports", "Backbone", "comparison_adder_view.tpl", "SuiteCommerce.ProductComparison.PLP.Configuration", "SuiteCommerce.ProductComparison.Item.Model"], function (require, exports, Backbone_1, comparisonAdderPLPViewTpl, PLP_Configuration_1, Item_Model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PLPView = /** @class */ (function (_super) {
        __extends(PLPView, _super);
        function PLPView(options) {
            var _this = _super.call(this, options) || this;
            _this.contextDataRequest = ['item'];
            _this.template = comparisonAdderPLPViewTpl;
            _this.events = { 'click [data-action="add-to-compare"]': 'addToCompareToggle' };
            _this.itemsToCompare = options.itemsToCompare;
            _this.selectedItemsIds = _this.itemsToCompare.pluck('internalid');
            _this.registerItemsToCompareListener();
            return _this;
        }
        PLPView.prototype.registerItemsToCompareListener = function () {
            var _this = this;
            this.itemsToCompare.on('add remove reset', function () {
                _this.selectedItemsIds = _this.itemsToCompare.pluck('internalid');
                _this.render();
            });
        };
        PLPView.prototype.addToCompareToggle = function () {
            var item = new Item_Model_1.ItemModel(this.contextData.item());
            if (this.isSelectedItem(item.internalId)) {
                this.itemsToCompare.remove(this.itemsToCompare.findWhere({
                    internalid: item.internalId,
                }));
            }
            else {
                // @ts-ignore
                this.itemsToCompare.add({
                    internalid: item.internalId,
                    name: item.name,
                    thumbnail: item.thumbnail,
                });
            }
        };
        PLPView.prototype.getContext = function () {
            var item = this.contextData.item();
            return {
                item: {
                    internalId: item.internalid,
                    isSelectedToCompare: this.isSelectedItem(item.internalid),
                },
                isNotAllowedChangeCompareOptions: !this.itemsToCompare.isSlotsRemaining() && !this.isSelectedItem(item.internalid),
                addToCompareLabel: PLP_Configuration_1.PLPConfiguration.addToCompareLabel,
                excessInItemsAllowedMessage: PLP_Configuration_1.PLPConfiguration.excessInItemsAllowedMessage,
            };
        };
        PLPView.prototype.isSelectedItem = function (itemId) {
            return this.selectedItemsIds.indexOf(itemId) > -1;
        };
        return PLPView;
    }(Backbone_1.View));
    exports.PLPView = PLPView;
});
