/// <amd-module name="SuiteCommerce.MapAndContactUs.ExtMessage.Model"/>
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
define("SuiteCommerce.MapAndContactUs.ExtMessage.Model", ["require", "exports", "Backbone"], function (require, exports, Backbone_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ExtMessageModel = /** @class */ (function (_super) {
        __extends(ExtMessageModel, _super);
        function ExtMessageModel(options) {
            return _super.call(this, options) || this;
        }
        Object.defineProperty(ExtMessageModel.prototype, "message", {
            get: function () {
                return this.get('message');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtMessageModel.prototype, "type", {
            get: function () {
                return this.get('type');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ExtMessageModel.prototype, "closable", {
            get: function () {
                return this.get('closable');
            },
            enumerable: true,
            configurable: true
        });
        return ExtMessageModel;
    }(Backbone_1.Model));
    exports.ExtMessageModel = ExtMessageModel;
});
