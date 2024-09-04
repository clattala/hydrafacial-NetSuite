/// <amd-module name="SuiteCommerce.ProductComparison.PLP.Configuration"/>
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
define("SuiteCommerce.ProductComparison.PLP.Configuration", ["require", "exports", "SuiteCommerce.ProductComparison.Common.Configuration"], function (require, exports, Configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PLPConfiguration = /** @class */ (function (_super) {
        __extends(PLPConfiguration, _super);
        function PLPConfiguration() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(PLPConfiguration, "addToCompareLabel", {
            get: function () {
                return this.get('productcomparison.addToCompareLabel');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PLPConfiguration, "excessInItemsAllowedMessage", {
            get: function () {
                return this.get('productcomparison.excessInItemsAllowedMessage');
            },
            enumerable: true,
            configurable: true
        });
        return PLPConfiguration;
    }(Configuration_1.Configuration));
    exports.PLPConfiguration = PLPConfiguration;
});
