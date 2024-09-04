{{!-- Edited for Posh Theme --}}

<nav class="header-menu-secondary-nav">
    <ul class="header-menu-level1">
        {{#if hfExtras.overrideAllNav}}
            {{log hfExtras.categories}}
            {{#each hfExtras.categories}}
                {{log this}}
                <li {{#if categories}}data-toggle="categories-menu"{{/if}}>
                    <a class="header-menu-level1-anchor {{cssClass}}" href="{{href}}" data-touchpoint="{{touchpoint}}">{{translate text}}</a>
                    {{#if categories}}
                        <ul class="header-menu-level-container">
                            <li>
                                <ul class="header-menu-level2">
                                    {{#each categories}}
                                        <li {{#if categories}}class="categories-menu-arrow"{{/if}}>
                                            <a class="header-menu-level2-anchor {{cssClass}}" href="{{href}}" data-touchpoint="{{touchpoint}}">{{translate text}}</a>
                                            {{#if categories}}
                                                <ul class="header-menu-level3">
                                                    {{#each categories}}
                                                        <li>
                                                            <a class="header-menu-level3-anchor {{cssClass}}" href="{{href}}" data-touchpoint="{{touchpoint}}">{{translate text}}</a>
                                                        </li>
                                                    {{/each}}
                                                </ul>
                                            {{/if}}
                                        </li>
                                    {{/each}}
                                </ul>
                            </li>
                        </ul>
                    {{/if}}
                </li>
            {{/each}}
        {{else}}
            {{#each treveraExtras.categories}}
                {{#if text}}
                    <li {{#if categories}}data-toggle="categories-menu"{{/if}}>
                        <a class="{{class}}" {{objectToAtrributes this}}>{{translate text}}</a>
                        {{#if categories}}
                            <ul class="header-menu-level-container">
                                <li>
                                    <ul class="header-menu-level2" >
                                        {{#each categories}}
                                            <li {{#if categories}}class="categories-menu-arrow"{{/if}}>
                                                <a class="{{class}}" {{objectToAtrributes this}}>{{translate text}}</a>
                                                {{#if categories}}
                                                    <ul class="header-menu-level3">
                                                        {{#each categories}}
                                                            <li>
                                                                <a class="{{class}}" {{objectToAtrributes this}}>{{translate text}}</a>
                                                            </li>
                                                        {{/each}}
                                                    </ul>
                                                {{/if}}
                                            </li>
                                        {{/each}}
                                    </ul>
                                </li>
                            </ul>
                        {{/if}}
                    </li>
                {{/if}}
            {{/each}}
        {{/if}}
    </ul>
</nav>




{{!----
Use the following context variables when customizing this template:

	categories (Array)
	showExtendedMenu (Boolean)
	showLanguages (Boolean)
	showCurrencies (Boolean)

----}}
