<nav class="header-menu-secondary-nav">

    {{#unless showSearchControl}}
        <div class="header-menu-search" data-view="SiteSearch.Button"></div>
    {{/unless}}

    <ul class="header-menu-level1 header-menu-level1-hover">
        {{#each categories}}
            {{#if text}}
                <li class="{{liClass}}" {{#if categories}}data-toggle="categories-menu"{{/if}}>
                    <a class="{{class}}" {{objectToAtrributes this}}>
                        {{translate text}}
                    </a>
                    {{#if categories}}
                        <ul class="header-menu-level-container">
                            <li>
                                {{#if inTwoColumns}}
                                    <div class="header-menu-level2">
                                        <ul class="header-menu-level2-half">
                                            {{#each leftColumn}}
                                                <li>
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
                                        <ul class="header-menu-level2-half">
                                            {{#each rightColumn}}
                                                <li>
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
                                    </div>
                                {{else}}
                                    <ul class="header-menu-level2">
                                        {{#each categories}}
                                            <li>
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

                                {{/if}}
                            </li>
                        </ul>
                    {{/if}}
                </li>
            {{/if}}
        {{/each}}

        {{#if showSearchControl}}
            <li class="search-control">
                <div class="header-site-search" data-view="SiteSearch" data-type="SiteSearch"></div>
            </li>
        {{/if}}

    </ul>

</nav>
