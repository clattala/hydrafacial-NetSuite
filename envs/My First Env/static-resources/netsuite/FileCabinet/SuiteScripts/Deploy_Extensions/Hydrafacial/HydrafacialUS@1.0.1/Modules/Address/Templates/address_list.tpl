{{#if showBackToAccount}}
    <a href="/" class="address-list-button-back">
        <i class="address-list-button-back-icon"></i>
        {{translate 'Back to Account'}}
    </a>
{{/if}}

<section class="address-list">
    <h2>{{pageHeader}}</h2>
    <div class="address-list-default-addresses">
        <div class="address-list-cms-area" data-cms-area="address-list-before" data-cms-area-filters="path"></div>
        <div data-view="Addresses.Collection"></div>
        <div class="address-list-cms-area" data-cms-area="address-list-after" data-cms-area-filters="path"></div>
    </div>
	<div data-view="AddressBook.AfterAddressesList"></div>
</section>




{{!----
Use the following context variables when customizing this template:

	pageHeader (String)
	isAddressCollectionLengthGreaterThan0 (Boolean)
	showBackToAccount (Boolean)

----}}
