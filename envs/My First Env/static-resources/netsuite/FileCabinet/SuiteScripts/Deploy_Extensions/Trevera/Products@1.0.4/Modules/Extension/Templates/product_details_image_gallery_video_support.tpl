{{!
    © 2021 Trevera.
    User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
}}

<div class="product-details-image-gallery {{#if showNewProductBadge}}corner-badge-new{{/if}}">
    {{#if showImages}}
        {{#if showImageSlider}}
            <ul class="bxslider" data-slider data-image-id="{{imageResizeId}}">
                {{#each images}}
                    {{#if isVideo}}
                        <li class="product-details-image-gallery-video">
                            {{! This might have to be changed based on format of data}}
                            {{{this.video}}}
                        </li>
                    {{else}}
                        <li data-zoom class="product-details-image-gallery-container">
                            <img
                                    src="{{resizeImage url ../imageResizeId}}"
                                    alt="{{altimagetext}}"
                                    itemprop="image"
                                    data-loader="false">
                        </li>
                    {{/if}}

                {{/each}}
            </ul>
        {{else}}
            {{#with firstImage}}
                {{#if isVideo}}
                    <li class="product-details-image-gallery-video">
                        {{! This might have to be changed based on format of data}}
                        {{{this}}}
                    </li>
                {{else}}
                    <div class="product-details-image-gallery-detailed-image" data-zoom>
                        <img
                                class="center-block"
                                src="{{resizeImage url ../imageResizeId}}"
                                alt="{{altimagetext}}"
                                itemprop="image"
                                data-loader="false">
                    </div>
                {{/if}}
            {{/with}}
        {{/if}}
    {{/if}}
    <div data-view="SocialSharing.Flyout.Hover"></div>
</div>

<div class="product-details-image-gallery-thumbs">
    {{#if showImages}}
        {{#if showImageSlider}}
            <ol class="">
                {{#each images}}
                    {{#if @first}}
                        <li class="product-details-dummy-image">
                            <img
                                    src="{{resizeImage url 'tiny'}}"
                                    alt="{{altimagetext}}"
                                    itemprop="image"
                                    data-loader="false"
                                    onclick="jQuery('.image-gallery-first-image').click();">
                        </li>
                    {{/if}}
                {{/each}}
            </ol>
            <ul class="pager">
                {{#each images}}
                    {{#if isVideo}}
                        <li class="product-details-image-gallery-video-thumb" data-slideindex="{{@index}}">
                            {{! This might have to be changed based on format of data}}
                            <img src='{{resizeImage ../fallBack 'tiny'}}' alt='play video' class='bx-video-fallback' />
                        </li>
                    {{else}}
                        {{#if @first}}
                            <li class="product-details-image-gallery-container-thumb image-gallery-first-image" data-slideindex="{{@index}}">
                                <img
                                        src="{{resizeImage url 'tiny'}}"
                                        alt="{{altimagetext}}"
                                        itemprop="image"
                                        data-loader="false">
                            </li>
                            {{else}}
                            <li class="product-details-image-gallery-container-thumb" data-slideindex="{{@index}}">
                                <img
                                        src="{{resizeImage url 'tiny'}}"
                                        alt="{{altimagetext}}"
                                        itemprop="image"
                                        data-loader="false">
                            </li>
                        {{/if}}
                    {{/if}}

                {{/each}}
            </ul>
        {{/if}}

    {{/if}}
</div>



{{!----
Use the following context variables when customizing this template:

    imageResizeId (String)
    images (Array)
    firstImage (Object)
    firstImage.altimagetext (String)
    firstImage.url (String)
    showImages (Boolean)
    showImageSlider (Boolean)
----}}
