{{#each items}}
    <td class="comparison-item-actions" data-itemid="{{internalid}}">
        {{#unless (isEnabledLoginToSeePrice) }}
            {{#if isPurchasable }}
                <div class="add-to-cart-button-container">
                    <a href="{{url}}" class="add-to-cart-button"
                       data-itemid="{{internalid}}" data-toggle="show-in-modal"
                       data-action="add-to-cart">
                        {{translate ../comparisonPageAddToCartButtonLabel}}
                    </a>
                </div>
            {{/if}}
        {{/unless}}
    </td>
{{/each}}
