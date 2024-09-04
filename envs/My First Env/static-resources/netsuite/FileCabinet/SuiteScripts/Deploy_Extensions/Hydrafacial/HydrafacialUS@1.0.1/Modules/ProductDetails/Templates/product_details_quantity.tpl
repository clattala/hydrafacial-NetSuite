{{#if hfExtras.showAddToCart}}
    <div>
        {{#if showQuantity}}
            <div class="product-details-quantity-options" data-validation="control-group">
                <label for="quantity" class="product-details-quantity-options-title">
				{{translate 'Qty' 'Abbreviation of "Quantity". Shows the quantity of an item'}}:
                </label>

                <div data-validation="control">
                    <div class="product-details-quantity-container">
                        <button type="button" class="product-details-quantity-remove" data-action="updateQuantity" data-type="product-details-quantity-remove" data-value="-1" {{#if isMinusButtonDisabled}}disabled="disabled"{{/if}}>-</button>
                        <input type="text" name="quantity" id="quantity" data-action="changeQuantity" class="product-details-quantity-value"
                            {{#if hfExtras.limitQuantity}}value="{{hfExtras.maxAllowed}}" {{else}}value="{{model.quantity}}"{{/if}} min="1" {{#if hfExtras.limitQuantity}}max="{{hfExtras.maxAllowed}}"{{/if}}>
                        <button type="button" class="product-details-quantity-add" data-action="updateQuantity" data-value="+1" {{#if hfExtras.isQtyAddDisabled}}disabled{{/if}}>+</button>
                    </div>
                </div>
            </div>
        {{else}}
            <input type="hidden" name="quantity" id="quantity" value="1">
        {{/if}}
    </div>
{{/if}}




{{!----
Use the following context variables when customizing this template:

	model (Object)
	model.item (Object)
	model.item.internalid (Number)
	model.item.type (String)
	model.quantity (Number)
	model.options (Array)
	model.options.0 (Object)
	model.options.0.cartOptionId (String)
	model.options.0.itemOptionId (String)
	model.options.0.label (String)
	model.options.0.type (String)
	model.location (String)
	model.fulfillmentChoice (String)
	showQuantity (Boolean)
	isMinusButtonDisabled (Boolean)

----}}
