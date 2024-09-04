<div class="order-wizard-paymentmethod-ach-module">
	{{#if showTitle}}
		<h3 class="order-wizard-paymentmethod-ach-module-title">{{title}}</h3>
	{{/if}}
	{{#if showForm}}
		<div class="order-wizard-paymentmethod-ach-module-form">
			<form method="POST" data-view="ACH.Form"></form>
		</div>
	{{else}}
		<div id="ach-module-list-placeholder" class="order-wizard-paymentmethod-ach-module-list-placeholder">
			<div data-view="ACH.List"></div>
		</div>
	{{/if}}
	<p class="order-wizard-paymentmethod-ach-module-learn-more">
	    <i class="order-wizard-paymentmethod-ach-module-learn-more-icon"></i>
	    {{ translate 'Learn more about <a class="order-wizard-paymentmethod-ach-module-learn-more-link" data-action="show-safe-secure-info"> safe and secure </a> shopping' }} </p>
</div>

