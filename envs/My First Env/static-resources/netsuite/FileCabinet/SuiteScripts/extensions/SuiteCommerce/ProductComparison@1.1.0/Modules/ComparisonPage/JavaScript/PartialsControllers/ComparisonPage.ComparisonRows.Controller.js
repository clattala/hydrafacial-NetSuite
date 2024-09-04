/// <amd-module name="SuiteCommerce.ProductComparison.ComparisonPage.ComparisonRows.PartialController"/>
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
define("SuiteCommerce.ProductComparison.ComparisonPage.ComparisonRows.PartialController", ["require", "exports", "SuiteCommerce.ProductComparison.ComparisonPage.Partial.Controller", "comparison_page_comparison_rows.partial.tpl"], function (require, exports, ComparisonPage_PartialController_1, PartialTemplate) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ComparisonRowsPartialController = /** @class */ (function (_super) {
        __extends(ComparisonRowsPartialController, _super);
        function ComparisonRowsPartialController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(ComparisonRowsPartialController.prototype, "template", {
            get: function () {
                return PartialTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ComparisonRowsPartialController.prototype, "partialName", {
            get: function () {
                return 'comparisonRows';
            },
            enumerable: true,
            configurable: true
        });
        ComparisonRowsPartialController.prototype.prepareHelpers = function () {
            this.helpers = [
                {
                    name: 'setVar',
                    helperAction: function (varName, varValue) {
                        self[varName] = varValue;
                    },
                },
                {
                    name: 'increaseVar',
                    helperAction: function (varName, increaseValue) {
                        self[varName] += increaseValue;
                    },
                },
                {
                    name: 'getVar',
                    helperAction: function (varName) {
                        return self[varName];
                    },
                },
                {
                    name: 'isOddOrEven',
                    helperAction: function (numberParameter) {
                        return (numberParameter % 2) === 0 ? 'odd' : 'even';
                    },
                },
                {
                    name: 'itemFieldValue',
                    helperAction: function (item, fieldId) {
                        return item[fieldId];
                    },
                },
            ];
        };
        return ComparisonRowsPartialController;
    }(ComparisonPage_PartialController_1.PartialController));
    exports.ComparisonRowsPartialController = ComparisonRowsPartialController;
});
