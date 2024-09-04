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
define("SuiteCommerce.ProductComparison.ComparisonPage.FieldValueDate.PartialController", ["require", "exports", "SuiteCommerce.ProductComparison.ComparisonPage.Partial.Controller", "comparison_page_field_value_date.partial.tpl"], function (require, exports, ComparisonPage_PartialController_1, PartialTemplate) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FieldValueDatePartialController = /** @class */ (function (_super) {
        __extends(FieldValueDatePartialController, _super);
        function FieldValueDatePartialController() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.supportedFormats = [
                'd mmm',
                'd mmmm',
                'd/m',
                'dd/mm/yy',
                'dd/mm/yyyy',
                'mmm d',
                'mmmm d',
                'm/d',
                'mm/dd/yy',
                'mm/dd/yyyy',
            ];
            return _this;
        }
        Object.defineProperty(FieldValueDatePartialController.prototype, "template", {
            get: function () {
                return PartialTemplate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FieldValueDatePartialController.prototype, "partialName", {
            get: function () {
                return 'dateField';
            },
            enumerable: true,
            configurable: true
        });
        FieldValueDatePartialController.prototype.prepareHelpers = function () {
            var _this = this;
            this.helpers = [
                {
                    name: 'getFormattedDate',
                    helperAction: function (item, field) {
                        var fieldValue = item[field.fieldId];
                        var selectedFormat = field.placeholder
                            && _this.supportedFormats.indexOf(field.placeholder) !== -1
                            ? field.placeholder
                            : null;
                        if (selectedFormat) {
                            fieldValue = _this.formatDate(fieldValue, selectedFormat);
                        }
                        return fieldValue;
                    },
                },
            ];
        };
        FieldValueDatePartialController.prototype.formatDate = function (receivedDate, dateFormat) {
            var newDate = dateFormat;
            var monthReplaced = false;
            var date = new Date(receivedDate);
            var replaceMonth = function (monthLength, format) {
                var matched = newDate.match(monthLength);
                if (matched && !monthReplaced) {
                    monthReplaced = true;
                    return newDate.replace(monthLength, date.toLocaleString('en-us', { month: format }));
                }
                return newDate;
            };
            if (this.isOldInternetExplorer()) {
                return receivedDate;
            }
            newDate = newDate.replace('yyyy', date.toLocaleString('en-us', { year: 'numeric' }));
            newDate = newDate.replace('yy', date.toLocaleString('en-us', { year: '2-digit' }));
            newDate = newDate.replace('dd', date.toLocaleString('en-us', { day: '2-digit' }));
            newDate = newDate.replace('d', date.toLocaleString('en-us', { day: 'numeric' }));
            newDate = replaceMonth('mmmm', 'long');
            newDate = replaceMonth('mmm', 'short');
            newDate = replaceMonth('mm', '2-digit');
            newDate = replaceMonth('m', 'numeric');
            return newDate;
        };
        FieldValueDatePartialController.prototype.isOldInternetExplorer = function () {
            return !!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g);
        };
        return FieldValueDatePartialController;
    }(ComparisonPage_PartialController_1.PartialController));
    exports.FieldValueDatePartialController = FieldValueDatePartialController;
});
