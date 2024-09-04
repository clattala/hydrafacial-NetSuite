/// <amd-module name="SuiteCommerce.ProductComparison.Common.StorableItem.Model"/>
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
define("SuiteCommerce.ProductComparison.Common.StorableItem.Model", ["require", "exports", "Backbone"], function (require, exports, Backbone_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var StorableItemModel = /** @class */ (function (_super) {
        __extends(StorableItemModel, _super);
        function StorableItemModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(StorableItemModel.prototype, "internalid", {
            get: function () {
                return this.get('internalid');
            },
            set: function (internalId) {
                this.set('internalid', internalId);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StorableItemModel.prototype, "name", {
            get: function () {
                return this.get('name');
            },
            set: function (name) {
                this.set('name', name);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StorableItemModel.prototype, "thumbnail", {
            get: function () {
                return this.get('thumbnail');
            },
            set: function (thumbnailMap) {
                this.set('thumbnail', thumbnailMap);
            },
            enumerable: true,
            configurable: true
        });
        return StorableItemModel;
    }(Backbone_1.Model));
    exports.StorableItemModel = StorableItemModel;
});
