{{!-- Edited for Posh Theme --}}

<section class="product-reviews-center-content">
	<button class="product-reviews-center-pusher" data-target="product-reviews-center-review" data-type="sc-pusher">
		<span class="product-reviews-center-pusher-title">{{ translate 'Reviews' }}</span>
		<div class="product-reviews-center-pusher-rating" data-view="Global.StarRating"></div>
		<i class="product-reviews-center-pusher-icon"></i>
	</button>
	<div class="product-reviews-center-more-info-content-container" data-action="pushable" data-id="product-reviews-center-review">
		<div class="product-reviews-center">
			{{#if itemCount}}
				<div class="product-reviews-center-container">
					<div class="product-reviews-center-container-header">
                        <div class="product-reviews-center-container-header-title-container">
                            <h2 class="product-reviews-center-container-header-title">{{translate 'Ratings &amp; Reviews'}}</h2>
                        </div>
                        
                        <div class="product-reviews-center-container-wrapper">
                            <div class="product-reviews-center-container-left">
                                <div class="product-reviews-center-global-views-star-rating-container" data-view="Global.StarRating"></div>
                            </div>
                            <div class="product-reviews-center-container-right">
                                <h3 class="product-reviews-center-container-header-number">
                                    {{#if hasOneReview}}
                                        {{translate '1 Review'}}
                                    {{else}}
                                        {{translate '$(0) Reviews' itemCount}}
                                    {{/if}}
                                </h3>
                                <div class="product-reviews-center-global-views-rating-by-star-container" data-view="Global.RatingByStar"></div>
                            </div>
                        </div>
					</div>

                    <section class="product-reviews-center-list">
                         <div class="product-reviews-center-container-list-header-view-container" data-view="ListHeader.View"></div>

                        {{#if totalRecords}}
                            <div data-view="ProductReviews.Review" class="product-reviews-center-review-container"></div>
                        {{else}}
                            {{translate 'There are no reviews available for your selection'}}
                        {{/if}}
                        
                        <div class="product-reviews-center-container-footer">
                            <a href="{{itemUrl}}/newReview" class="product-reviews-center-container-footer-button">{{translate 'Write a Review'}}</a>
                        </div>
                    </section>
				</div>

				<div class="product-reviews-center-footer">
					<div data-view="GlobalViews.Pagination"></div>
				</div>
			{{else}}
				<div class="product-reviews-center-container">
					<div class="product-reviews-center-container-header product-reviews-center-container-header-no-reviews-available">
						<h3 class="product-reviews-center-container-header-title">{{translate 'Ratings &amp; Reviews'}}</h3>
						<h4 class="product-reviews-center-container-header-title-no-reviews">{{translate 'No reviews available'}}</h4>
						<p>{{translate 'Be the first to'}} <a href="{{itemUrl}}/newReview" class="product-reviews-center-container-button">{{translate 'Write a Review'}}</a></p>
					</div>
				</div>
			{{/if}}
		</div>
	</div>
</section>



{{!----
Use the following context variables when customizing this template:

	itemCount (Number)
	hasOneReview (Boolean)
	itemUrl (String)
	totalRecords (Number)

----}}
