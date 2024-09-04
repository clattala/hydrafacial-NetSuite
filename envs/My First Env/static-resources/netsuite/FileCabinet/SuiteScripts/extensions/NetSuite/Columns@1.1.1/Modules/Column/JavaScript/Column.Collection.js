/// <amd-module name="SuiteCommerce.Columns.Column.Collection"/>
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
define("SuiteCommerce.Columns.Column.Collection", ["require", "exports", "Backbone"], function (require, exports, Backbone_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ColumnCollection = /** @class */ (function (_super) {
        __extends(ColumnCollection, _super);
        function ColumnCollection() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ColumnCollection;
    }(Backbone_1.Collection));
    exports.ColumnCollection = ColumnCollection;
});
