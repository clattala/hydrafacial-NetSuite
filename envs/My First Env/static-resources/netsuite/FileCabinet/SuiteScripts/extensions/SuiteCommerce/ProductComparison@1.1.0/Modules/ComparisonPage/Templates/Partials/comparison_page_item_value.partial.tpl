<div class="field-value-container" data-itemid="{{item.internalid}}"
  data-fieldid="{{field.fieldId}}" data-fieldtype="{{field.type}}"
  data-unformatted-value="{{getFieldValueForItem item field.fieldId}}">
  {{#if (getPartialForField field.type)}}
    {{> (getPartialForField field.type) item=item field=field }}
  {{else}}
    {{getFieldValueForItem item field.fieldId}}
  {{/if}}
</div>
