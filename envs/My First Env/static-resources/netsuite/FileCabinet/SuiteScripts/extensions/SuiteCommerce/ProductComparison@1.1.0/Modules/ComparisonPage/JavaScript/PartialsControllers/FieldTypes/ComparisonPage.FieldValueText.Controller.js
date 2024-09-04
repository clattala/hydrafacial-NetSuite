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
define("SuiteCommerce.ProductComparison.ComparisonPage.FieldValueText.PartialController", ["require", "exports", "SuiteCommerce.ProductComparison.ComparisonPage.Partial.Controller", "comparison_page_field_value_text.partial.tpl"], function (require, exports, ComparisonPage_PartialController_1, PartialTemplate) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FieldValueTextPartialController = /** @class */ (function (_super) {
        __extends(FieldValueTextPartialController, _super);
        function FieldValueTextPartialController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(FieldValueTextPartialController.prototype, "template", {
            get: function () {
                return PartialTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FieldValueTextPartialController.prototype, "partialName", {
            get: function () {
                return 'textField';
            },
            enumerable: true,
            configurable: true
        });
        FieldValueTextPartialController.prototype.prepareHelpers = function () {
            this.helpers = [
                {
                    name: 'getFormattedText',
                    helperAction: function (item, field) {
                        var fieldValue = item[field.fieldId];
                        var placeholder = field.placeholder;
                        if (placeholder) {
                            fieldValue = placeholder.indexOf('[[value]]') !== -1
                                ? placeholder.replace('[[value]]', fieldValue)
                                : placeholder + " " + fieldValue;
                        }
                        return fieldValue;
                    },
                },
            ];
        };
        return FieldValueTextPartialController;
    }(ComparisonPage_PartialController_1.PartialController));
    exports.FieldValueTextPartialController = FieldValueTextPartialController;
});
