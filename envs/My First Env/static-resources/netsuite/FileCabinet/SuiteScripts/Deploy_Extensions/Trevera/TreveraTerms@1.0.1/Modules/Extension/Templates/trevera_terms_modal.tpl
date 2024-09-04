{{#if termsDeclined}}
    <div class="modal-dialog global-views-modal confirm-terms-modal">
        <div class="global-views-modal-content">
            <div id="modal-header" class="global-views-modal-content-header">
                <h2 class="global-views-modal-content-header-title">
                    {{translate 'Are you sure you want to decline Terms & Conditions?'}}
                </h2>
            </div>
            <div id="modal-body" data-type="modal-body" class="global-views-modal-content-body">
                {{translate reConfirmationMessage}}
            </div>
            <div class="decline-terms-modal-buttons">
                <button class="button-small button-tertiary" data-action="decline-terms">{{translate 'Opt me out'}}</button>
                <button class="button-small button-primary" data-action="changed-my-mind">{{translate 'Go back'}}</button>
            </div>
        </div>
    </div>
    <div class="modal-backdrop-custom"></div>
{{else}}
    <div class="modal-dialog global-views-modal confirm-terms-modal">
        <div class="global-views-modal-content">
            <div id="modal-header" class="global-views-modal-content-header">
                <h2 class="global-views-modal-content-header-title">
                    {{translate termsTitle}}
                </h2>
            </div>
            <div id="modal-body" data-type="modal-body" class="global-views-modal-content-body">
                {{!--
                <iframe id="terms_copy" height="400" src="https://hydrafacial-sb2.scastaging.com/terms-and-conditions" frameborder="0"></iframe>
                --}}
                {{{terms}}}
            </div>
            <div class="modal-footer global-views-modal-footer">
                <div class="error" data-view="Terms.Alerts"></div>
                <button class="button-large button-tertiary" data-action="decline-terms">{{translate cancelButtonCopy}}</button>
                <button class="button-large button-primary" data-action="confirm-terms">{{translate confirmButtonCopy}}</button>
            </div>
        </div>
    </div>
    <div class="modal-backdrop-custom"></div>
{{/if}}
