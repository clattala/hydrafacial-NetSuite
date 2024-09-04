/// <amd-module name="SuiteCommerce.ContactUsForm.InputField.Model"/>
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
define("SuiteCommerce.ContactUsForm.InputField.Model", ["require", "exports", "Backbone"], function (require, exports, Backbone_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var InputFieldModel = /** @class */ (function (_super) {
        __extends(InputFieldModel, _super);
        function InputFieldModel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(InputFieldModel.prototype, "isMandatory", {
            get: function () {
                return this.get('isMandatory');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputFieldModel.prototype, "isTextArea", {
            get: function () {
                return this.get('fieldType') === "textarea" /* TEXTAREA */;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputFieldModel.prototype, "isCheckbox", {
            get: function () {
                return this.get('fieldType') === "checkbox" /* CHECKBOX */;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputFieldModel.prototype, "isDate", {
            get: function () {
                return this.get('fieldType') === "date" /* DATE */;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputFieldModel.prototype, "isSubtitle", {
            get: function () {
                return this.get('fieldType') === "none" /* NONE */;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputFieldModel.prototype, "label", {
            get: function () {
                return this.get('label');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputFieldModel.prototype, "placeholder", {
            get: function () {
                return this.get('placeholder');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputFieldModel.prototype, "hasHelpText", {
            get: function () {
                return !!this.get('hasHelpText');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputFieldModel.prototype, "helpText", {
            get: function () {
                return this.get('helpText');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputFieldModel.prototype, "fieldId", {
            get: function () {
                return this.get('fieldId');
            },
            enumerable: true,
            configurable: true
        });
        return InputFieldModel;
    }(Backbone_1.Model));
    exports.InputFieldModel = InputFieldModel;
});
