/// <amd-module name="SuiteCommerce.ProductComparison.ComparisonPage.FieldValueSwatch.PartialController"/>
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
define("SuiteCommerce.ProductComparison.ComparisonPage.FieldValueSwatch.PartialController", ["require", "exports", "underscore", "SuiteCommerce.ProductComparison.ComparisonPage.Partial.Controller", "comparison_page_field_value_swatch.partial.tpl", "SuiteCommerce.ProductComparison.ComparisonPage.Configuration"], function (require, exports, _, ComparisonPage_PartialController_1, PartialTemplate, ComparisonPage_Configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FieldValueSwatchPartialController = /** @class */ (function (_super) {
        __extends(FieldValueSwatchPartialController, _super);
        function FieldValueSwatchPartialController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(FieldValueSwatchPartialController.prototype, "template", {
            get: function () {
                return PartialTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FieldValueSwatchPartialController.prototype, "partialName", {
            get: function () {
                return 'swatchField';
            },
            enumerable: true,
            configurable: true
        });
        FieldValueSwatchPartialController.prototype.prepareHelpers = function () {
            var _this = this;
            this.helpers = [
                {
                    name: 'getColorCodes',
                    helperAction: function (field, fieldValue) {
                        return _this.getSwatches(field, fieldValue);
                    },
                },
            ];
        };
        FieldValueSwatchPartialController.prototype.getSwatches = function (field, item) {
            var colorPalette = this.getColorsForField(field.fieldId);
            var colors = [];
            var colorsLabels;
            if (item[field.fieldId] && item[field.fieldId] !== '&nbsp;') {
                colorsLabels = String(item[field.fieldId]).replace(/, /gi, ',').split(',');
                _.each(colorsLabels, function (colorLabel) {
                    colors.push({
                        label: colorLabel,
                        code: (colorPalette[colorLabel] || colorPalette[colorLabel.toLowerCase()])
                            ? colorPalette[colorLabel] || colorPalette[colorLabel.toLowerCase()]
                            : null,
                    });
                });
            }
            return colors;
        };
        FieldValueSwatchPartialController.prototype.getColorsForField = function (fieldId) {
            var optionsConfiguration = ComparisonPage_Configuration_1.ComparisonPageConfiguration.itemOptions.optionsConfiguration;
            var colorsConfiguredForField = _.filter(optionsConfiguration, function (option) {
                return option.cartOptionId === fieldId && option.colors;
            });
            if (colorsConfiguredForField.length > 0) {
                return colorsConfiguredForField[0].colors;
            }
            return this.getDefaultColorPalette();
        };
        FieldValueSwatchPartialController.prototype.getDefaultColorPalette = function () {
            var colorPalette = {};
            if (ComparisonPage_Configuration_1.ComparisonPageConfiguration.layout.colorPalette) {
                _.each(ComparisonPage_Configuration_1.ComparisonPageConfiguration.layout.colorPalette, function (color) {
                    colorPalette[color.colorName] = color.colorValue;
                });
            }
            return colorPalette;
        };
        return FieldValueSwatchPartialController;
    }(ComparisonPage_PartialController_1.PartialController));
    exports.FieldValueSwatchPartialController = FieldValueSwatchPartialController;
});
