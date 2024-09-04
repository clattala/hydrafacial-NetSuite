<div class="check-type">
{{#if (getFieldValueForItem item field.fieldId)}}
  <i class="check-icon"/>
{{else}}
  {{#if (isCheckCross field.type)}}
    <i class="cross-icon"/>
  {{/if}}
{{/if}}
</div>
