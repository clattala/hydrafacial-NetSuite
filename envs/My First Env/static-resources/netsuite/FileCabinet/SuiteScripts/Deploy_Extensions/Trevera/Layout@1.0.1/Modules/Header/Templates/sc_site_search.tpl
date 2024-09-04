<div class="site-search {{#if showSearchControl}}active site-search-persistent{{/if}}" data-type="site-search">
    <div class="site-search-content">
        <form class="site-search-content-form" method="GET" action="/search" data-action="search">
            <div class="site-search-content-input">
                <div data-view="ItemsSeacher"></div>
                {{#unless showSearchControl}}
                    <a class="site-search-input-reset" data-type="search-reset"><i class="site-search-input-reset-icon"></i></a>
                {{/unless}}
            </div>
            <button class="site-search-button-submit" type="submit" title="go"><i class="site-search-input-icon"></i></button>
        </form>
    </div>
</div>



{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
