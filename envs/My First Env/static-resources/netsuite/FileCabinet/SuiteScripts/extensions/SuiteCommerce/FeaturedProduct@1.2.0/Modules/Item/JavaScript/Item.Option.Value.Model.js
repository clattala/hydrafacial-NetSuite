/// <amd-module name="SuiteCommerce.FeaturedProduct.Item.Option.Value.Model"/>
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
define("SuiteCommerce.FeaturedProduct.Item.Option.Value.Model", ["require", "exports", "underscore", "Backbone", "SC.FeaturedProduct.Common.Configuration"], function (require, exports, _, Backbone_1, Common_Configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemOptionValueModel = /** @class */ (function (_super) {
        __extends(ItemOptionValueModel, _super);
        function ItemOptionValueModel(options) {
            var _this = _super.call(this, options) || this;
            _this.item = options.item;
            return _this;
        }
        ItemOptionValueModel.prototype.getInternalId = function () {
            return this.get('internalid');
        };
        ItemOptionValueModel.prototype.getLabel = function () {
            return this.get('label');
        };
        ItemOptionValueModel.prototype.getUrl = function () {
            return this.get('url');
        };
        ItemOptionValueModel.prototype.isAvailable = function () {
            return this.get('isAvailable');
        };
        ItemOptionValueModel.prototype.isSelected = function (selectedId) {
            var internalId = this.getInternalId();
            return (internalId &&
                selectedId &&
                parseInt(internalId, 10) === parseInt(selectedId, 10));
        };
        ItemOptionValueModel.prototype.getColorInfo = function (colors) {
            var color = '';
            var label = this.getLabel();
            var isColorTile = true;
            var image = {};
            if (colors) {
                color = colors[label] || colors.defaultColor;
                if (_.isObject(color)) {
                    image = color;
                    color = '';
                    isColorTile = false;
                }
            }
            return {
                color: color,
                image: image,
                isColorTile: isColorTile,
            };
        };
        ItemOptionValueModel.prototype.isLightColor = function () {
            return _(Common_Configuration_1.Configuration.get('layout.lightColors') || []).contains(this.getLabel());
        };
        return ItemOptionValueModel;
    }(Backbone_1.Model));
    exports.default = ItemOptionValueModel;
});
