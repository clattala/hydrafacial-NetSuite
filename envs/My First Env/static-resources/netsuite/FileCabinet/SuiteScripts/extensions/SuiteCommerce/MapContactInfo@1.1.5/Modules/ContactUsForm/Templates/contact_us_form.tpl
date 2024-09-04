<div class="contact-us-form {{#unless hideFormBackgroundColor }} contact-us-form-background
{{/unless}}">
  <div class="contact-us-form-general-information">
    {{{ formInformation }}}
  </div>

  {{#if hasMandatoryFields}}
    <small class="contact-us-form-required-field-reference">
      {{ mandatoryFieldReference }} <span class="contact-us-form-required-field-reference-symbol">*</span>
    </small>
  {{/if}}

  <form novalidate>
    <div data-view="InputFields.Collection"></div>
    <div>
      <button
              type="submit"
              class="contact-us-form-{{ submitButtonStyling.style }}-submit-button"
              title="{{ submitButtonStyling.helpText }}">
        {{ submitButtonStyling.label }}
      </button>
    </div>
  </form>

  <div class="contact-us-form-feedback-message" data-view="Feedback.Messages"></div>
</div>
