{{!-- Edited for Posh Theme --}}

<div data-view="Global.BackToTop"></div>
<div id="banner-footer" class="content-banner banner-footer" data-cms-area="global_banner_footer" data-cms-area-filters="global"></div>

{{#with extraFooterSimplifiedView.copyright}}
    {{#unless hide}}
    <section class="footer-content-copyright-wrapper">
        <div class="footer-content-copyright">
            {{#if showRange}}
                {{translate '&copy; $(0) &#8211; $(1) $(2)' initialYear currentYear companyName}}
                <!-- an en dash &#8211; is used to indicate a range of values -->
            {{else}}
                {{translate '&copy; $(0) $(1)' currentYear companyName}}
            {{/if}}
            <span class="footer-extra-info">{{#if ../extraFooterSimplifiedView.text}}{{{../extraFooterView.text}}}{{/if}}</span>
        </div>
    </section>
    {{/unless}}
{{/with}}



{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
