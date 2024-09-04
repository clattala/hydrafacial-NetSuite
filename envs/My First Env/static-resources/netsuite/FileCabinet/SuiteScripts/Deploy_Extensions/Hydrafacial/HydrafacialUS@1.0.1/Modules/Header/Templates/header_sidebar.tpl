<div class="header-sidebar-wrapper" data-action="header-sidebar-hide-esc" tabindex="-1">
    <div class="header-sidebar-profile-menu" data-view="Header.Profile"></div>

    <div class="header-sidebar-menu-wrapper" data-type="header-sidebar-menu">

        <ul class="header-sidebar-menu" id="header-sidebar-menu-controls">
            {{#unless isStandalone}}
                {{#if hfExtras.overrideAllNav}}
                    {{#each hfExtras.categories}}
                        <li>
                            <a class="{{cssClass}}" href="{{href}}" data-touchpoint="{{touchpoint}}" {{#if categories}}data-action="push-menu"{{/if}}>
                                {{translate text}}
                                {{#if categories}}<i class="header-sidebar-menu-push-icon"></i>{{/if}}
                            </a>
                            {{#if categories}}
                                <ul>
                                    <li>
                                        <a href="#" class="header-sidebar-menu-back" data-action="pop-menu" name="back-sidebar">
                                            <i class="header-sidebar-menu-pop-icon"></i>
                                            {{translate 'Back'}}
                                        </a>
                                    </li>
                                    {{#each categories}}
                                        <li>
                                            <a class="{{cssClass}}" href="{{href}}" data-touchpoint="{{touchpoint}}" {{#if categories}}data-action="push-menu"{{/if}}>
                                                {{translate text}}
                                                {{#if categories}}<i class="header-sidebar-menu-push-icon"></i>{{/if}}
                                            </a>
                                            {{#if categories}}
                                                <ul>
                                                    <li>
                                                        <a href="#" class="header-sidebar-menu-back" data-action="pop-menu" name="back-sidebar">
                                                            <i class="header-sidebar-menu-pop-icon"></i>
                                                            {{translate 'Back'}}
                                                        </a>
                                                    </li>
                                                    {{#each categories}}
                                                        <li>
                                                            <a class="{{cssClass}}" href="{{href}}" data-touchpoint="{{touchpoint}}" {{#if categories}}data-action="push-menu"{{/if}}>
                                                                {{translate text}}
                                                                {{#if categories}}<i class="header-sidebar-menu-push-icon"></i>{{/if}}
                                                            </a>
                                                        </li>
                                                    {{/each}}
                                                </ul>
                                            {{/if}}
                                        </li>
                                    {{/each}}
                                </ul>
                            {{/if}}
                        </li>
                    {{/each}}
                {{else}}
                    {{#each treveraExtras.categories}}
                        {{#if text}}
                            <li>
                                <a {{objectToAtrributes this}} {{#if categories}}data-action="push-menu"{{/if}} name="{{text}}">
                                    {{translate text}}
                                    {{#if categories}}<i class="header-sidebar-menu-push-icon"></i>{{/if}}
                                </a>
                                {{#if categories}}
                                    <ul>
                                        <li>
                                            <a href="#" class="header-sidebar-menu-back" data-action="pop-menu" name="back-sidebar" aria-disabled="true">
                                                <i class="header-sidebar-menu-pop-icon"></i>
                                                {{translate 'Back'}}
                                            </a>
                                        </li>

                                        <li>
                                            <a {{objectToAtrributes this}} aria-disabled="true">
                                                {{translate 'Browse $(0)' text}}
                                            </a>
                                        </li>

                                        {{#each categories}}
                                            <li>
                                                <a {{objectToAtrributes this}} {{#if categories}}data-action="push-menu"{{/if}} aria-disabled="true">
                                                    {{text}}
                                                    {{#if categories}}<i class="header-sidebar-menu-push-icon"></i>{{/if}}
                                                </a>

                                                {{#if categories}}
                                                    <ul>
                                                        <li>
                                                            <a href="#" class="header-sidebar-menu-back" data-action="pop-menu" aria-disabled="true">
                                                                <i class="header-sidebar-menu-pop-icon"></i>
                                                                {{translate 'Back'}}
                                                            </a>
                                                        </li>

                                                        <li>
                                                            <a {{objectToAtrributes this}} aria-disabled="true">
                                                                {{translate 'Browse $(0)' text}}
                                                            </a>
                                                        </li>

                                                        {{#each categories}}
                                                            <li>
                                                                <a {{objectToAtrributes this}} name="{{text}}">{{text}} aria-disabled="true"</a>
                                                            </li>
                                                        {{/each}}
                                                    </ul>
                                                {{/if}}
                                            </li>
                                        {{/each}}
                                    </ul>
                                {{/if}}
                            </li>
                        {{/if}}
                    {{/each}}
                {{/if}}
            {{/unless}}

            {{#if showExtendedMenu}}
                <li class="header-sidebar-menu-myaccount" data-view="Header.Menu.MyAccount"></li>
            {{/if}}

            {{!--
            <div data-view="QuickOrderHeaderLink"></div>
            --}}
            <div data-view="RequestQuoteWizardHeaderLink"></div>
        </ul>

    </div>

    <div class="header-sidebar-links">
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
        </div>
    </div>

</div>



{{!----
Use the following context variables when customizing this template:

	categories (Array)
	showExtendedMenu (Boolean)
	showLanguages (Boolean)
	showCurrencies (Boolean)

----}}
