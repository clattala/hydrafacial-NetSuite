/**
 * treveraUtilsUserEvents.ts
 * by Trevera
 * shelby.severin@trevera.com
 *
 * @NScriptName Trevera Utils - User Events
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/error", "N/search"], function (require, exports, err, search) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isUserOptedIn = void 0;
    function isUserOptedIn(rec) {
        const userFieldLookup = search.lookupFields({ type: search.Type.CUSTOMER, id: rec.getValue('entity'), columns: ['custentity_trv_sca_agree_terms'] });
        const isUserAgreedTerms = userFieldLookup['custentity_trv_sca_agree_terms'];
        if (!isUserAgreedTerms) {
            throw err.create({
                "name": "ERR_AGREE_TERMS",
                "message": `You haven't agreed to our terms. In order to continue, you must agree to the terms.`,
                "notifyOff": false
            });
        }
    }
    exports.isUserOptedIn = isUserOptedIn;
});
