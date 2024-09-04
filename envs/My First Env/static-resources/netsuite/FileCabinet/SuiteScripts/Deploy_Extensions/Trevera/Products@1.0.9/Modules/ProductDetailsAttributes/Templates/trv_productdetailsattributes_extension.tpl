<section class="">
    <ul class="product-details-attributes">
        {{#each details}}
            <li class="product-details-attributes-attribute" itemprop="{{itemprop}}">
                <p>{{#if ../showLabels}}<span  class="product-details-attributes-title">{{name}}:</span> {{/if}}<span class="product-details-attributes-content">{{{content}}}</span></p>
            </li>
        {{/each}}
    </ul>
</section>


<!--
  Available helpers:
  {{ getExtensionAssetsPath "img/image.jpg"}} - reference assets in your extension

  {{ getExtensionAssetsPathWithDefault context_var "img/image.jpg"}} - use context_var value i.e. configuration variable. If it does not exist, fallback to an asset from the extension assets folder

  {{ getThemeAssetsPath context_var "img/image.jpg"}} - reference assets in the active theme

  {{ getThemeAssetsPathWithDefault context_var "img/theme-image.jpg"}} - use context_var value i.e. configuration variable. If it does not exist, fallback to an asset from the theme assets folder
-->
