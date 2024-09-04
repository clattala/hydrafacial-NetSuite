{{#if isSubtitle}}
  <p class="contact-us-form-input-field-subtitle">{{ label }}</p>
{{else}}
  <div data-validation="control-group"
        class="contact-us-form-{{ fieldId }} contact-us-form-input-field-container">
    {{#if isCheckbox}}
      <label for="{{ fieldId }}-{{ cmsContentId }}" class="contact-us-form-input-field-checkbox">
        <input
          id="{{ fieldId }}-{{ cmsContentId }}"
          type="checkbox"
          name="{{ fieldId }}"
          placeholder="{{ placeholder }}"
          {{#if hasHelpText}} title="{{ helpText }}" {{/if}} /> {{ label }}
      </label>
    {{else}}
      <label for="{{ fieldId }}-{{ cmsContentId }}">
        {{ label }}
        {{#if isMandatory}}<small class="contact-us-form-input-field-required">*</small>{{/if}}
      </label>
      <div data-validation="control">
        {{#if isTextArea}}
        <textarea id="{{ fieldId }}-{{ cmsContentId }}" name="{{ fieldId }}"
                  placeholder="{{ placeholder }}"></textarea>
        {{else}}
          {{#if isDate}}
            <input id="{{ fieldId }}-{{ cmsContentId }}" type="date" name="{{ fieldId }}"
                    placeholder="{{ placeholder }}" data-validation="control" data-field-type="date"
                    data-format="yyyy-mm-dd">
          {{else}}
            {{! Number, Email and Url field types are partialy supported by IE10.
            So, that kind of input fields are defined with type="text". }}
            <input id="{{ fieldId }}-{{ cmsContentId }}" type="text" name="{{ fieldId }}"
                    placeholder="{{ placeholder }}" />
          {{/if}}
        {{/if}}
      </div>

      {{#if hasHelpText}}
        <small>{{ helpText }}</small>
      {{/if}}
    {{/if}}
  </div>
{{/if}}
