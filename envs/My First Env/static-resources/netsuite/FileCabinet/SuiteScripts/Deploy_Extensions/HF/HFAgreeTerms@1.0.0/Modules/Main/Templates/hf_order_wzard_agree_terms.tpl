<div class="order-wizard-agree-terms-module">
    <div class="order-wizard-agree-terms-module-row">
        <label for="purchase-order-number" class="order-wizard-agree-terms-module-purchase-order-label">
            <input type="checkbox" name="purchase-order-number" id="purchase-order-number" data-action="validate-checked" class="order-wizard-agree-terms-module-purchase-order-value" value="{{isChecked}}" {{#if isRequired}}required{{/if}}>
            <span>{{translate termsCopy}}
                <span class="order-wizard-agree-terms-module-purchase-order-required">*</span>
                <span class="order-wizard-agree-terms-module-purchase-order-optional">(Required)</span></span>
        </label>
    </div>
</div>

{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
