<a class="header-mini-cart-menu-cart-link {{#if showLines}}header-mini-cart-menu-cart-link-enabled{{/if}}" data-type="mini-cart" title="{{translate 'Cart'}}" data-touchpoint="{{cartTouchPoint}}" data-hashtag="#cart" href="#">
	<i class="header-mini-cart-menu-cart-icon">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 1100" class="svg-shopping-bag"><path class="svg-path-shopping-bag" d="M787.1 1038.2h-549.1c-48.4 0-90.7-17.3-125-52s-52-76.6-52-125v-543.3h183.2v-36.5c0-48.4 11.9-93.9 35.8-135.1s56.7-74.1 97.5-97.5c82.4-47.3 188.2-47.3 270.6 0 41.2 23.8 74.1 56.4 97.5 97.5s35.8 86.7 35.8 135.1v36.5h182.8v543c0 48.4-17.3 90.7-52 125s-76.6 52.4-125 52.4zM110.1 366.9v494.2c0 35.4 12.3 65 37.6 90.3s54.9 37.6 90.3 37.6h549.1c35.4 0 65-12.3 90.3-37.6s37.6-54.9 37.6-90.3v-494.2h-183.2v-85.6c0-40.1-9.8-77.3-29.3-110.5-19.1-33.6-46.2-60.3-79.5-79.5-66.8-39-153.9-39-221.5-0.4-33.6 19.1-60.3 45.9-79.5 79.5s-29.3 70.8-29.3 110.5v85.6h-182.8zM695.7 534.5c-19.1 0-36.5-7.2-49.9-20.6s-20.6-30.7-20.6-49.9c0-19.1 7.2-36.1 20.6-49.9 27.1-27.1 72.6-27.1 99.7 0 13.4 13.4 20.6 30.7 20.6 49.9s-7.2 36.5-20.6 49.9c-13.7 13.7-30.7 20.6-49.9 20.6zM695.7 443.1c-6.1 0-10.8 1.8-15.2 6.1s-6.1 9-6.1 15.2 1.8 10.8 6.1 15.2c8.3 8.3 21.7 8.7 30 0 4.3-4.3 6.1-9 6.1-15.2s-1.8-10.8-6.1-15.2c-4-4.3-8.7-6.1-14.8-6.1zM329.3 534.5c-19.1 0-36.5-7.2-49.9-20.6s-20.6-30.7-20.6-49.9c0-19.1 7.2-36.1 20.6-49.9 27.1-27.1 72.6-27.1 99.7 0 13.4 13.4 20.6 30.7 20.6 49.9s-7.2 36.5-20.6 49.9c-13.4 13.7-30.7 20.6-49.9 20.6zM329.3 443.1c-6.1 0-10.8 1.8-15.2 6.1s-6.1 9-6.1 15.2 1.8 10.8 6.1 15.2c8.7 8.3 21.3 8.7 30 0 4.3-4.3 6.1-9 6.1-15.2s-1.8-10.8-6.1-15.2c-4-4.3-8.3-6.1-14.8-6.1zM659.2 366.9h-293v-85.6c0-39.4 14.5-74.1 43.4-103s63.6-43.4 103.3-43.4c39.7 0 74.4 14.5 103 43.4 28.9 28.9 43.4 63.6 43.4 103v85.6zM415 317.8h195.1v-36.5c0-26.4-9.4-48.8-28.9-68.3-39-39-97.9-39-136.9 0-19.5 19.5-28.9 41.9-28.9 68.3v36.5z"/></svg>
	</i>
	<span class="header-mini-cart-menu-cart-legend">
		{{#if isLoading}}
		<span class="header-mini-cart-summary-cart-ellipsis"></span>
		{{else}}
				{{translate '$(0)' itemsInCart}}
		{{/if}}
	</span>
</a>
<div class="header-mini-cart">
	 {{#if showLines}} 
	 	<div data-view="Header.MiniCartItemCell" class="header-mini-cart-container"></div>
		<div class="header-mini-cart-subtotal">
			<div class="header-mini-cart-subtotal-items">
				{{#if showPluraLabel}}
					{{translate '$(0) items' itemsInCart}}
				{{else}}
					{{translate '1 item'}}
				{{/if}}
			</div>

			{{#if isPriceEnabled}}
			<div class="header-mini-cart-subtotal-amount">
				{{translate 'SUBTOTAL: $(0)' subtotalFormatted}}
			</div>
			{{/if}}
		</div>

		<div class="header-mini-cart-buttons">
			<div class="header-mini-cart-buttons-left">
				<a href="#" class="header-mini-cart-button-view-cart" data-touchpoint="{{cartTouchPoint}}" data-hashtag="#cart" >
					{{translate 'View Cart'}}
				</a>
			</div>
			<div class="header-mini-cart-buttons-right">
				<a href="#" class="header-mini-cart-button-checkout" data-touchpoint="checkout" data-hashtag="#" >
					{{translate 'Checkout'}}
				</a>
			</div>
		</div>

		{{else}} 
		<div class="header-mini-cart-empty">
			<a href="#" data-touchpoint="{{cartTouchPoint}}" data-hashtag="#cart">
				{{#if isLoading}}
					{{translate 'Your cart is loading'}}
				{{else}}
					{{translate 'Your cart is empty'}}
				{{/if}}
			</a>
		</div>
	{{/if}} 
</div>





{{!----
Use the following context variables when customizing this template: 
	
	model (Object)
	model.addresses (Array)
	model.addresses.0 (Object)
	model.addresses.0.zip (String)
	model.addresses.0.country (String)
	model.addresses.0.company (undefined)
	model.addresses.0.internalid (String)
	model.shipmethods (Array)
	model.lines (Array)
	model.paymentmethods (Array)
	model.internalid (String)
	model.confirmation (Object)
	model.confirmation.addresses (Array)
	model.confirmation.shipmethods (Array)
	model.confirmation.lines (Array)
	model.confirmation.paymentmethods (Array)
	model.multishipmethods (Array)
	model.lines_sort (Array)
	model.latest_addition (undefined)
	model.promocodes (Array)
	model.ismultishipto (Boolean)
	model.shipmethod (undefined)
	model.billaddress (undefined)
	model.shipaddress (String)
	model.isPaypalComplete (Boolean)
	model.touchpoints (Object)
	model.touchpoints.logout (String)
	model.touchpoints.customercenter (String)
	model.touchpoints.serversync (String)
	model.touchpoints.viewcart (String)
	model.touchpoints.login (String)
	model.touchpoints.welcome (String)
	model.touchpoints.checkout (String)
	model.touchpoints.continueshopping (String)
	model.touchpoints.home (String)
	model.touchpoints.register (String)
	model.touchpoints.storelocator (String)
	model.agreetermcondition (Boolean)
	model.summary (Object)
	model.summary.discounttotal_formatted (String)
	model.summary.taxonshipping_formatted (String)
	model.summary.taxondiscount_formatted (String)
	model.summary.itemcount (Number)
	model.summary.taxonhandling_formatted (String)
	model.summary.total (Number)
	model.summary.tax2total (Number)
	model.summary.discountedsubtotal (Number)
	model.summary.taxtotal (Number)
	model.summary.discounttotal (Number)
	model.summary.discountedsubtotal_formatted (String)
	model.summary.taxondiscount (Number)
	model.summary.handlingcost_formatted (String)
	model.summary.taxonshipping (Number)
	model.summary.taxtotal_formatted (String)
	model.summary.totalcombinedtaxes_formatted (String)
	model.summary.handlingcost (Number)
	model.summary.totalcombinedtaxes (Number)
	model.summary.giftcertapplied_formatted (String)
	model.summary.shippingcost_formatted (String)
	model.summary.discountrate (Number)
	model.summary.taxonhandling (Number)
	model.summary.tax2total_formatted (String)
	model.summary.discountrate_formatted (String)
	model.summary.estimatedshipping (Number)
	model.summary.subtotal (Number)
	model.summary.shippingcost (Number)
	model.summary.estimatedshipping_formatted (String)
	model.summary.total_formatted (String)
	model.summary.giftcertapplied (Number)
	model.summary.subtotal_formatted (String)
	model.options (Object)
	itemsInCart (Number)
	showPluraLabel (Boolean)
	showLines (Boolean)
	isLoading (Boolean)
	subtotalFormatted (String)
	cartTouchPoint (String)
	isPriceEnabled (Boolean)

----}}
