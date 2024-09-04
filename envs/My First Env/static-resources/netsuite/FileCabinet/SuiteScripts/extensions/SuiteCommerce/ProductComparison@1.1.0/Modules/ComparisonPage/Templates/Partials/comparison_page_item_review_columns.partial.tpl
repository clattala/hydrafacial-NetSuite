{{#each items}}
  <td class="comparison-item-review quick-view-rating" data-itemid="{{internalid}}">
    <p class="upper-text rating-label small-label" data-itemid="{{internalid}}">
      {{translate ../comparisonPageRatingLabel}}
    </p>
    <div class="star-rating-area">
      <div class="star-rating-area-empty">
        <div class="star-rating-area-empty-content">
          {{#each stars}}
            <i class="star-rating-empty"></i>
          {{/each}}
        </div>
      </div>
      <div class="star-rating-area-fill comparison-item-rating" data-rating="{{realRating}}"
           style="width: {{rating}}%" data-itemid="{{internalid}}">
        <div class="star-rating-area-filled">
          {{#each stars}}
            <i class="star-rating-filled"></i>
          {{/each}}
        </div>
      </div>
    </div>
    <div class="clear"></div>
  </td>
{{/each}}

