<div class="modal-dialog global-views-modal confirm-terms-modal">
    <div class="global-views-modal-content">
        <div id="modal-header" class="global-views-modal-content-header">
            <h2 class="global-views-modal-content-header-title">
                {{translate 'Please Agree to the Terms and Conditions'}}
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
            <button class="button-large button-tertiary" data-action="decline-terms">I do Not Agree</button>
            <button class="button-large button-primary" data-action="confirm-terms">I agree</button>
        </div>
    </div>
</div>
<div class="modal-backdrop-custom"></div>
