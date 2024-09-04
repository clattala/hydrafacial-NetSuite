<div class="order-wizard-agree-terms-module">
    <div class="order-wizard-agree-terms-module-row">
        <label for="agree-terms" class="order-wizard-agree-terms-module-agree-terms-label">
            <input type="checkbox" name="agree-terms" id="agree-terms" data-action="validate-checked" class="order-wizard-agree-terms-module-agree-terms-value" value="{{isChecked}}" {{#if isChecked}}checked{{/if}} {{#if isRequired}}required{{/if}}>
            <span>
                {{translate label}}
                <span class="order-wizard-agree-terms-module-agree-terms-required">*</span>
                <span class="order-wizard-agree-terms-module-agree-terms-optional">(Required)</span></span>
        </label>
    </div>
</div>

{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
