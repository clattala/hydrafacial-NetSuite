<div class="record-searcher-suggestion" data-itemid="{{internalId}}">
  <a data-action="record-searcher-open-record" data-itemid="{{internalId}}">
    <div class="suggestion-image">
      <img data-loader="false"  src="{{resizeImage thumbnail.url 'thumbnail'}}" alt="{{thumbnail.altimagetext}}">
    </div>
    <div class="suggestion-content">
      <p data-text-highlighter="true" class="link-color item-name record-searcher-text-highlighter" data-itemid="{{internalId}}">{{name}}</p>
      {{#if isEnabledRating}}
        <div class="item-review">
          <div class="star-rating-area">
            <div class="star-rating-area-empty">
              <div class="star-rating-area-empty-content">
                {{#each stars}}
                    <i class="star-rating-empty"></i>
                {{/each}}
              </div>
            </div>
            <div class="star-rating-area-fill comparison-item-rating" data-rating="{{realRating}}"
                 style="width: {{rating}}%" data-itemid="{{internalId}}">
              <div class="star-rating-area-filled">
                {{#each stars}}
                  <i class="star-rating-filled"></i>
                {{/each}}
              </div>
            </div>
          </div>
        </div>
        <div class="clear"></div>
      {{/if}}
      <span class="sc-sku-label"> SKU </span>
      <span class="sc-sku-value record-searcher-text-highlighter" data-text-highlighter="true" data-itemid="{{internalId}}">{{sku}}</span>
    </div>
    <div class="clear"></div>
  </a>
</div>
