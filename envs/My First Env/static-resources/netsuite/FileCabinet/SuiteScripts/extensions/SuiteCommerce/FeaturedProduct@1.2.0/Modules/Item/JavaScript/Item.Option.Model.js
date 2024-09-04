/// <amd-module name="SuiteCommerce.FeaturedProduct.Item.Option.Model"/>
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
define("SuiteCommerce.FeaturedProduct.Item.Option.Model", ["require", "exports", "Backbone", "SuiteCommerce.FeaturedProduct.Item.Option.Value.Collection"], function (require, exports, Backbone_1, Item_Option_Value_Collection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemOptionModel = /** @class */ (function (_super) {
        __extends(ItemOptionModel, _super);
        function ItemOptionModel() {
            var _this = _super.call(this) || this;
            _this.parseData();
            return _this;
        }
        ItemOptionModel.prototype.getItemOptionId = function () {
            return this.get('itemOptionid');
        };
        ItemOptionModel.prototype.getCartOptionId = function () {
            return this.get('cartOptionId');
        };
        ItemOptionModel.prototype.getLabel = function () {
            return this.get('label');
        };
        ItemOptionModel.prototype.getType = function () {
            return this.get('type');
        };
        ItemOptionModel.prototype.getValue = function () {
            return this.get('value');
        };
        ItemOptionModel.prototype.getValues = function () {
            return this.get('values');
        };
        ItemOptionModel.prototype.getColors = function () {
            return this.get('colors');
        };
        ItemOptionModel.prototype.getTemplateSelector = function () {
            return this.get('templateSelector');
        };
        ItemOptionModel.prototype.getTemplateSelected = function () {
            return this.get('templateSelected');
        };
        ItemOptionModel.prototype.isTypeTextArea = function () {
            return this.getType() === 'textarea';
        };
        ItemOptionModel.prototype.isTypeEmail = function () {
            return this.getType() === 'email';
        };
        ItemOptionModel.prototype.isTypeText = function () {
            return this.getType() === 'text';
        };
        ItemOptionModel.prototype.isTypeCheckbox = function () {
            return this.getType() === 'checkbox';
        };
        ItemOptionModel.prototype.isTypeDate = function () {
            return this.getType() === 'date';
        };
        ItemOptionModel.prototype.isTypeSelect = function () {
            return this.getType() === 'select';
        };
        ItemOptionModel.prototype.parseData = function () {
            this.parseIds();
            this.parseValues();
        };
        ItemOptionModel.prototype.parseIds = function () {
            var internalId = this.get('internalid');
            var cartOptionId = this.get('cartOptionId');
            var sourceFrom = this.get('sourcefrom');
            var itemOptionId = this.get('itemOptionId');
            if (!cartOptionId && internalId) {
                this.set('cartOptionId', internalId.toLowerCase());
            }
            if (!itemOptionId && sourceFrom) {
                this.set('itemOptionId', sourceFrom.toLowerCase());
            }
        };
        ItemOptionModel.prototype.parseValues = function () {
            var values = this.get('values');
            var collection = new Item_Option_Value_Collection_1.default(values);
            this.set('values', collection);
        };
        ItemOptionModel.prototype.setValue = function (valueModel) {
            var value = null;
            var internalId;
            var label;
            if (valueModel) {
                internalId = valueModel.getInternalId();
                label = valueModel.getLabel();
                if (internalId || label) {
                    value = {
                        internalid: internalId ? internalId + '' : label,
                        label: label || internalId + '',
                    };
                }
            }
            this.setValueModel(valueModel);
            this.set('value', value);
        };
        ItemOptionModel.prototype.setValueModel = function (valueModel) {
            this.valueModel = valueModel;
        };
        ItemOptionModel.prototype.getValueModel = function () {
            return this.valueModel;
        };
        ItemOptionModel.prototype.clearValue = function () {
            this.setValueModel(null);
            this.set('value', null);
        };
        ItemOptionModel.prototype.isSingleValue = function () {
            var values = this.getValues();
            return values && values.length === 1;
        };
        return ItemOptionModel;
    }(Backbone_1.Model));
    exports.default = ItemOptionModel;
});
