{{!-- Edited for Posh Theme --}}

<div data-view="Global.BackToTop"></div>
<div id="banner-footer" class="content-banner banner-footer" data-cms-area="global_banner_footer" data-cms-area-filters="global"></div>

<section class="footer-wrapper">
	<div class="footer-content-wrapper">
		<div class="footer-logo-social">
			{{#if extraFooterView.logoUrl}}
			<div class="footer-content-logo">
		        <img class="footer-logo-image" src="{{getThemeAssetsPathWithDefault extraFooterView.logoUrl 'img/SC_Logo.png'}}" alt="{{siteName}}">
			</div>
			{{/if}}
			{{#if extraFooterView.socialMediaLinks}}
	        <div class="footer-content-social">
	            <ul class="footer-content-social-list">
	            {{#each extraFooterView.socialMediaLinks}}
	                <li><a {{objectToAtrributes item}} data-hashtag="{{datahashtag}}" data-touchpoint="{{datatouchpoint}}" data-target="{{datatarget}}" target="_blank">{{#if icon}}<i class="footer-content-social-icon icon-{{icon}}"></i>{{else}}{{text}}{{/if}}</a></li>
	            {{/each}}
	            </ul>
	        </div>
	        {{/if}}
		</div>

		<div class="footer-content-newsletter">
      {{#if extraFooterView.showLegacyNewsletter}}
        <div data-view="FooterContent"></div>
      {{else}}
        <div class="newsletter-cct-area" data-cms-area="newsletter-cct-area" data-cms-area-filters="global"></div>
      {{/if}}
		</div>

		<div class="footer-content">

			<div class="footer-content-nav">
				{{#if extraFooterView.col1Links}}
	            <ul class="footer-content-nav-list">
	            {{#each extraFooterView.col1Links}}
	            {{#if href}}
	                <li class="footer-column-link-listitem"><a class="footer-column-link" {{objectToAtrributes item}} data-hashtag="{{datahashtag}}" data-touchpoint="{{datatouchpoint}}" data-target="{{datatarget}}">{{text}}</a></li>
	            {{else}}
	                <li class="footer-column-heading-listitem"><h4 class="footer-column-heading">{{text}}</h4></li>
	            {{/if}}
	            {{/each}}
	            </ul>
	            {{/if}}

	            {{#if extraFooterView.col2Links}}
	            <ul class="footer-content-nav-list">
	            {{#each extraFooterView.col2Links}}
	            {{#if href}}
	                <li class="footer-column-link-listitem"><a class="footer-column-link" {{objectToAtrributes item}} data-hashtag="{{datahashtag}}" data-touchpoint="{{datatouchpoint}}" data-target="{{datatarget}}">{{text}}</a></li>
	            {{else}}
	                <li class="footer-column-heading-listitem"><h4 class="footer-column-heading">{{text}}</h4></li>
	            {{/if}}
	            {{/each}}
	            </ul>
	            {{/if}}

	            {{#if extraFooterView.col3Links}}
	            <ul class="footer-content-nav-list">
	            {{#each extraFooterView.col3Links}}
	            {{#if href}}
	                <li class="footer-column-link-listitem"><a class="footer-column-link" {{objectToAtrributes item}} data-hashtag="{{datahashtag}}" data-touchpoint="{{datatouchpoint}}" data-target="{{datatarget}}">{{text}}</a></li>
	            {{else}}
	                <li class="footer-column-heading-listitem"><h4 class="footer-column-heading">{{text}}</h4></li>
	            {{/if}}
	            {{/each}}
	            </ul>
	            {{/if}}

	            {{#if extraFooterView.col4Links}}
	            <ul class="footer-content-nav-list">
	            {{#each extraFooterView.col4Links}}
	            {{#if href}}
	                <li class="footer-column-link-listitem"><a class="footer-column-link" {{objectToAtrributes item}} data-hashtag="{{datahashtag}}" data-touchpoint="{{datatouchpoint}}" data-target="{{datatarget}}">{{text}}</a></li>
	            {{else}}
	                <li class="footer-column-heading-listitem"><h4 class="footer-column-heading">{{text}}</h4></li>
	            {{/if}}
	            {{/each}}
	            </ul>
	            {{/if}}
			</div>
		</div>
	</div>
</section>

{{#with extraFooterView.copyright}}
    {{#unless hide}}
    <section class="footer-content-copyright-wrapper">
        <div class="footer-content-copyright">
            {{#if showRange}}
                {{translate '&copy; $(0) &#8211; $(1) $(2)' initialYear currentYear companyName}}
                <!-- an en dash &#8211; is used to indicate a range of values -->
            {{else}}
                {{translate '&copy; $(0) $(1)' currentYear companyName}}
            {{/if}}
            <span class="footer-extra-info">{{#if ../extraFooterView.text}}{{{../extraFooterView.text}}}{{/if}}</span>
        </div>
    </section>
    {{/unless}}
{{/with}}


{{!----
Use the following context variables when customizing this template:

	showFooterNavigationLinks (Boolean)
	footerNavigationLinks (Array)

----}}
