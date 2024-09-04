{{#if isSection}}
    <section class="paymentinstrument-ach-edit">
{{/if}}
    <form action="PaymentInstrumentACH.Service.ss" method="POST">
        {{#if isModal}}
            <div class="paymentinstrument-ach-edit-body">
        {{/if}}

        <fieldset class="paymentinstrument-ach-edit-form">
            <div data-type="alert-placeholder"></div>

            <small class="paymentinstrument-ach-edit-form">{{translate 'Required'}} <span class="paymentinstrument-ach-edit-form-required">*</span></small>


            <div class="paymentinstrument-ach-edit-form" data-input="account" data-validation="control-group">
                <label class="paymentinstrument-ach-edit-form-label" for="account">
                    {{translate 'Account Number'}} <span class="paymentinstrument-ach-edit-form-label-required">*</span>
                </label>
                {{#if isNew}}
                    <div class="paymentinstrument-ach-edit-form-controls" data-validation="control">
                        <input type="text" class="paymentinstrument-ach-edit-form-input" id="account" name="account" value="{{account}}" {{#unless isNew}}disabled{{/unless}}>
                    </div>
                {{else}}
                    <div class="paymentinstrument-ach-edit-form-controls">
                        <input class="paymentinstrument-ach-edit-form-input" id="account" name="account" value="{{account}}" disabled/>
                    </div>
                {{/if}}
            </div>

            <div class="paymentinstrument-ach-edit-form">
                <div class="paymentinstrument-ach-edit-form-controls-cc-select-container" data-value="ach-select-container" data-validation="control-group">
                    <label class="paymentinstrument-ach-edit-form-controls-cc-select-label" for="paymentmethod">
                        {{translate 'Payment Method'}}
                        <span class="paymentinstrument-ach-edit-form-required">*</span>
                    </label>
                    {{#if isNew}}
                        <div class="paymentinstrument-ach-edit-form-controls" data-validation="control">
                            <select class="paymentinstrument-ach-edit-form-controls-cc-select" id="paymentmethod" name="paymentmethod" {{#unless isNew}}disabled{{/unless}}>
                                <option value="0">{{translate 'Please Select a Payment Method'}}</option>
                                {{#each paymentMethods}}
                                    <option value="{{key}}" {{#if selected}} selected {{/if}}>{{name}}</option>
                                {{/each}}
                            </select>
                        </div>
                    {{else}}
                    <input class="paymentinstrument-ach-edit-form-input" type="hidden" id="paymentmethod" name="paymentmethod" value="{{paymentMethodValue}}"/>
                        <div class="paymentinstrument-ach-edit-form-controls">
                            <input type="text" class="paymentinstrument-ach-edit-form-input" id="paymentmethodsaved" name="paymentmethodsaved" value="{{paymentMethodSaved}}" disabled>
                        </div>
                    {{/if}}
                </div>
            </div>

            <div class="paymentinstrument-ach-edit-form">
                <div class="paymentinstrument-ach-edit-form-controls-cc-select-container" data-value="ach-select-container" data-validation="control-group">
                    <label class="paymentinstrument-ach-edit-form-controls-cc-select-label" for="accounttype">
                        {{translate 'Account Type'}}
                        <span class="paymentinstrument-ach-edit-form-required">*</span>
                    </label>
                    {{#if isNew}}
                        <div class="paymentinstrument-ach-edit-form-controls" data-validation="control">
                            <select class="paymentinstrument-ach-edit-form-controls-cc-select" id="accounttype" name="accounttype">
                                <option value="0">{{translate 'Please Select an Account Type'}}</option>
                                {{#each accountTypes}}
                                    <option value="{{key}}" {{#if selected}} selected {{/if}}>{{name}}</option>
                                {{/each}}
                            </select>
                        </div>
                    {{else}}
                        <div class="paymentinstrument-ach-edit-form-controls">
                            <input type="text" class="paymentinstrument-ach-edit-form-input" id="accounttype" name="accounttype" value="{{accountTypeSaved}}" disabled>
                        </div>
                    {{/if}}
                </div>
            </div>

            <div class="paymentinstrument-ach-edit-form" data-input="routingnumber" data-validation="control-group">
                <label class="paymentinstrument-ach-edit-form-label" for="routingnumber">
                    {{translate 'Routing Number'}} <span class="paymentinstrument-ach-edit-form-label-required">*</span>
                </label>
                <div class="paymentinstrument-ach-edit-form-controls" data-validation="control">
                    <input type="text" class="paymentinstrument-ach-edit-form-input" id="routingnumber" name="routingnumber" value="{{routingNumber}}" {{#unless isNew}}disabled{{/unless}}>
                </div>
            </div>

            <div class="paymentinstrument-ach-edit-form" data-input="bankname" data-validation="control-group">
                <label class="paymentinstrument-ach-edit-form-label" for="bankname">
                    {{translate 'Bank Name'}} <span class="paymentinstrument-ach-edit-form-label-required">*</span>
                </label>
                <div class="paymentinstrument-ach-edit-form-controls" data-validation="control">
                    <input type="text" class="paymentinstrument-ach-edit-form-input" id="bankname" name="bankname" value="{{bankName}}" {{#unless isNew}}disabled{{/unless}}>
                </div>
            </div>

            <div class="paymentinstrument-ach-edit-form" data-input="ownername" data-validation="control-group">
                <label class="paymentinstrument-ach-edit-form-label" for="ownername">
                    {{translate 'Owner Name'}} <span class="paymentinstrument-ach-edit-form-label-required">*</span>
                </label>
                <div class="paymentinstrument-ach-edit-form-controls" data-validation="control">
                    <input type="text" class="paymentinstrument-ach-edit-form-input" id="ownername" name="ownername" value="{{ownerName}}" {{#unless isNew}}disabled{{/unless}}>
                </div>
            </div>

            <div class="paymentinstrument-ach-edit-form" data-input="limit" data-validation="control-group">
                <label class="paymentinstrument-ach-edit-form-label" for="limit">
                    {{translate 'Limit'}} <span class="paymentinstrument-ach-edit-form-label-required">*</span>
                </label>
                <div class="paymentinstrument-ach-edit-form-controls" data-validation="control">
                    <input type="text" class="paymentinstrument-ach-edit-form-input" id="limit" name="limit" value="{{limit}}">
                </div>
            </div>

        </fieldset>


        {{#if isModal}}
            </div>
        {{/if}}

        {{#if showFooter}}
            <div class="{{#if isModal}} paymentinstrument-ach-edit-footer-modal {{else}} paymentinstrument-ach-edit-footer {{/if}}">
                <button type="submit" class="paymentinstrument-ach-edit-form-button-submit">
                    {{#if isNew}}
                        {{translate 'Add ACH'}}
                    {{else}}
                        {{translate 'Update ACH'}}
                    {{/if}}
                </button>

                {{#if isModalOrCollectionLength}}
                    <button class="paymentinstrument-ach-edit-form-button-cancel" data-dismiss="modal">
                        {{translate 'Cancel'}}
                    </button>
                {{/if}}
            </div>
        {{/if}}

    </form>
{{#if isSection}}
    </section>
{{/if}}