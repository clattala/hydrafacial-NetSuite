/// <amd-module name="SuiteCommerce.ProductComparison.Storage.Collection"/>
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
define("SuiteCommerce.ProductComparison.Storage.Collection", ["require", "exports", "Backbone", "SuiteCommerce.ProductComparison.StorageHelper"], function (require, exports, Backbone_1, Storage_Helper_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var StorageCollection = /** @class */ (function (_super) {
        __extends(StorageCollection, _super);
        function StorageCollection() {
            var _this = _super.call(this) || this;
            _this.model = _this.getModel();
            _this.loadModelsFromStorage();
            _this.registerListeners();
            return _this;
        }
        StorageCollection.prototype.loadModelsFromStorage = function () {
            var modelsInStorage = Storage_Helper_1.StorageHelper.load(this.storageKey);
            this.add(modelsInStorage);
        };
        StorageCollection.prototype.registerListeners = function () {
            var _this = this;
            this.on('add remove reset', function () { return _this.saveModelsInStorage(); });
        };
        StorageCollection.prototype.saveModelsInStorage = function () {
            Storage_Helper_1.StorageHelper.save(this.storageKey, this.toJSON());
        };
        return StorageCollection;
    }(Backbone_1.Collection));
    exports.StorageCollection = StorageCollection;
});
