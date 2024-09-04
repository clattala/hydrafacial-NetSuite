{{#if showBackToAccount}}
	<a href="/" class="paymentmethod-ach-list-button-back">
		<i class="paymentmethod-ach-list-button-back-icon"></i>
		{{translate 'Back to Account'}}
	</a>
{{/if}}

<section class="paymentmethod-ach-list">
	<h2>{{pageHeader}}</h2>
	<div class="paymentmethod-ach-list-collection" data-view="ACH.Collection"></div>
</section>

{{!----
Use the following context variables when customizing this template:

	pageHeader (String)
	showBackToAccount (Boolean)

----}}

