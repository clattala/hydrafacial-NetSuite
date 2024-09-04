{{#each items}}
  <td class="comparison-item-header" data-itemid="{{internalid}}">
    <div class="item-remover" >
      <button type="button" class="item-remover-button"
              data-itemid="{{internalid}}" data-action="remove-item-from-comparison"
              data-toggle="tooltip"  data-placement="left"
              title="{{translate ../comparisonPageRemoveItemHelperText}}">
        <h4>
            <i class="item-remover-button-icon" data-itemid="{{internalid}}"></i>
        </h4>
      </button>
    </div>
    <div class="name-container">
      <h4 data-itemid="{{internalid}}" data-action="navigate-to-item-pdp"
        data-itemurl="{{url}}">
        {{name}}
      </h4>
    </div>
  </td>
{{/each}}
