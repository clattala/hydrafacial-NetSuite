<div class="header-message" data-view="Message.Placeholder"></div>

<div class="header-main-wrapper">
    <div class="header-top-content">
        {{#if extraHeaderView.bannertext}}
            <p>{{extraHeaderView.bannertext}}</p>
        {{/if}}
    </div>

    <div id="banner-header-top" class="content-banner banner-header-top" data-cms-area="header_banner_top" data-cms-area-filters="global"></div>

    <nav class="header-main-nav">
        <div class="header-content">
            <div class="header-right-menu">
                {{#if treveraExtras.headerRightLinks}}
                    {{#each treveraExtras.headerRightLinks}}
                        <div class="header-right-link">
                            {{!-- https://hydrafacial.com/careers/ 'Careers' --}}
                            <a href="{{link}}" class="header-careers-link">{{translate linkText}}</a>
                        </div>
                    {{/each}}
                {{/if}}
                {{#if treveraExtras.showSocialMediaLinks}}
                    <div class="header-right-menu-also">
                        {{#if treveraExtras.socialMediaLinks}}
                            <div class="header-menu-social">
                                <ul class="header-menu-social-list">
                                    {{#each treveraExtras.socialMediaLinks}}
                                        <li>
                                            <a {{objectToAtrributes item}} data-hashtag="{{datahashtag}}" data-touchpoint="{{datatouchpoint}}" data-target="{{datatarget}}" target="_blank">
                                                {{#if icon}}<i class="header-menu-social-icon icon-{{icon}}"></i>{{else}}{{text}}{{/if}}
                                            </a>
                                        </li>
                                    {{/each}}
                                </ul>
                            </div>
                        {{/if}}
                    </div>
                {{/if}}
                <div class="header-menu-locator" data-view="StoreLocatorHeaderLink"></div>
                {{#if treveraExtras.showQuoteHeader}}
                    <div class="header-menu-quote" data-view="RequestQuoteWizardHeaderLink"></div>
                {{/if}}
                {{#if treveraExtras.showQuickOrderHeader}}
                    <div class="header-menu-quickorder" data-view="QuickOrderHeaderLink"></div>
                {{/if}}
                {{#if treveraExtras.showLanguagesOrCurrencies}}
                    <ul class="header-subheader-options">
                        <li class="header-subheader-settings">
                            <a href="#" class="header-subheader-settings-link" data-toggle="dropdown" title="{{translate 'Settings'}}">
                                <i class="header-menu-settings-icon"></i>
                                <i class="header-menu-settings-carret"></i>
                            </a>
                            <div class="header-menu-settings-dropdown">
                                <h5 class="header-menu-settings-dropdown-title">{{translate 'Site Settings'}}</h5>
                                {{#if treveraExtras.showLanguages}}
                                    <div data-view="Global.HostSelector"></div>
                                {{/if}}
                                {{#if treveraExtras.showCurrencies}}
                                    <div data-view="Global.CurrencySelector"></div>
                                {{/if}}
                            </div>
                        </li>
                    </ul>
                {{/if}}
                {{#unless isStandalone}}
                    <div class="header-search-wrapper">
                        <div class="header-menu-search" data-view="SiteSearch.Button"></div>
                    </div>
                {{/unless}}
                {{#if isReorderEnabled}}
                    {{#if treveraExtras.isLoggedIn}}
                        <div class="header-menu-cart">
                            <div class="header-menu-cart-dropdown">
                                <div data-view="Header.MiniCart"></div>
                            </div>
                        </div>
                    {{/if}}
                {{/if}}
                <div class="header-menu-profile {{#unless treveraExtras.isLoggedIn}}header-menu-profile-logged-out{{/unless}}" data-view="Header.Profile"></div>
            </div>
        </div>
    </nav>

</div>

<div class="header-sidebar-overlay" data-action="header-sidebar-hide"></div>

<div class="header-logo-nav-container">
    <div class="header-logo-nav-wrapper">
        <div class="header-logo-wrapper">
            <div data-view="Header.Logo"></div>
        </div>
        {{#unless isStandalone}}
            <div class="header-search-wrapper header-search-wrapper-mobile">
                <div class="header-menu-search" data-view="SiteSearch.Button"></div>
            </div>
        {{/unless}}
        {{#if isReorderEnabled}}
            {{#if treveraExtras.isLoggedIn}}
                <div class="header-menu-cart header-menu-cart-mobile">
                    <div class="header-menu-cart-dropdown">
                        <div data-view="Header.MiniCart"></div>
                    </div>
                </div>
            {{/if}}
        {{/if}}
        <div class="header-sidebar-toggle-wrapper">
            <button class="header-sidebar-toggle" data-action="header-sidebar-show">
                <span></span>
            </button>
        </div>
        <div class="header-nav-wrapper">
            {{!-- Navigation --}}
            <div class="header-secondary-wrapper" data-view="Header.Menu" data-phone-template="header_sidebar" data-tablet-template="header_sidebar"></div>
        </div>
    </div>
</div>
<div id="banner-header-bottom" class="content-banner banner-header-bottom" data-cms-area="header_banner_bottom" data-cms-area-filters="global"></div>

<div data-view="SiteSearch" class="header-site-search-wrapper"></div>

{{!----
Use the following context variables when customizing this template:

	profileModel (Object)
	profileModel.addresses (Array)
	profileModel.addresses.0 (Array)
	profileModel.creditcards (Array)
	profileModel.firstname (String)
	profileModel.paymentterms (undefined)
	profileModel.phoneinfo (undefined)
	profileModel.middlename (String)
	profileModel.vatregistration (undefined)
	profileModel.creditholdoverride (undefined)
	profileModel.lastname (String)
	profileModel.internalid (String)
	profileModel.addressbook (undefined)
	profileModel.campaignsubscriptions (Array)
	profileModel.isperson (undefined)
	profileModel.balance (undefined)
	profileModel.companyname (undefined)
	profileModel.name (undefined)
	profileModel.emailsubscribe (String)
	profileModel.creditlimit (undefined)
	profileModel.email (String)
	profileModel.isLoggedIn (String)
	profileModel.isRecognized (String)
	profileModel.isGuest (String)
	profileModel.priceLevel (String)
	profileModel.subsidiary (String)
	profileModel.language (String)
	profileModel.currency (Object)
	profileModel.currency.internalid (String)
	profileModel.currency.symbol (String)
	profileModel.currency.currencyname (String)
	profileModel.currency.code (String)
	profileModel.currency.precision (Number)
	showLanguages (Boolean)
	showCurrencies (Boolean)
	showLanguagesOrCurrencies (Boolean)
	showLanguagesAndCurrencies (Boolean)
	isHomeTouchpoint (Boolean)
	cartTouchPoint (String)

----}}
