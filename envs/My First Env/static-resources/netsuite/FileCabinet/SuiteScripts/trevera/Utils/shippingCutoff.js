/**
 * shippingCutoff.ts
 * by Trevera
 * shelby.severin@trevera.com
 *
 * @NScriptName HF | Shipping Cutoff Utils
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/format", "N/log", "N/query"], function (require, exports, format, log, query) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkIfAfterCutoffTime = exports.setShippingDateFromCutoffTime = void 0;
    //import runtime = require('N/runtime');
    function setShippingDateFromCutoffTime(rec, subsidiary) {
        const now = new Date(); //SuiteAnswer 37356: Date is always in PST on NS Servers
        const currentShipDateStr = rec.getValue({ fieldId: 'shipdate' }); // netsuite date
        let currentShipDate = new Date(); // sometimes shipdate field isn't populated so default to today and set it if it's blank....
        log.debug('setShippingDateFromCutoffTime', `currentShipDateStr: ${currentShipDateStr}`);
        let updateDate = false;
        if (currentShipDateStr) {
            currentShipDate = format.parse({ value: currentShipDateStr, type: format.Type.DATE }); // convert to date object
        }
        else {
            rec.setValue('shipdate', format.format({ value: currentShipDate, type: format.Type.DATE })); // if no current ship date string, then we need to set the header date no matter what
        }
        currentShipDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        const nowCutoff = new Date();
        const isAfterCutoffTime = checkIfAfterCutoffTime(nowCutoff, subsidiary);
        const isSelectedDateToday = currentShipDate.getTime() <= now.getTime();
        const shipDateInPast = currentShipDate.getTime() < now.getTime();
        let tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        log.audit(`isAfterCutoffTime ${isAfterCutoffTime}`, `currentShipDateStr: ${currentShipDateStr} shipDateInPast ${shipDateInPast} isSelectedDateToday ${isSelectedDateToday} ${currentShipDate.getDate() <= now.getDate()} ${currentShipDate.getDate()} ${now.getDate()}`);
        if ((isAfterCutoffTime && isSelectedDateToday) || shipDateInPast) {
            updateDate = true;
            if (isAfterCutoffTime && isSelectedDateToday && now.getDay() == 5) { // on Friday move to monday
                tomorrow = new Date();
                tomorrow.setDate(now.getDate() + 3);
                log.audit('today is a friday', `setting the day to monday ${tomorrow}`);
            }
        }
        else if (now.getDay() == 6) { // on Saturday move to monday
            updateDate = true;
            tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 2);
            log.audit('today is a saturday', `setting the day to monday ${tomorrow}`);
        }
        else if (now.getDay() == 0) { // on Sunday move to monday
            updateDate = true;
            tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            log.audit('today is a Sunday', `setting the day to monday ${tomorrow}`);
        }
        log.audit(`updateDate ${updateDate}`, `tomorrow ${tomorrow}, shipDateInPast ${shipDateInPast}, isAfterCutoffTime ${isAfterCutoffTime}`);
        if (updateDate) {
            currentShipDate = format.parse({ value: tomorrow, type: format.Type.DATE }); //https://netsuite.custhelp.com/app/answers/detail/a_id/78455
            rec.setValue({ fieldId: 'shipdate', value: currentShipDate });
        }
        /** in the web, the value needs to be string. In the UI, it seems to need to be an actual date object */
        //if (runtime.executionContext == runtime.ContextType.WEBSTORE) currentShipDate = format.format({ value: currentShipDate, type: format.Type.DATE });
        log.audit('updateDate currentShipDate', currentShipDate);
        return currentShipDate;
    }
    exports.setShippingDateFromCutoffTime = setShippingDateFromCutoffTime;
    function checkIfAfterCutoffTime(dateObj, subsidiary) {
        const shippingConfig = getShippingConfig(subsidiary);
        const hours = dateObj.getHours();
        const mins = dateObj.getMinutes();
        log.audit('checkIfAfterCutoffTime', { shippingConfig, hours, mins });
        if (shippingConfig.length == 1)
            return (hours == shippingConfig[0].hours && mins > shippingConfig[0].minutes) || hours > shippingConfig[0].hours;
        return false;
    }
    exports.checkIfAfterCutoffTime = checkIfAfterCutoffTime;
    function getShippingConfig(subsidiary) {
        return query.runSuiteQL({
            query: `
	      SELECT custrecord_hf_shipping_cutoff_hours as hours, custrecord_hf_shipping_cutoff_min as minutes
	      FROM customrecord_hf_shipping_cutoff_config
        WHERE customrecord_hf_shipping_cutoff_config.custrecord_hf_shipping_config_subsidiary = ${subsidiary}
	      `,
            params: []
        }).asMappedResults();
    }
});
