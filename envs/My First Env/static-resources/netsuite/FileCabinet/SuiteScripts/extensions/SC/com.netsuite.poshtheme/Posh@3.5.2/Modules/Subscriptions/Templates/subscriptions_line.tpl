<section class="subscriptions-line">
    <p class="subscriptions-line-info-card-content subscriptions-line-info-container">
        {{#unless isPhoneDevice}}
            <span class="subscriptions-line-status" data-view="StatusView"></span>
        {{/unless}}
        <span class="subscriptions-line-info-card-content">
            <a data-id="{{subscriptionLineNumber}}" data-action="change" class="subscriptions-line-button-edit">
                {{name}}
            </a>
        </span>
    </p>
    {{#if hasPriceIntervals}}
    <div class="subscriptions-line-price" data-view="Pricing.View"></div>
    {{/if}}
    <p class="subscriptions-line-info-card-content subscriptions-line-info-container">
        <span class="subscriptions-line-type">{{translate 'Type'}}: {{type}}</span>
        {{#unless isChargeTypeUsage}}
            {{#unless isProcessing}}
                <span class="subscriptions-line-quantity">{{translate 'Quantity'}}: {{quantity}}</span>
            {{/unless}}
        {{/unless}}
        {{#if isLineTypeOptional}}
            <span class="subscriptions-line-added">{{translate 'Added'}}: {{startDate}}</span>
        {{/if}}
    </p>
</section>

