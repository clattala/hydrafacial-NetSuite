/// <amd-module name="SuiteCommerce.ContactUsForm.View"/>
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
define("SuiteCommerce.ContactUsForm.View", ["require", "exports", "CustomContentType.Base.View", "Backbone.FormView", "Backbone.CollectionView", "SuiteCommerce.ContactUsForm.InputField.Collection", "SuiteCommerce.ContactUsForm.CCTSettingsHelper", "SuiteCommerce.ContactUsForm.InputField.View", "underscore", "contact_us_form.tpl", "SuiteCommerce.ContactUsForm.InputField.Model", "SuiteCommerce.MapAndContactUs.Common.Instrumentation.Helper", "SuiteCommerce.MapAndContactUs.Instrumentation", "SuiteCommerce.MapAndContactUs.ExtMessage.View", "SuiteCommerce.MapAndContactUs.ExtMessage.Model"], function (require, exports, CustomContentTypeBaseView, BackboneFormView, BackboneCollectionView, ContactUsForm_InputField_Collection_1, ContactUsForm_CCTSettingsHelper_1, ContactUsForm_InputField_View_1, _, template, ContactUsForm_InputField_Model_1, Instrumentation_Helper_1, Instrumentation_1, ExtMessage_View_1, ExtMessage_Model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ContactUsFormView = /** @class */ (function (_super) {
        __extends(ContactUsFormView, _super);
        function ContactUsFormView(options) {
            var _this = _super.call(this, options) || this;
            _this.template = template;
            _this.bindings = {};
            _this.events = {
                'submit form': 'submitForm',
            };
            _this.cctSettingsMapping;
            BackboneFormView.add(_this);
            return _this;
        }
        ContactUsFormView.prototype.install = function (options, contextData) {
            _super.prototype.install.call(this, options, contextData);
            this.log(options);
            return jQuery.Deferred().resolve();
        };
        ContactUsFormView.prototype.log = function (options) {
            Instrumentation_Helper_1.InstrumentationHelper.log({
                activity: 'Contact Us Form loaded',
            });
            this.logAdditionalFields(options);
        };
        ContactUsFormView.prototype.logAdditionalFields = function (options) {
            var count = 0;
            for (var i = 1; i <= 5; i++) {
                if (options["custrecord_sc_cct_cuf_add_f_id_" + i] &&
                    options["custrecord_sc_cct_cuf_hide_add_field_" + i] === 'F') {
                    count++;
                }
            }
            Instrumentation_Helper_1.InstrumentationHelper.log({
                activity: 'Additional Fields',
                instanceCount: count,
            });
        };
        Object.defineProperty(ContactUsFormView.prototype, "childViews", {
            get: function () {
                var _this = this;
                return {
                    'InputFields.Collection': function () {
                        var inputFieldsCollectionView;
                        if (_this.cctSettingsMapping) {
                            var inputFieldModels_1 = [];
                            _.each(_this.cctSettingsMapping.inputFields, function (inputField) {
                                inputFieldModels_1.push(new ContactUsForm_InputField_Model_1.InputFieldModel(inputField));
                            });
                            inputFieldsCollectionView = new BackboneCollectionView({
                                childView: ContactUsForm_InputField_View_1.InputFieldView,
                                collection: new ContactUsForm_InputField_Collection_1.InputFieldCollection(inputFieldModels_1),
                                childViewOptions: {
                                    cmsContentId: _this.model.get('cmsContentId'),
                                },
                            });
                            // After input fields rendering, input field's bindings between View and Template have to be defined
                            _this.setFieldsBindings(_this.cctSettingsMapping.inputFields);
                            // Following the previous line, model's validation object also has to be defined
                            _this.model.setFieldsValidation(_this.cctSettingsMapping.inputFields, _this.cctSettingsMapping.requiredFieldMessage);
                            return inputFieldsCollectionView;
                        }
                        return;
                    },
                    'Feedback.Messages': function () {
                        if (_this.feedbackMessage) {
                            return new ExtMessage_View_1.ExtMessageView({
                                model: new ExtMessage_Model_1.ExtMessageModel({
                                    message: _this.feedbackMessage.message,
                                    type: _this.feedbackMessage.type,
                                    closable: false
                                })
                            });
                        }
                    },
                };
            },
            enumerable: true,
            configurable: true
        });
        ContactUsFormView.prototype.setFieldsBindings = function (inputFields) {
            var _this = this;
            // Set input's fields bindings between template and view
            _.each(inputFields, function (fieldSettings) {
                if (fieldSettings.fieldId) {
                    // !fieldSettings.hideField && fieldSettings.fieldId
                    var fieldSelector = ".contact-us-form form [name=\"" + fieldSettings.fieldId + "\"]";
                    // Set bindings's object for input field
                    _this.bindings[fieldSelector] = fieldSettings.fieldId;
                }
            });
            // Re-bind fields between View and Model
            BackboneFormView.formatBindings(this);
        };
        ContactUsFormView.prototype.submitForm = function (event) {
            var _this = this;
            event.preventDefault();
            var promise = this.saveForm(event);
            var log = Instrumentation_1.default.getLog('SubmittedForm');
            log.startTimer();
            if (promise) {
                promise
                    .fail(function () {
                    _this.logSubmission(log, 'Error');
                    _this.feedbackMessage = {
                        message: _this.cctSettingsMapping.feedbackMessages.error,
                        type: 'error',
                    };
                    _this.render();
                })
                    .done(function () {
                    _this.logSubmission(log, 'Success');
                    _this.clearFiledsValues();
                    _this.feedbackMessage = {
                        message: _this.cctSettingsMapping.feedbackMessages.success,
                        type: 'success',
                    };
                    _this.render();
                });
            }
        };
        ContactUsFormView.prototype.logSubmission = function (log, result) {
            log.endTimer();
            log.setParameters({
                activity: 'Contact Form submitted',
                subType: result,
                totalTime: log.getElapsedTimeForTimer(),
            });
            log.submit();
        };
        ContactUsFormView.prototype.clearFiledsValues = function () {
            var _this = this;
            _.each(this.validationModel.keys(), function (attributeName) {
                if (attributeName !== 'cmsContentId' &&
                    attributeName !== 'defaultSubsidiary' &&
                    attributeName !== 'domain') {
                    _this.validationModel.unset(attributeName);
                }
            });
        };
        ContactUsFormView.prototype.getContext = function () {
            if (_.isEmpty(this.settings)) {
                return;
            }
            var cmsContentId = this.instanceId.split('-')[1];
            // CCT's setting can be accessed in getContext method.
            // For that reason, cctSettingMapping variable is set at this point.
            this.cctSettingsMapping = ContactUsForm_CCTSettingsHelper_1.getCCTSettingsMapping(this.settings);
            // CMS Content ID also can be accessed in this method
            this.model.set('cmsContentId', cmsContentId);
            var hasMandatoryFields = _.find(this.cctSettingsMapping.inputFields, function (field) { return field.isMandatory; });
            return {
                formInformation: this.cctSettingsMapping.formInformation,
                submitButtonStyling: this.cctSettingsMapping.submitButtonStyling,
                hideFormBackgroundColor: this.cctSettingsMapping.hideBackgroundColor,
                mandatoryFieldReference: this.cctSettingsMapping.mandatoryFieldReference,
                hasMandatoryFields: !!hasMandatoryFields,
            };
        };
        return ContactUsFormView;
    }(CustomContentTypeBaseView));
    exports.ContactUsFormView = ContactUsFormView;
});
