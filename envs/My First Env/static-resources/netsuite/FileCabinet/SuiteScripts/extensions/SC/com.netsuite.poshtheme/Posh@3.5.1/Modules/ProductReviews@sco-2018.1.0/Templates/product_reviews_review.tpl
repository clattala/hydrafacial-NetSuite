{{!-- Edited for Posh Theme --}}

<div class="product-reviews-review" data-id="{{reviewId}}">
	<div class="product-reviews-review-comment-item-cell">
        <p class="product-reviews-review-comment-username">
		{{translate '<span>$(0)</span>' reviewAuthor}}
		{{#if isReviewVerified}}
			- <i class="product-reviews-review-icon-ok-sign" data-toggle="tooltip" data-placement="right" title="{{translate 'verified purchaser'}}"></i>
		{{/if}}
	    </p>
        <p class="product-reviews-review-comment-item-cell-date">
            {{ reviewCreatedOn }}
        </p>
	</div>
	<div class="product-reviews-review-review">
        <div class="product-reviews-review-review-global-star-rating-container">
		    <div data-view="ProductReview.Review.Global.StarRating"></div>
        </div>

	    <h4 class="product-reviews-review-title">
		    {{reviewTitle}}
	    </h4>

		<p class="product-reviews-review-review-description">
            {{{translate reviewText}}}
		</p>
		<div class="product-reviews-review-review-rating">
            {{#if isReviewRatingPerAttributesLegthGreaterThan0}}
                <div class="product-reviews-review-rating-per-attribute">
                    <div data-view="Global.StarRatingAttribute"></div>
                </div>
            {{/if}}
		</div>

        {{#if showActionButtons}}
        <div class="product-reviews-review-comment-footer">
            <p>{{translate  'Was this review helpful?'}}</p>

            <button class="product-reviews-review-comment-footer-button {{usefulButtonClass}}" type="button" data-action="vote" data-type="mark-as-useful" data-review-id="{{reviewId}}">
                <!-- <i class="product-reviews-review-comment-footer-button-icon-like"></i>

                <span>
                    {{#if usefulCountGreaterThan0}}
                        {{translate ' ($(0))' usefulCount }}
                    {{/if}}
                </span>
                -->

                {{#if usefulCountGreaterThan0}}
                    {{translate 'Yes ($(0))' usefulCount }}
                {{else}}
                    {{translate 'Yes'}}
                {{/if}}
            </button>

            <button class="product-reviews-review-comment-footer-button {{notUsefulButtonClass}}" type="button" data-action="vote" data-type="mark-as-not-useful" data-review-id="{{reviewId}}">
                <!-- <i class="product-reviews-review-comment-footer-button-icon-unlike"></i>

                <span>
                    {{#if notusefulCountGreater}}
                        {{translate ' ($(0))' notUsefulCount}}
                    {{/if}}
                </span> -->

                {{#if notusefulCountGreater}}
                    {{translate 'No ($(0))' notUsefulCount}}
                {{else}}
                    {{translate 'No'}}
                {{/if}}
            </button>
        </div>
        <div data-type="alert-placeholder"></div>
        {{/if}}
	</div>
</div>




{{!----
Use the following context variables when customizing this template:

	reviewCreatedOn (String)
	reviewTitle (String)
	reviewAuthor (String)
	isReviewVerified (Boolean)
	reviewText (String)
	isReviewRatingPerAttributesLegthGreaterThan0 (Boolean)
	showActionButtons (Boolean)
	usefulButtonClass (String)
	reviewId (String)
	usefulCountGreaterThan0 (Boolean)
	usefulCount (String)
	notUsefulButtonClass (String)
	notusefulCountGreater (Boolean)
	notUsefulCount (String)

----}}
