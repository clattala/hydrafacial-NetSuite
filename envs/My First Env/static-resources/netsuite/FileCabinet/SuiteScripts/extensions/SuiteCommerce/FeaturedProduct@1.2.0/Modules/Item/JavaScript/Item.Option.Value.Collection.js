/// <amd-module name="SuiteCommerce.FeaturedProduct.Item.Option.Value.Collection"/>
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
define("SuiteCommerce.FeaturedProduct.Item.Option.Value.Collection", ["require", "exports", "Backbone"], function (require, exports, Backbone_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemOptionValueCollection = /** @class */ (function (_super) {
        __extends(ItemOptionValueCollection, _super);
        function ItemOptionValueCollection(values) {
            return _super.call(this) || this;
        }
        return ItemOptionValueCollection;
    }(Backbone_1.Collection));
    exports.default = ItemOptionValueCollection;
});
