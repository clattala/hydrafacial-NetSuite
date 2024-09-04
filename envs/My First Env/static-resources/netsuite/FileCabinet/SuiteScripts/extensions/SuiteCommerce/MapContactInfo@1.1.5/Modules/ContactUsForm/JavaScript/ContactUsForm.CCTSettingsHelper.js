/// <amd-module name="SuiteCommerce.ContactUsForm.CCTSettingsHelper"/>
define("SuiteCommerce.ContactUsForm.CCTSettingsHelper", ["require", "exports", "underscore"], function (require, exports, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var additionalFieldsLength = 5;
    var buttonStyles = {
        1: 'primary',
        2: 'secondary',
        3: 'tertiary'
    };
    // Field types mapping for "customlist_sc_cct_cuf_add_field_types" record instances
    var fieldTypesMapping = {
        1: {
            fieldType: "none" /* NONE */,
            validationPattern: false
        },
        2: {
            fieldType: "text" /* TEXT */,
            validationPattern: false
        },
        3: {
            fieldType: "number" /* NUMBER */,
            validationPattern: "number" /* NUMBER */
        },
        4: {
            fieldType: "email" /* EMAIL */,
            validationPattern: "email" /* EMAIL */
        },
        5: {
            fieldType: "url" /* URL */,
            validationPattern: "url" /* URL */
        },
        6: {
            fieldType: "textarea" /* TEXTAREA */,
            validationPattern: false
        },
        7: {
            fieldType: "date" /* DATE */,
            validationPattern: false
        },
        8: {
            fieldType: "checkbox" /* CHECKBOX */,
            validationPattern: false
        }
    };
    function getCCTSettingsMapping(cctSettings) {
        var cctSettingsMapping = {
            formInformation: cctSettings.custrecord_sc_cct_cuf_form_information,
            requiredFieldMessage: cctSettings.custrecord_sc_cct_cuf_required_field_msg,
            feedbackMessages: {
                success: cctSettings.custrecord_sc_cct_cuf_success_msg,
                error: cctSettings.custrecord_sc_cct_cuf_submit_error_msg
            },
            submitButtonStyling: {
                label: cctSettings.custrecord_sc_cct_cuf_button_text,
                helpText: cctSettings.custrecord_sc_cct_cuf_button_help_text,
                style: buttonStyles[cctSettings.custrecord_sc_cct_cuf_button_style]
            },
            hideBackgroundColor: cctSettings.custrecord_sc_cct_cuf_hide_bg_color === 'T',
            mandatoryFieldReference: cctSettings.custrecord_sc_cct_cuf_mtry_field_ref,
            inputFields: [
                {
                    label: cctSettings.custrecord_sc_cct_cuf_name_label,
                    placeholder: cctSettings.custrecord_sc_cct_cuf_name_placeh,
                    hasHelpText: cctSettings.custrecord_sc_cct_cuf_name_help_text !== '',
                    helpText: cctSettings.custrecord_sc_cct_cuf_name_help_text,
                    isMandatory: cctSettings.custrecord_sc_cct_cuf_mtry_name_field === 'T',
                    hideField: cctSettings.custrecord_sc_cct_cuf_hide_name_field === 'T',
                    fieldId: 'firstname',
                    fieldType: "text" /* TEXT */
                },
                {
                    label: cctSettings.custrecord_sc_cct_cuf_lastname_label,
                    placeholder: cctSettings.custrecord_sc_cct_cuf_lastname_placeh,
                    hasHelpText: cctSettings.custrecord_sc_cct_cuf_lastname_help_text !== '',
                    helpText: cctSettings.custrecord_sc_cct_cuf_lastname_help_text,
                    isMandatory: cctSettings.custrecord_sc_cct_cuf_mtry_lastname === 'T',
                    hideField: cctSettings.custrecord_sc_cct_cuf_hide_lastname === 'T',
                    fieldId: 'lastname',
                    fieldType: "text" /* TEXT */
                },
                {
                    label: cctSettings.custrecord_sc_cct_cuf_email_label,
                    placeholder: cctSettings.custrecord_sc_cct_cuf_email_placeh,
                    hasHelpText: cctSettings.custrecord_sc_cct_cuf_email_help_text !== '',
                    helpText: cctSettings.custrecord_sc_cct_cuf_email_help_text,
                    isMandatory: cctSettings.custrecord_sc_cct_cuf_mtry_email === 'T',
                    hideField: cctSettings.custrecord_sc_cct_cuf_hide_email_field === 'T',
                    fieldId: 'email',
                    fieldType: "email" /* EMAIL */,
                    fieldValidationPattern: "email" /* EMAIL */,
                    invalidEmailMessage: cctSettings.custrecord_sc_cct_cuf_invalid_email_msg
                },
                {
                    label: cctSettings.custrecord_sc_cct_cuf_phone_label,
                    placeholder: cctSettings.custrecord_sc_cct_cuf_phone_placeh,
                    hasHelpText: cctSettings.custrecord_sc_cct_cuf_phone_help_text !== '',
                    helpText: cctSettings.custrecord_sc_cct_cuf_phone_help_text,
                    isMandatory: cctSettings.custrecord_sc_cct_cuf_mtry_phone_field === 'T',
                    hideField: cctSettings.custrecord_sc_cct_cuf_hide_phone_field === 'T',
                    fieldId: 'phone',
                    fieldType: "text" /* TEXT */,
                    fieldValidationPattern: "number" /* NUMBER */
                },
                {
                    label: cctSettings.custrecord_sc_cct_cuf_company_label,
                    placeholder: cctSettings.custrecord_sc_cct_cuf_company_placeh,
                    hasHelpText: cctSettings.custrecord_sc_cct_cuf_company_help_text !== '',
                    helpText: cctSettings.custrecord_sc_cct_cuf_company_help_text,
                    isMandatory: cctSettings.custrecord_sc_cct_cuf_mtry_company_field === 'T',
                    hideField: cctSettings.custrecord_sc_cct_cuf_hide_company_field === 'T',
                    fieldId: 'company',
                    fieldType: "text" /* TEXT */
                },
                {
                    label: cctSettings.custrecord_sc_cct_cuf_subject_label,
                    placeholder: cctSettings.custrecord_sc_cct_cuf_subject_placeh,
                    hasHelpText: cctSettings.custrecord_sc_cct_cuf_subject_help_text !== '',
                    helpText: cctSettings.custrecord_sc_cct_cuf_subject_help_text,
                    isMandatory: cctSettings.custrecord_sc_cct_cuf_mtry_subject_field === 'T',
                    hideField: cctSettings.custrecord_sc_cct_cuf_hide_subject_field === 'T',
                    fieldId: 'subject',
                    fieldType: "text" /* TEXT */
                },
                {
                    label: cctSettings.custrecord_sc_cct_cuf_message_label,
                    placeholder: cctSettings.custrecord_sc_cct_cuf_message_placeh,
                    hasHelpText: cctSettings.custrecord_sc_cct_cuf_message_help_text !== '',
                    helpText: cctSettings.custrecord_sc_cct_cuf_message_help_text,
                    isMandatory: cctSettings.custrecord_sc_cct_cuf_mtry_message_field === 'T',
                    hideField: cctSettings.custrecord_sc_cct_cuf_hide_message_field === 'T',
                    fieldId: 'message',
                    fieldType: "textarea" /* TEXTAREA */
                }
            ]
        };
        // Set additional fields for CCT instance
        _.bind(setCCTSettingMappingForAdditionalFields, cctSettingsMapping, cctSettings)();
        // Sort input fields
        _.bind(sortInputFields, cctSettingsMapping, cctSettings)();
        // Ignore hidden input fields
        cctSettingsMapping.inputFields = _.filter(cctSettingsMapping.inputFields, function filterHiddenInputFields(inputField) {
            return !inputField.hideField;
        });
        return cctSettingsMapping;
    }
    exports.getCCTSettingsMapping = getCCTSettingsMapping;
    function setCCTSettingMappingForAdditionalFields(cctSettings) {
        for (var i = 1; i <= additionalFieldsLength; i++) {
            var internalID = cctSettings['custrecord_sc_cct_cuf_add_f_id_' + i];
            var fieldTypeId = +cctSettings['custrecord_sc_cct_cuf_add_f_type_' + i];
            var fieldType = fieldTypesMapping[fieldTypeId].fieldType;
            var fieldValidationPattern = fieldTypesMapping[fieldTypeId].validationPattern;
            var additionalField = {
                internalId: internalID,
                label: cctSettings['custrecord_sc_cct_cuf_add_f_label_' + i],
                placeholder: cctSettings['custrecord_sc_cct_cuf_add_f_placeh_' + i],
                hasHelpText: cctSettings['custrecord_sc_cct_cuf_add_f_help_text_' + i] !== '',
                helpText: cctSettings['custrecord_sc_cct_cuf_add_f_help_text_' + i],
                isMandatory: cctSettings['custrecord_sc_cct_cuf_mtry_add_field_' + i] === 'T',
                hideField: cctSettings['custrecord_sc_cct_cuf_hide_add_field_' + i] === 'T',
                fieldId: internalID,
                fieldType: fieldType,
                fieldValidationPattern: fieldValidationPattern,
            };
            if (additionalField.fieldType === "email" /* EMAIL */) {
                additionalField.invalidEmailMessage = cctSettings.custrecord_sc_cct_cuf_invalid_email_msg;
            }
            this.inputFields.push(additionalField);
        }
    }
    function sortInputFields(cctSettings) {
        var _this = this;
        var inputFieldsSorting = getInputFieldsSorting(cctSettings);
        var inputFields = _.clone(this.inputFields);
        _.each(inputFieldsSorting, function (fieldPosition, index) {
            if (fieldPosition) {
                var inputFieldToRelocate = inputFields[+fieldPosition];
                var inputFieldToRelocateId_1 = inputFieldToRelocate.fieldId;
                var inputFieldToRelocateLabel_1 = inputFieldToRelocate.label;
                var inputFieldCurrentIndex = _.findIndex(_this.inputFields, function (inputField) {
                    if (inputField.fieldId) {
                        return inputFieldToRelocateId_1 === inputField.fieldId;
                    }
                    if (inputField.label) {
                        return inputFieldToRelocateLabel_1 === inputField.label;
                    }
                    return false;
                });
                _this.inputFields.splice(inputFieldCurrentIndex, 1);
                _this.inputFields.splice(index, 0, inputFieldToRelocate);
            }
        });
    }
    function getInputFieldsSorting(cctSettings) {
        var inputFieldsSorting = [];
        var inputFieldsPositionKeys = [
            'custrecord_sc_cct_cuf_field_position_1',
            'custrecord_sc_cct_cuf_field_position_2',
            'custrecord_sc_cct_cuf_field_position_3',
            'custrecord_sc_cct_cuf_field_position_4',
            'custrecord_sc_cct_cuf_field_position_5',
            'custrecord_sc_cct_cuf_field_position_6',
            'custrecord_sc_cct_cuf_field_position_7',
            'custrecord_sc_cct_cuf_field_position_8',
            'custrecord_sc_cct_cuf_field_position_9',
            'custrecord_sc_cct_cuf_field_position_10',
            'custrecord_sc_cct_cuf_field_position_11',
            'custrecord_sc_cct_cuf_field_position_12'
        ];
        _.each(inputFieldsPositionKeys, function (key) {
            var inputFieldPosition = cctSettings[key];
            if (inputFieldPosition === '1') {
                inputFieldPosition = false;
            }
            else {
                inputFieldPosition = parseInt(cctSettings[key], 10) - 2;
            }
            inputFieldsSorting.push(inputFieldPosition);
        });
        return inputFieldsSorting;
    }
});
