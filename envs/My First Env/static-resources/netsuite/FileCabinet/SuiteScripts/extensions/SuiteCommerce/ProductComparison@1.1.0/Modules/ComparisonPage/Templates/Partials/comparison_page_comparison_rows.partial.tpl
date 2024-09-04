{{#if showComparisonRows}}
  {{setVar "rowCounter" 0}}
  {{#each groupsOfFieldsToCompare}}
    {{#if showRow}}
      {{increaseVar "rowCounter" 1}}
      <tr class="group-name-row row-{{isOddOrEven (getVar "rowCounter")}}" data-groupname="{{label}}">
        <td class="upper-text specifications-column">
          <strong>{{label}}</strong>
        </td>
        {{#each ../items}}
            <td/>
        {{/each}}
      </tr>
    {{/if}}
    {{#each fields}}
      {{increaseVar "rowCounter" 1}}
      <tr class="field-label-row row-{{isOddOrEven (getVar "rowCounter")}}" data-fieldid="{{fieldId}}">
        <td class="upper-text small-label field-label-td specifications-column" data-fieldid="{{../fieldId}}">
          {{translate label}}
        </td>
        {{#each ../../items}}
          <td class="item-value field-type-{{../type}}"  data-itemid="{{internalid}}" data-fieldid="{{../fieldId}}">
            {{> itemValueColumn item=this field=../this}}
          </td>
        {{/each}}
      </tr>
    {{/each}}
  {{/each}}
{{/if}}
