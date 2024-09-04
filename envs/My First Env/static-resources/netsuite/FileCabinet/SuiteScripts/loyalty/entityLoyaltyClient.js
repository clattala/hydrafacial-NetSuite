/**
 * entityLoyaltyClient.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Loyalty - Entity Client
 * @NScriptType ClientScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/currentRecord", "N/https", "N/ui/message", "N/url"], function (require, exports, currentRecord, https, msg, url) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.recalculateTier = exports.pageInit = void 0;
    function pageInit(context) {
        console.log('recalculateTier');
    }
    exports.pageInit = pageInit;
    function recalculateTier() {
        currentRecord.get.promise().then(rec => {
            const loadingMsg = msg.create({ type: msg.Type.CONFIRMATION, title: 'Requesting Tier Up', message: '' });
            loadingMsg.show();
            let scriptURL = url.resolveScript({
                scriptId: 'customscript_hf_trigger_tier_up_customer',
                deploymentId: 'customdeploy_hf_trigger_tier_up_customer',
                returnExternalUrl: false,
                params: { 'custscript_hf_call_customer': rec.id }
            });
            setTimeout(function () {
                loadingMsg.hide();
                const resp = https.get({ url: `${scriptURL}&custscript_hf_call_customer=${rec.id}` });
                console.log('scheduled task for granting access', resp);
                if (resp.body == 'success') {
                    const confMessage = msg.create({ type: msg.Type.CONFIRMATION, title: 'Request Complete', message: 'The tier calcultion is processing. Please refresh the page to see the results.' });
                    confMessage.show();
                }
                else {
                    msg.create({ type: msg.Type.ERROR, title: 'Problem Submitting Request', message: `${resp.body}` }).show();
                }
            }, 100);
        });
    }
    exports.recalculateTier = recalculateTier;
});
