/// <amd-module name="SuiteCommerce.ProductComparison.Common.StorableItem.Collection"/>
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
define("SuiteCommerce.ProductComparison.Common.StorableItem.Collection", ["require", "exports", "SuiteCommerce.ProductComparison.Storage.Collection", "SuiteCommerce.ProductComparison.Common.StorableItem.Model"], function (require, exports, Storage_Collection_1, StorableItem_Model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var addOriginal = Storage_Collection_1.StorageCollection.prototype.add;
    var StorableItemCollection = /** @class */ (function (_super) {
        __extends(StorableItemCollection, _super);
        function StorableItemCollection() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(StorableItemCollection.prototype, "storageKey", {
            get: function () {
                return 'ns_sc_product_comparison_selected_items';
            },
            enumerable: true,
            configurable: true
        });
        StorableItemCollection.prototype.getModel = function () {
            return StorableItem_Model_1.StorableItemModel;
        };
        StorableItemCollection.prototype.add = function () {
            if (this.isSlotsRemaining()) {
                return addOriginal.apply(this, arguments);
            }
            this.trigger('exceedLimitOfItems');
            return null;
        };
        StorableItemCollection.prototype.isSlotsRemaining = function () {
            if (this.maxLength) {
                return this.length < this.maxLength;
            }
            return true;
        };
        Object.defineProperty(StorableItemCollection.prototype, "maxLength", {
            get: function () {
                return this.maxLengthLocal;
            },
            set: function (maxLength) {
                this.maxLengthLocal = maxLength;
            },
            enumerable: true,
            configurable: true
        });
        return StorableItemCollection;
    }(Storage_Collection_1.StorageCollection));
    exports.StorableItemCollection = StorableItemCollection;
});
