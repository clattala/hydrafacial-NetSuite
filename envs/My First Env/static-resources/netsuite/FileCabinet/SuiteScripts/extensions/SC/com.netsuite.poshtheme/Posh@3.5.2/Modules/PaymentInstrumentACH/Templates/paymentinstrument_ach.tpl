{{#if isNewPaymentMethod}}
	<a class="paymentinstrument-ach paymentinstrument-ach-new-card" href="/ach/new" data-toggle="show-in-modal">
		<div class="paymentinstrument-ach-new-card-title">
			<p><i class="paymentinstrument-ach-new-card-plus-icon"></i></p>
			{{translate 'Add Bank Account'}}
		</div>
	</a>
{{else}}
    {{#if showSelector}}
        <a class="paymentinstrument-ach-selector {{#if isSelected}}paymentinstrument-ach-selected{{/if}}" data-action="select" data-id="{{achId}}">
            <input type="radio" name="cards-options" class="paymentinstrument-ach-selector-option" data-id="{{achId}}" value="{{achId}}" {{#if isSelected}} checked {{/if}}>
            {{#if isSelected}}
                <b>{{translate 'Selected'}}</b>
            {{else}}
                {{translate 'Select'}}
            {{/if}}
        </a>
    {{/if}}

    <div class="paymentinstrument-ach {{#if isSelected}}paymentinstrument-ach-selected{{/if}}" data-id="{{achId}}">
        <div class="paymentinstrument-ach-container">
            <div>
                <div class="paymentinstrument-ach-header">
                    <p class="paymentinstrument-ach-number"><b>{{translate 'Ending in'}}</b> {{endingAccount}} </p>
                    {{#if showACHImage}}
                        <img class="paymentinstrument-ach-header-icon" src="{{paymentMethodImageUrl}}" alt="{{paymentName}}">
                    {{else}}
                        {{paymentName}}
                    {{/if}}
                </div>
                <p class="paymentinstrument-ach-bankname">{{bankName}}</p>
                <p class="paymentinstrument-ach-routingnumber"><b>{{translate 'Routing Number: '}}</b>{{routingNumber}}</p>
                <p class="paymentinstrument-ach-achaccounttype"><b>{{translate 'Account Type: '}}</b>{{accountType}}</p>
                <p class="paymentinstrument-ach-ownername"><b>{{translate 'Owner Name: '}}</b>{{ownerName}}</p>
                <p class="paymentinstrument-ach-limit"><b>{{translate 'Limit: '}}</b>{{limit}}</p>
            </div>
            {{#if showActions}}
                <div class="paymentinstrument-ach-actions">
                    <a class="paymentinstrument-ach-action" href="/ach/{{achId}}" data-toggle="show-in-modal">
                        {{translate 'Edit'}}
                    </a>
                    <button class="paymentinstrument-ach-action" data-action="remove" data-id="{{achId}}">
                        {{translate 'Remove'}}
                    </button>
                </div>
            {{/if}}
        </div>
    </div>
{{/if}}

