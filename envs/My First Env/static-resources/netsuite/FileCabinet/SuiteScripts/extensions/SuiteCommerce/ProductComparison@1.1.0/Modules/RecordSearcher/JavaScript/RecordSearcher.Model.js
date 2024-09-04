/// <amd-module name="SuiteCommerce.ProductComparison.RecordSearcher.Model"/>
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
define("SuiteCommerce.ProductComparison.RecordSearcher.Model", ["require", "exports", "SuiteCommerce.ProductComparison.Common.DependencyProvider"], function (require, exports, DependencyProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RecordSearcherModel = /** @class */ (function (_super) {
        __extends(RecordSearcherModel, _super);
        function RecordSearcherModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(RecordSearcherModel.prototype, "isSuggestionSelected", {
            get: function () {
                return this.get('isSuggestionSelected');
            },
            set: function (value) {
                this.set('isSuggestionSelected', value);
            },
            enumerable: true,
            configurable: true
        });
        RecordSearcherModel.prototype.defaults = function () {
            return {
                isSuggestionSelected: false,
            };
        };
        return RecordSearcherModel;
    }(DependencyProvider_1.BackboneCachedModel));
    exports.RecordSearcherModel = RecordSearcherModel;
});
