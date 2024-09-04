/// <amd-module name="SuiteCommerce.ContactUsForm.Model"/>
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
define("SuiteCommerce.ContactUsForm.Model", ["require", "exports", "Backbone", "SuiteCommerce.MapAndContactUs.Utils", "underscore"], function (require, exports, Backbone_1, Utils_1, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ContactUsFormModel = /** @class */ (function (_super) {
        __extends(ContactUsFormModel, _super);
        function ContactUsFormModel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.urlRoot = Utils_1.Utils.getAbsoluteUrl(getExtensionAssetsPath('services/ContactUsForm.Service.ss'));
            _this.validation = {};
            return _this;
        }
        ContactUsFormModel.prototype.setFieldsValidation = function (inputFields, requiredFieldMessage) {
            var _this = this;
            // Fields that are not hidden have to be validated
            _.each(inputFields, function (fieldSettings) {
                if (!fieldSettings.hideField && fieldSettings.fieldId) {
                    // create validation object for current field
                    _this.setFieldValidation(fieldSettings, requiredFieldMessage);
                }
            });
        };
        ContactUsFormModel.prototype.setFieldValidation = function (fieldSettings, requiredFieldMessage) {
            var fieldValidation = [{
                    required: fieldSettings.isMandatory,
                    msg: requiredFieldMessage.replace('[[field]]', fieldSettings.label),
                }];
            if (fieldSettings.fieldValidationPattern) {
                var fieldValidationPattern = {
                    pattern: fieldSettings.fieldValidationPattern
                };
                if (fieldSettings.invalidEmailMessage) {
                    fieldValidationPattern.msg = fieldSettings.invalidEmailMessage;
                }
                fieldValidation.push(fieldValidationPattern);
            }
            this.validation[fieldSettings.fieldId] = fieldValidation;
        };
        return ContactUsFormModel;
    }(Backbone_1.Model));
    exports.ContactUsFormModel = ContactUsFormModel;
});
