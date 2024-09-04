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
define("SuiteCommerce.ProductComparison.ComparisonPage.FieldValueCheck.PartialController", ["require", "exports", "SuiteCommerce.ProductComparison.ComparisonPage.Partial.Controller", "comparison_page_field_value_check.partial.tpl"], function (require, exports, ComparisonPage_PartialController_1, PartialTemplate) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FieldValueCheckPartialController = /** @class */ (function (_super) {
        __extends(FieldValueCheckPartialController, _super);
        function FieldValueCheckPartialController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(FieldValueCheckPartialController.prototype, "template", {
            get: function () {
                return PartialTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FieldValueCheckPartialController.prototype, "partialName", {
            get: function () {
                return 'checkField';
            },
            enumerable: true,
            configurable: true
        });
        FieldValueCheckPartialController.prototype.prepareHelpers = function () {
            this.helpers = [
                {
                    name: 'isCheckCross',
                    helperAction: function (fieldType) {
                        return fieldType === 'Check/Cross';
                    },
                },
            ];
        };
        return FieldValueCheckPartialController;
    }(ComparisonPage_PartialController_1.PartialController));
    exports.FieldValueCheckPartialController = FieldValueCheckPartialController;
});
