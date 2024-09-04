<div id="layout" class="myaccount-layout">
	<a class="myaccount-layout-skip-to-main-content" data-action="skip-to-main-content" href="#main-content">{{translate 'Skip to main content' 'Jumps to the main content section'}}</a>
	<header id="site-header" class="myaccount-layout-header" data-view="Header" aria-label="{{translate 'Header' 'Name of the entire header of the website'}}"></header>

	<div id="main-container" class="myaccount-layout-container">

		<div class="myaccount-layout-breadcrumb" data-view="Global.Breadcrumb" data-type="breadcrumb"></div>
		<div class="myaccount-layout-notifications">
			<div data-view="Notifications"></div>
		</div>
		<div class="myaccount-layout-error-placeholder"></div>

        <div id="main-content" tabindex="-1">
            <h2 class="myaccount-layout-title">{{translate 'My Account'}}</h2>
            <div class="myaccount-layout-row">
                <nav id="side-nav" class="myaccount-layout-side-nav" data-view="MenuTree"></nav>

                <div id="content" class="myaccount{{#if isStandalone}}-standalone{{/if}}-layout-main"></div>
            </div>
        </div>
        <div id="banner-myaccount-bottom" class="content-banner banner-myaccount-bottom" data-cms-area="banner_myaccount_bottom" data-cms-area-filters="global"></div>
	</div>

	<footer id="site-footer" class="myaccount-layout-footer" data-view="Footer"></footer>

</div>



{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
