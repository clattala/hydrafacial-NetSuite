{{#if showBackToAccount}}
	<a href="/" class="paymentinstrument-ach-edit-button-back">
	    <i class="paymentinstrument-ach-edit-button-back-icon"></i>
	    {{translate 'Back to Account'}}
	</a>
{{/if}}

<section class="paymentinstrument-ach-edit">
    {{#unless inModal}}
		<h2>
			{{#if isNew}}
				{{translate 'Add a new ACH'}}
			{{else}}
				{{translate 'Edit ACH'}}
			{{/if}}
		</h2>
		{{#if isCollectionEmpty}}
			<p>{{translate 'For faster checkouts, please enter your payment information below'}}</p>
		{{/if}}
    {{/unless}}
		
	<div data-view="ACH.Form"></div>
	
</section>



{{!----
Use the following context variables when customizing this template:

	isNew (Boolean)
	inModal (Boolean)
	isCollectionEmpty (Boolean)
	showBackToAccount (Boolean)

----}}

