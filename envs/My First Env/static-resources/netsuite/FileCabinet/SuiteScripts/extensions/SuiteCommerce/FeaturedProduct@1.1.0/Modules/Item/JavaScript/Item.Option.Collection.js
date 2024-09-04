/// <amd-module name="SuiteCommerce.FeaturedProduct.Item.Option.Collection"/>
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
define("SuiteCommerce.FeaturedProduct.Item.Option.Collection", ["require", "exports", "Backbone"], function (require, exports, Backbone_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemOptionCollection = /** @class */ (function (_super) {
        __extends(ItemOptionCollection, _super);
        function ItemOptionCollection() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ItemOptionCollection;
    }(Backbone_1.Collection));
    exports.default = ItemOptionCollection;
});
