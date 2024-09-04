<section class="slideshow-cct-container">
    <div class="slideshow-slider">
        {{#each slideshowList}}
            <div class="slideshow-slide">
                <div class="content {{imgOverlayClass}}">
                    <div class="{{../sectionHeight}} crop-height bg-image-wedding {{imgAlignClass}} {{opacityClass}}" title="{{altText}}" style="background-image: url({{imageURL}});">
                        <img class="scale transparent" src="{{imageURL}}" alt="{{altText}}" />
                    </div>
                    <div class="content-box {{textAlignClass}}">
                        {{#if hasText}}
                            <div class="{{textColorClass}}">{{{text}}}</div>
                        {{/if}}
                        {{#if hasBtnText}}
                            <div class="button-container">
                                <a href="{{btnLink}}" target="{{target}}" class="{{btnStyleClass}}">{{btnText}}</a>
                            </div>
                        {{/if}}
                    </div>
                </div>
            </div>
        {{/each}}
    </div>
</section>