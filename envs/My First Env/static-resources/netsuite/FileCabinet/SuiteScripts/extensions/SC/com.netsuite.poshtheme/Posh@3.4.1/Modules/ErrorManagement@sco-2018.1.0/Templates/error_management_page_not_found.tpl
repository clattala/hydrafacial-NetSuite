{{!-- Edited for Posh Theme --}}

<div class="error-management-page-not-found">
	<div data-cms-area="error_management_page_not_found_cms_area_1" data-cms-area-filters="path"></div>

	<div class="error-management-page-not-found-header" style="{{#if extraErrorMgtPageNotFoundView.backgroundImage}}background-image: url({{getThemeAssetsPathWithDefault extraErrorMgtPageNotFoundView.backgroundImage 'img/horizon-page-not-found.jpg'}});{{/if}}{{#if extraErrorMgtPageNotFoundView.backgroundColor}}background-color: {{extraErrorMgtPageNotFoundView.backgroundColor}};{{/if}}">
		<div class="error-management-page-not-found-caption">
			<div class="error-management-page-not-found-title">
				{{#if extraErrorMgtPageNotFoundView.title}}
					<h1>{{{extraErrorMgtPageNotFoundView.title}}}</h1>
				{{else}}
					<h1>{{extraErrorMgtPageNotFoundView.pageHeader}}</h1>
				{{/if}}
				{{#if extraErrorMgtPageNotFoundView.text}}
					<p class="error-management-page-not-found-text">{{extraErrorMgtPageNotFoundView.text}}</p>
				{{/if}}
			</div>
			{{#if extraErrorMgtPageNotFoundView.btnText}}
			<div class="error-management-page-not-found-button-container">
				<a href="{{extraErrorMgtPageNotFoundView.btnHref}}" class="error-management-page-not-found-button">
					{{extraErrorMgtPageNotFoundView.btnText}}
				</a>
			</div>
			{{/if}}
		</div>
    </div>

	<div id="error-management-page-not-found-content" class="error-management-page-not-found-content"></div>

	<div data-cms-area="error_management_page_not_found_cms_area_2" data-cms-area-filters="path"></div>
</div>



{{!----
Use the following context variables when customizing this template:

	title (String)
	pageHeader (String)

----}}
