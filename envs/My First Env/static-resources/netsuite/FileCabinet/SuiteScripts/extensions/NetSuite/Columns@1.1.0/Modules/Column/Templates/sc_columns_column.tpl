<div class="columnscct-column-container">
    <div class="columnscct-img-container">{{#if hasImage}}<img class="columnscct-img" src="{{resizeImage image imageResizeId}}" alt="{{alt}}"  title="{{title}}" />{{/if}}</div>
    <h3 class="columnscct-column-caption {{#if isCaptionPadding}}columnscct-padding-small{{/if}}">{{caption}}</h3>
    {{#if hasText}}<div class="columnscct-text-container {{#if isTextPadding}}columnscct-padding-small{{/if}}">{{{text}}}</div>{{/if}}
    {{#if hasButton}}
    <div class="columnscct-button-container">
        <a href="{{buttonLink}}" class="columnscct-button" target="{{target}}" data-action="navigate-to-url">{{buttonText}}</a>
    </div>
    {{/if}}
</div>
