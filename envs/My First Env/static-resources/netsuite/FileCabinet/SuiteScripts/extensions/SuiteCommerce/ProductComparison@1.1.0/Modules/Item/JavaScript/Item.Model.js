/// <amd-module name="SuiteCommerce.ProductComparison.Item.Model"/>
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
define("SuiteCommerce.ProductComparison.Item.Model", ["require", "exports", "SuiteCommerce.ProductComparison.RecordSearcher.Model", "SuiteCommerce.ProductComparison.Item.ImageHelper", "SuiteCommerce.ProductComparison.Item.Collection"], function (require, exports, RecordSearcher_Model_1, Item_ImageHelper_1, Item_Collection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemModel = /** @class */ (function (_super) {
        __extends(ItemModel, _super);
        function ItemModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(ItemModel.prototype, "internalId", {
            get: function () {
                return this.get('internalid');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemModel.prototype, "itemid", {
            get: function () {
                return this.get('itemid');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemModel.prototype, "name", {
            get: function () {
                return this.get('storedisplayname2') || this.get('displayname') || this.get('itemid') || '';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemModel.prototype, "description", {
            get: function () {
                var description = this.get('storedetaileddescription');
                var parentItem = this.parentItem;
                if (!description && parentItem && parentItem.internalId) {
                    return parentItem.description;
                }
                return description;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemModel.prototype, "price", {
            get: function () {
                var onlinePriceDetails = this.get('onlinecustomerprice_detail');
                var parentItem = this.parentItem;
                if (!onlinePriceDetails && parentItem && parentItem.internalId) {
                    return parentItem.price;
                }
                return {
                    number: onlinePriceDetails ? onlinePriceDetails.onlinecustomerprice : null,
                    formatted: onlinePriceDetails ? onlinePriceDetails.onlinecustomerprice_formatted : null,
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemModel.prototype, "url", {
            get: function () {
                return this.get('urlcomponent') || "/product/" + this.internalId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemModel.prototype, "rating", {
            get: function () {
                return this.get('custitem_ns_pr_rating');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemModel.prototype, "parentItem", {
            get: function () {
                return this.get('parentItem');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemModel.prototype, "matrixChildItems", {
            get: function () {
                return this.get('matrixChildItems');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemModel.prototype, "isMatrixParent", {
            get: function () {
                return !!this.matrixChildItems;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemModel.prototype, "isMatrixChild", {
            get: function () {
                return this.get('itemoptions_detail').matrixtype === 'child';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemModel.prototype, "thumbnail", {
            get: function () {
                var itemImagesDetail = this.get('itemimages_detail') || {};
                var parentItem = this.parentItem;
                if (itemImagesDetail.default || itemImagesDetail.thumbnail) {
                    return Item_ImageHelper_1.ItemImageHelper.getThumbnailExisting(this, itemImagesDetail);
                }
                if (parentItem && parentItem.internalId) {
                    return parentItem.thumbnail;
                }
                return Item_ImageHelper_1.ItemImageHelper.getThumbnailFromAll(this, itemImagesDetail);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemModel.prototype, "isPurchasable", {
            get: function () {
                return this.get('ispurchasable');
            },
            enumerable: true,
            configurable: true
        });
        ItemModel.prototype.parse = function (data) {
            if (data.matrixchilditems_detail) {
                this.parseMatrixChildItems(data);
            }
            return data;
        };
        ItemModel.prototype.parseMatrixChildItems = function (data) {
            var _this = this;
            var dataWrapper = data;
            dataWrapper.matrixChildItems = new Item_Collection_1.ItemCollection(dataWrapper.matrixchilditems_detail);
            dataWrapper.matrixChildItems.each(function (childItem) {
                childItem.set('parentItem', _this);
            });
        };
        return ItemModel;
    }(RecordSearcher_Model_1.RecordSearcherModel));
    exports.ItemModel = ItemModel;
});
