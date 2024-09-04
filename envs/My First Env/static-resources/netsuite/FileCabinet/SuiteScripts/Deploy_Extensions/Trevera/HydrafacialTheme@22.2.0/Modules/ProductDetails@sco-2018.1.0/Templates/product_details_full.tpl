{{!-- Edited for Posh Theme --}}

<div class="product-details-full">
    <div data-cms-area="item_details_banner" data-cms-area-filters="page_type"></div>

    <header class="product-details-full-header">
        <div id="banner-content-top" class="product-details-full-banner-top"></div>
    </header>

    <article class="product-details-full-content">
        <div id="banner-details-top" class="product-details-full-banner-top-details"></div>

        <section class="product-details-full-main-content">
            <div class="product-details-full-main-content-left">
                <div class="product-details-full-image-gallery-container">
                    <div id="banner-image-top" class="content-banner banner-image-top"></div>
                    <div data-view="Product.ImageGallery"></div>
                    <div id="banner-image-bottom" class="content-banner banner-image-bottom"></div>

                    <div data-cms-area="product_details_full_cms_area_2" data-cms-area-filters="path"></div>
                    <div data-cms-area="product_details_full_cms_area_3" data-cms-area-filters="page_type"></div>
                </div>
            </div>

            <div class="product-details-full-main-content-right">
                <div class="product-details-full-main">
                    <div class="product-details-full-content-header">
                        <div data-cms-area="product_details_full_cms_area_1" data-cms-area-filters="page_type"></div>

                        <h1 class="product-details-full-content-header-title" itemprop="name">{{pageHeader}}</h1>
                        {{#unless isItemProperlyConfigured}}
                            <div class="product-details-full-rating" data-view="Global.StarRating"></div>
                        {{/unless}}
                        <div data-cms-area="item_info" data-cms-area-filters="path"></div>
                    </div>
                    {{#if isItemProperlyConfigured}}
                        <form id="product-details-full-form" data-action="submit-form" method="POST">

                            <section class="product-details-full-info">
                                <div id="banner-summary-bottom" class="product-details-full-banner-summary-bottom"></div>
                            </section>

                            <div data-view="Product.Sku"></div>

                            <div data-view="Product.Price"></div>
                            {{#if isPriceEnabled}}
                                <div data-view="Quantity.Pricing"></div>
                            {{/if}}

                            <div class="product-details-full-rating" data-view="Global.StarRating"></div>

                            <div data-view="Product.Stock.Info"></div>

                            <section data-view="Product.Options" class="product-details-full-product-options-container"></section>

                            <section class="product-details-full-matrix-desc">{{{customMatrixDesc}}}</section>

                            <div data-cms-area="product_details_full_cms_area_4" data-cms-area-filters="path"></div>

                            {{#if isPriceEnabled}}
                                <div data-view="Quantity"></div>

                                <section class="product-details-full-actions">

                                    <div class="product-details-full-actions-container  {{#if treveraExtras.hasPopupMessage}}requires-popup-message{{/if}}">
                                        {{#if treveraExtras.hasPopupMessage}}
                                            <div class="cart-add-to-cart-button-container">
                                                <div class="cart-add-to-cart-button">
                                                    <button type="submit" data-action="show-confirmation-message" class="cart-add-to-cart-button-custom-button">
                                                        {{#if isUpdate}}{{translate 'Update'}}{{else}}{{translate 'Add to Shopping Cart'}}{{/if}}
                                                    </button>
                                                </div>
                                            </div>
                                        {{/if}}
                                        <div data-view="MainActionView"></div>
                                    </div>
                                    <div class="product-details-full-actions-container">
                                        {{#if treveraExtras.showAddToQuote}}
                                            <div data-view="ProductDetails.AddToQuote" class="product-details-full-actions-addtoquote"></div>
                                        {{/if}}
                                        {{#if treveraExtras.showAddToWishList}}
                                            <div data-view="AddToProductList" class="product-details-full-actions-addtowishlist"></div>
                                        {{/if}}
                                    </div>

                                </section>
                            {{/if}}

                            <div data-view="StockDescription"></div>

                            <!--<div data-view="SocialSharing.Flyout" class="product-details-full-social-sharing"></div>-->
                            <div class="product-details-full-social-sharing">
                                <div data-view="SocialSharing.Flyout"></div>
                                {{#if treveraExtras.showInstagramLink}}
                                    <a href="{{treveraExtras.instagramLink}}" target="_blank" class="social-sharing-flyout-content-social-instagram-link">
                                        <i class="social-sharing-flyout-content-social-instagram-icon"></i></a>
                                {{/if}}
                            </div>

                            <div class="product-details-full-main-bottom-banner">
                                <div id="banner-summary-bottom" class="product-details-full-banner-summary-bottom"></div>
                            </div>
                        </form>
                    {{else}}
                        <div data-view="GlobalViewsMessageView.WronglyConfigureItem"></div>
                    {{/if}}

                    <section class="product-details-full-main-product-information-container" data-view="Product.Information"></section>

                    <div id="banner-details-bottom" class="product-details-full-banner-details-bottom" data-cms-area="item_info_bottom" data-cms-area-filters="page_type"></div>
                </div>
            </div>

        </section>

        <section class="product-details-full-bottom-content">
            <div data-cms-area="product_details_full_cms_area_5" data-cms-area-filters="page_type"></div>
            <div data-cms-area="product_details_full_cms_area_6" data-cms-area-filters="path"></div>

            <div data-cms-area="product_details_full_cms_area_7" data-cms-area-filters="path"></div>

            <div data-view="ProductReviews.Center"></div>

            <div data-cms-area="product_details_full_cms_area_8" data-cms-area-filters="path"></div>

            <div class="product-details-full-content-related-items">
                <div data-view="Related.Items"></div>
            </div>

            <div class="product-details-full-content-correlated-items">
                <div data-view="Correlated.Items"></div>
            </div>
            <div id="banner-details-bottom" class="content-banner banner-details-bottom" data-cms-area="item_details_banner_bottom" data-cms-area-filters="page_type"></div>
        </section>
    </article>
</div>



{{!----
Use the following context variables when customizing this template:

	model (Object)
	model.item (Object)
	model.item.internalid (Number)
	model.item.type (String)
	model.quantity (Number)
	model.options (Array)
	model.options.0 (Object)
	model.options.0.cartOptionId (String)
	model.options.0.itemOptionId (String)
	model.options.0.label (String)
	model.options.0.type (String)
	model.location (String)
	model.fulfillmentChoice (String)
	pageHeader (String)
	itemUrl (String)
	isItemProperlyConfigured (Boolean)
	isPriceEnabled (Boolean)

----}}
