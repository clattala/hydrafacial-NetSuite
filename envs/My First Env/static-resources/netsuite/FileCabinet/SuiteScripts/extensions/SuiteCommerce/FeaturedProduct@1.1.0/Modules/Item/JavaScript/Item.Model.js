/// <amd-module name="SuiteCommerce.FeaturedProduct.Item.Model"/>
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
define("SuiteCommerce.FeaturedProduct.Item.Model", ["require", "exports", "SuiteCommerce.FeaturedProduct.Common.DependencyProvider", "SuiteCommerce.FeaturedProduct.Item.ImageHelper", "SuiteCommerce.FeaturedProduct.Item.Option.Collection"], function (require, exports, DependencyProvider_1, Item_ImageHelper_1, Item_Option_Collection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemModel = /** @class */ (function (_super) {
        __extends(ItemModel, _super);
        function ItemModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ItemModel.prototype.getInternalId = function () {
            return this.get('internalid');
        };
        ItemModel.prototype.getParentItem = function () {
            return this.get('parentItem');
        };
        ItemModel.prototype.getMatrixChildItems = function () {
            return this.get('matrixChildItems');
        };
        ItemModel.prototype.isMatrixParent = function () {
            return !!this.getMatrixChildItems();
        };
        ItemModel.prototype.isMatrixChild = function () {
            return this.get('itemoptions_detail').matrixtype === 'child';
        };
        ItemModel.prototype.getItemOptions = function () {
            return this.get('itemOptions');
        };
        ItemModel.prototype.getMatrixItemOptions = function () {
            var itemOptions;
            var filtered = [];
            if (!this.itemOptionsMatrix) {
                itemOptions = this.getItemOptions();
                if (itemOptions) {
                    filtered = itemOptions.where({ ismatrixdimension: true });
                }
                this.itemOptionsMatrix = new Item_Option_Collection_1.default(filtered);
            }
            return this.itemOptionsMatrix;
        };
        ItemModel.prototype.getName = function () {
            return (this.get('storedisplayname2') ||
                this.get('displayname') ||
                this.get('itemid') ||
                '');
        };
        ItemModel.prototype.getDescription = function () {
            var description = this.get('storedetaileddescription');
            var parentItem = this.getParentItem();
            if (!description && parentItem && parentItem.getInternalId()) {
                return parentItem.getDescription();
            }
            return description;
        };
        ItemModel.prototype.getPrice = function () {
            var onlinePriceDetails = this.get('onlinecustomerprice_detail');
            var parentItem = this.getParentItem();
            if (!onlinePriceDetails && parentItem && parentItem.getInternalId()) {
                return parentItem.getPrice();
            }
            return {
                number: onlinePriceDetails.onlinecustomerprice,
                formatted: onlinePriceDetails.onlinecustomerprice_formatted,
            };
        };
        ItemModel.prototype.getThumbnail = function () {
            var itemImagesDetail = this.get('itemimages_detail') || {};
            var parentItem = this.getParentItem();
            if (itemImagesDetail.thumbnail) {
                return Item_ImageHelper_1.default.getThumbnailExisting(this, itemImagesDetail);
            }
            if (parentItem && parentItem.getInternalId()) {
                return parentItem.getThumbnail();
            }
            return Item_ImageHelper_1.default.getThumbnailFromAll(this, itemImagesDetail);
        };
        ItemModel.prototype.parse = function (data) {
            if (data.itemoptions_detail) {
                this.parseItemOptions(data);
            }
            if (data.matrixchilditems_detail) {
                this.parseMatrixChildItems(data);
            }
            return data;
        };
        ItemModel.prototype.parseItemOptions = function (data) {
            if (data.itemoptions_detail.fields) {
                data.itemOptions = new Item_Option_Collection_1.default(data.itemoptions_detail.fields);
            }
        };
        ItemModel.prototype.parseMatrixChildItems = function (data) {
            var _this = this;
            var ItemCollection = this.getCollectionClass();
            data.matrixChildItems = new ItemCollection(data.matrixchilditems_detail);
            data.matrixChildItems.each(function (childItem) {
                childItem.set('parentItem', _this);
            });
        };
        // Workaround to avoid circular dependencies with the collection
        ItemModel.prototype.getCollectionClass = function () {
            return require('SuiteCommerce.FeaturedProduct.Item.Collection'); // eslint-disable-line global-require
        };
        ItemModel.prototype.getMatrixChildForOptions = function () {
            var matrixOptions = this.getMatrixItemOptions();
            var whereObject = {};
            var result = matrixOptions.every(function (matrixOption) {
                var optionValue = matrixOption.getValue();
                if (optionValue && (optionValue.label || optionValue.internalid)) {
                    whereObject[matrixOption.getItemOptionId()] =
                        optionValue.label || optionValue.internalid;
                    return true;
                }
                return false;
            });
            if (result) {
                return this.getMatrixChildItems().findWhere(whereObject);
            }
            return null;
        };
        return ItemModel;
    }(DependencyProvider_1.BackboneCachedModel));
    exports.default = ItemModel;
});
