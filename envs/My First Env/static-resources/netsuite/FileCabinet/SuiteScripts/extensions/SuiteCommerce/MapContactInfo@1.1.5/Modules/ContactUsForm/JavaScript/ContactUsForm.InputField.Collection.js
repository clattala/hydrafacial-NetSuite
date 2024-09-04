/// <amd-module name="SuiteCommerce.ContactUsForm.InputField.Collection"/>
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
define("SuiteCommerce.ContactUsForm.InputField.Collection", ["require", "exports", "SuiteCommerce.ContactUsForm.InputField.Model", "Backbone"], function (require, exports, ContactUsForm_InputField_Model_1, Backbone_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var InputFieldCollection = /** @class */ (function (_super) {
        __extends(InputFieldCollection, _super);
        function InputFieldCollection() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.model = ContactUsForm_InputField_Model_1.InputFieldModel;
            return _this;
        }
        return InputFieldCollection;
    }(Backbone_1.Collection));
    exports.InputFieldCollection = InputFieldCollection;
});
