<div>
    {{#if isLoading}}
        <p>{{translate 'Loading...'}}</p>
    {{else}}
        {{#if isOptedIn}}
            <ul class="loyalty-content-tabs" role="tablist">
                {{#each tabs}}
                    <li class="loyalty-tab-title {{#if @first}} active {{/if}}" role="presentation">
                        <a href="#" data-action="selected-tab" data-id="{{@index}}" data-target="#loyalty-tab-{{@index}}" data-toggle="tab">{{name}}</a>
                    </li>
                {{/each}}
            </ul>
            <div class="loyalty-tab-content" data-type="information-content" data-action="tab-content">
                {{#each tabs}}
                    <div role="tabpanel" class="loyalty-tab-content-panel {{#if @first}}active{{/if}}" id="loyalty-tab-{{@index}}" data-id="{{id}}">
                        <div id="loyalty-tab-content-container-{{@index}}" class="loyalty-tab-content-container">
                            {{#ifEquals id 'benefits'}}
                                <div class="loyalty-benefits-summary">
                                    <div class="loyalty-benefits-summary-name">
                                        <p>{{translate 'Welcome Back'}} <span>{{../companyName}}</span></p>
                                    </div>
                                    <div class="loyalty-benefits-summary-tier">
                                        <p>{{translate 'Tier Status'}} <span>{{../tierName}}</span></p>
                                    </div>
                                    <div class="loyalty-benefits-summary-tier">
                                        <p>{{translate 'Available Points'}} <span>{{../pointsBalance}}</span></p>
                                    </div>
                                </div>
                                <div class="loyalty-benefits-image">
                                    <img src="{{../benefitsImage}}" alt="image of tier benefits for loyalty program"/>
                                </div>
                            {{else}}
                                {{#ifEquals id 'activity'}}
                                    <div class="loyalty-history-entry loyalty-history-header">
                                        <div class="loyalty-history-entry">
                                            <div class="loyalty-history-date">
                                                {{translate 'Date'}}
                                            </div>
                                            <div class="loyalty-history-action">
                                                {{translate 'Action'}}
                                            </div>
                                            <div class="loyalty-history-points">
                                                {{translate 'Points Earned'}}
                                            </div>
                                            <div class="loyalty-history-expiration-date">
                                                {{translate 'Expires'}}
                                            </div>
                                        </div>
                                    </div>
                                    {{#each ../activity}}
                                        <div class="loyalty-history-entry">
                                            <div class="loyalty-history-date">
                                                {{transactionDate}}
                                            </div>
                                            <div class="loyalty-history-action">
                                                {{actionNameTranslated}}
                                            </div>
                                            <div class="loyalty-history-points">
                                                {{points}}
                                            </div>
                                            <div class="loyalty-history-expiration-date">
                                                {{#if expirationDate}}
                                                    {{expirationDate}}
                                                {{else}}
                                                    _
                                                {{/if}}

                                            </div>
                                        </div>
                                    {{/each}}
                                {{else}}
                                {{/ifEquals}}
                            {{/ifEquals}}

                        </div>
                    </div>
                {{/each}}
            </div>
            </ul>
        {{else}}
            <p>{{translate 'You aren\'t opted in to our Loyalty program.'}}</p>
        {{/if}}
    {{/if}}
</div>
