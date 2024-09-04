<div class="add-to-cart-confirm-message">
    <div class="add-to-cart-confirm-message-message">
        {{{message}}}
    </div>
    {{#if requireConfirmation}}
        <div data-view="ConfirmMessageError"></div>
        <label>{{translate 'I acknowledge I have recieved this message.'}}
            <input type="checkbox" id="confirm_message" name="confirm_message" required/>
        </label>
    {{/if}}
    {{#if inModal}}
        <div class="add-to-cart-confirm-message-buttons">
            <button data-action="{{dataConfirmAction}}" class="button-primary button-medium">Add to Cart</button>
            <button data-dismiss="modal" class="button-secondary button-medium">Cancel</button>
        </div>
    {{/if}}
</div>
