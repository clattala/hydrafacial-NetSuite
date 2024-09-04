{{#each items}}
  <td class="comparison-item-price" data-itemid="{{internalid}}">
    {{#if (isEnabledLoginToSeePrice) }}
     <a data-touchpoint="login" data-hashtag="login-register" href="#">
       {{translate ../comparisonPageRequireLoginForPricingMessage}}
     </a>
    {{else}}
      <p class="upper-text small-label comparison-price-label" data-itemid="{{internalid}}">
        {{translate ../comparisonPagePriceLabel}}
      </p>
      <p class="price-formatted comparison-price-value middle-price" data-itemid="{{internalid}}">{{price.formatted}}</p>
    {{/if}}
  </td>
{{/each}}

