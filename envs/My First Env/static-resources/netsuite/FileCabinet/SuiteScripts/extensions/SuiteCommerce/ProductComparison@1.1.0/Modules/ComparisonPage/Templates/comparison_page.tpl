<div class="comparison-page-layout-container">
 <div class="comparison-page-title">
    <h1>{{translate title}}</h1>
  </div>
  <div class="comparison-page-description">
    {{{translate comparisonPageDescription}}}
  </div>
  <div class="comparison-page-search-container">
    <div data-view="ItemSearcher.View"></div>
  </div>

  {{#if showComparisonTable }}
    <div class="items-container">
    <table class="items-table table-for-{{items.length}}-items{{#if isSupportedStickPositioning}} enable-stick{{/if}}">
      <thead>
      <tr class="item-name-row">
        <td class="specifications-column"/>
        {{>itemNameColumns}}
      </tr>
      {{#if isEnabledRating}}
        <tr class="item-review-row">
          <td class="specifications-column"/>
          {{>itemReviewColumns}}
        </tr>
      {{/if}}
      <tr class="item-thumbnail-row">
        <td class="specifications-column"/>
        {{>itemThumbnailColumns}}
      </tr>
      {{#if comparisonPageShowPrice}}
        <tr class="item-price-row">
          <td class="specifications-column"/>
          {{>itemPriceColumns}}
        </tr>
      {{/if}}
      {{#if comparisonPageShowSKU }}
        <tr class="item-sku-row">
          <td class="specifications-column"/>
          {{>itemSKUColumns}}
        </tr>
      {{/if}}
      {{#if comparisonPageShowAddToCartButton}}
        <tr class="item-actions-row">
          <td class="specifications-column"/>
          {{>itemActionsColumns}}
        </tr>
      {{/if}}
      </thead>
      <tbody>
        {{>comparisonRows}}
      </tbody>
    </table>
  </div>
  {{/if}}
</div>
