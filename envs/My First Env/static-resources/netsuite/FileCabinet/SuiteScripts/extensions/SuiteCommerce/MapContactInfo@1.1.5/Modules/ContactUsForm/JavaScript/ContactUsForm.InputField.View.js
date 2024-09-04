/// <amd-module name="SuiteCommerce.ContactUsForm.InputField.View"/>
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
define("SuiteCommerce.ContactUsForm.InputField.View", ["require", "exports", "Backbone", "contact_us_form_input_field.tpl"], function (require, exports, Backbone_1, template) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var InputFieldView = /** @class */ (function (_super) {
        __extends(InputFieldView, _super);
        function InputFieldView(options) {
            var _this = _super.call(this, options) || this;
            _this.template = template;
            _this.cmsContentId = options.cmsContentId;
            return _this;
        }
        InputFieldView.prototype.getContext = function () {
            var model = this.model;
            return {
                label: model.label,
                placeholder: model.placeholder,
                hasHelpText: model.hasHelpText,
                helpText: model.helpText,
                fieldId: model.fieldId,
                isTextArea: model.isTextArea,
                isCheckbox: model.isCheckbox,
                isDate: model.isDate,
                isMandatory: model.isMandatory,
                isSubtitle: model.isSubtitle,
                cmsContentId: this.cmsContentId,
            };
        };
        return InputFieldView;
    }(Backbone_1.View));
    exports.InputFieldView = InputFieldView;
});
