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
define("SuiteCommerce.ProductComparison.ComparisonPage.FieldValueLink.PartialController", ["require", "exports", "SuiteCommerce.ProductComparison.ComparisonPage.Partial.Controller", "comparison_page_field_value_link.partial.tpl"], function (require, exports, ComparisonPage_PartialController_1, PartialTemplate) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FieldValueLinkPartialController = /** @class */ (function (_super) {
        __extends(FieldValueLinkPartialController, _super);
        function FieldValueLinkPartialController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(FieldValueLinkPartialController.prototype, "template", {
            get: function () {
                return PartialTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FieldValueLinkPartialController.prototype, "partialName", {
            get: function () {
                return 'linkField';
            },
            enumerable: true,
            configurable: true
        });
        FieldValueLinkPartialController.prototype.prepareHelpers = function () {
            this.helpers = [
                {
                    name: 'getFormattedLink',
                    helperAction: function (item, field) {
                        var fieldValue = item[field.fieldId];
                        var placeholder = item[field.fieldId] && field.placeholder ? field.placeholder : null;
                        return placeholder || fieldValue;
                    },
                },
            ];
        };
        return FieldValueLinkPartialController;
    }(ComparisonPage_PartialController_1.PartialController));
    exports.FieldValueLinkPartialController = FieldValueLinkPartialController;
});
