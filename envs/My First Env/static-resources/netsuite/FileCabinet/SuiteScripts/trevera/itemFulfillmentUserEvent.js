/**
 * itemFulfillmentUserEvent.ts
 * by Trevera, Inc.
 *
 * @NScriptName HF | Item Fulfillment | User Event
 * @NScriptType UserEventScript
 * @NApiVersion 2.1
 */
define(["N/email", "N/log", "N/search", "N/record", "N/render"], function (email, log, search, record, render) {
    var exports = {};
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isCreatedFromSO = exports.setTrackingNumbers = exports.sendEmailConfirmation = exports.afterSubmit = exports.beforeSubmit = void 0;
    function beforeSubmit(context) {
        if (context.type == context.UserEventType.DELETE)
            return;
        if (~[context.UserEventType.CREATE, context.UserEventType.EDIT].indexOf(context.type)) {
            var shipmethod = Number(context.newRecord.getValue('shipmethod'));
            log.debug("setting tracking", "shipmethod: " + shipmethod + " tracking numbers: " + context.newRecord.getValue('custbody_trv_fulfillment_tracking_nums'));
            if (shipmethod > 0) {
                var methodLookup = search.lookupFields({ type: search.Type.SHIP_ITEM, id: shipmethod, columns: ['description'] });
                log.debug('methodLookup', methodLookup);
                context.newRecord.setValue({ fieldId: 'custbody_trv_fulfillment_method_name', value: methodLookup.description });
            }
        }
    }
    exports.beforeSubmit = beforeSubmit;
    function afterSubmit(context) {
        if (context.type == context.UserEventType.DELETE)
            return;
        if (~[context.UserEventType.CREATE, context.UserEventType.EDIT].indexOf(context.type)) {
            var createdFrom = context.newRecord.getValue({ fieldId: 'createdfrom' });
            var createdFromSO = isCreatedFromSO(createdFrom);
            if (createdFromSO) {
                var ifRecord = record.load({ type: record.Type.ITEM_FULFILLMENT, id: context.newRecord.id });
                for (var line = 0; line < context.newRecord.getLineCount({ sublistId: 'item' }); line++) {
                    var value = ifRecord.getSublistValue({ sublistId: 'item', fieldId: 'line', line: line });
                    if (value && Number(value) > -1)
                        ifRecord.setSublistValue({ sublistId: 'item', fieldId: 'custcol_hf_line_id', value: value, line: line });
                }
                try {
                    var saved = ifRecord.save();
                    log.debug("updated IF record with line values", "record id: " + saved);
                }
                catch (e) {
                    log.error('error saving fulfillment', e);
                }
            }
        }
    }
    exports.afterSubmit = afterSubmit;
    function sendEmailConfirmation(rec) {
        var customerId = rec.getValue({ fieldId: 'entity' });
        var customerFields = search.lookupFields({ type: search.Type.CUSTOMER, id: customerId, columns: ['salesrep', 'email'] });
        var createdFrom = rec.getValue({ fieldId: 'createdfrom' });
        var createdFromSO = isCreatedFromSO(createdFrom);
        var customerEmail = customerFields['email'];
        var isWeb = false;
        if (createdFromSO) {
            var soFields = search.lookupFields({ type: search.Type.SALES_ORDER, id: createdFrom, columns: ['email', 'source'] });
            var customerEmailFromSO = soFields['email'];
            customerEmail = customerEmailFromSO.length > 0 ? customerEmailFromSO : customerEmail;
            var source = soFields['source'];
            isWeb = !!source && source.length > 0 && source[0].value == 'NLWebStore';
        }
        if (!isWeb) {
            log.debug('not a web order', "send the email to " + customerEmail);
            var sender = '163772'; //HydraFacial Orders Employee - SB2: 48664
            var mergeResult = render.mergeEmail({
                templateId: 21,
                entity: { type: 'employee', id: Number(sender) },
                recipient: { type: 'customer', id: Number(customerId) },
                transactionId: Number(rec.id)
            });
            try {
                // send email
                email.send({
                    author: Number(sender),
                    recipients: [customerEmail],
                    subject: mergeResult.subject,
                    body: mergeResult.body,
                    relatedRecords: {
                        entityId: Number(customerId),
                        transactionId: Number(rec.id)
                    }
                });
                return true;
            }
            catch (e) {
                log.error('error sending email', e);
                return false;
            }
        }
        else {
            log.debug("not sending email for item fulfillment " + rec.id + " as order " + createdFromSO + " is web order", "created from: " + createdFromSO);
        }
        return false;
    }
    exports.sendEmailConfirmation = sendEmailConfirmation;
    function setTrackingNumbers(rec) {
        var setOnSO = false;
        var selectedShipMethod = rec.getValue({ fieldId: 'shipmethod' });
        var selectedShipMethodText = rec.getText({ fieldId: 'shipmethod' });
        if (selectedShipMethodText && selectedShipMethodText.length < 1) { // on xedit data isn't fully sourced so load the record
            var ifRecord = record.load({ type: record.Type.ITEM_FULFILLMENT, id: rec.id });
            selectedShipMethod = ifRecord.getValue({ fieldId: 'shipmethod' });
            selectedShipMethodText = ifRecord.getText({ fieldId: 'shipmethod' });
        }
        var trackingNumbers = getTrackingNumbers(rec.id);
        var trackingString = '';
        if (trackingNumbers) {
            var trackingNumbersString = typeof trackingNumbers != 'string' ? getTrackingNumberFromString(trackingNumbers) : trackingNumbers;
            if (trackingNumbersString.length > 0) {
                log.debug("selectedShipMethod: " + selectedShipMethod + ", selectedShipMethodText: " + selectedShipMethodText, "trackingNumbers " + trackingNumbers + " typeof " + typeof trackingNumbers + " trackingNumbersString " + typeof trackingNumbersString);
                if (selectedShipMethodText.toUpperCase().indexOf('UPS') > -1) {
                    trackingString =
                        "<a target=\"_blank\" href=\"https://www.ups.com/track?loc=null&tracknum=" + trackingNumbersString.replace(/ /g, '') + "&requester=UPSHome/trackdetails\">\n            " + trackingNumbersString;
                }
                else if (selectedShipMethodText.toUpperCase().indexOf('U.S.P.S.') > -1 || selectedShipMethodText.toUpperCase().indexOf('USPS') > -1) {
                    trackingString =
                        "<a target=\"_blank\" href=\"https://tools.usps.com/go/TrackConfirmAction?tRef=fullpage&tLc=2&text28777=&tLabels=" + trackingNumbersString.replace(/ /g, '') + "%2C&tABt=false\">\n            " + trackingNumbersString;
                }
                else if (selectedShipMethodText.toUpperCase().indexOf('FEDEX') > -1) {
                    trackingString =
                        "<a target=\"_blank\" href=\"https://www.fedex.com/apps/fedextrack/?tracknumbers=" + trackingNumbersString.replace(/ /g, '') + "&language=en&cntry_code=ph\">\n            " + trackingNumbersString;
                }
                /*else if (Number(selectedShipMethod) == 3) {
                  trackingString =
                    `<a target="_blank" href="https://rgl.radiantdelivers.com/track?key=0102${trackingNumbersString.replace(/ /g, '')}">
                      ${trackingNumbersString}`;
                }*/
                else {
                    trackingString = selectedShipMethodText + " " + trackingNumbersString;
                }
                trackingString += trackingString.length > 0 ? '</a>' : '';
            }
            var createdFrom = rec.getValue('createdfrom');
            if (isCreatedFromSO(createdFrom) && setOnSO) {
                record.submitFields({
                    type: record.Type.SALES_ORDER,
                    id: createdFrom,
                    values: {
                        'custbody_trv_fulfillment_tracking_nums': trackingString
                    }
                });
            }
            log.debug('set tracking', trackingString);
            rec.setValue({ fieldId: 'custbody_trv_fulfillment_tracking_nums', value: trackingString });
        }
    }
    exports.setTrackingNumbers = setTrackingNumbers;
    function getTrackingNumberFromString(trackingNumbers) {
        var trackingNumbersString = '';
        for (var i = 0; i < trackingNumbers.length; i++) {
            trackingNumbersString += trackingNumbers[i];
            if (i < trackingNumbers.length - 1)
                trackingNumbersString += ',';
        }
        return trackingNumbersString;
    }
    function getTrackingNumbers(recId) {
        var packages = [];
        try {
            if (recId === null)
                return;
            var recSearch = search.create({
                type: search.Type.ITEM_FULFILLMENT,
                columns: [
                    { name: 'tranid' },
                    { name: 'packagecount' },
                    { name: 'trackingnumbers' }
                ],
                filters: [['internalid', 'anyof', recId], 'AND', ['mainline', 'is', 'T']]
            });
            recSearch.run().each(function (result) {
                var numbers = result.getValue({ name: 'trackingnumbers' });
                if (numbers.indexOf('<BR>') > -1) {
                    var packagesSplit = numbers.split('<BR>');
                    for (var i = 0; i < packagesSplit.length; i++) {
                        packages.push(packagesSplit[i]);
                    }
                }
                else {
                    if (numbers.length > 0) {
                        packages.push(numbers.replace(/<br>/, '').replace(/<BR>/, ''));
                    }
                }
                return true;
            });
        }
        catch (error) {
            log.debug({ title: 'error getting packages', details: error });
        }
        log.debug('packages: getTrackingNumbers', packages);
        return packages;
    }
    function isCreatedFromSO(createdFrom) {
        if (Number(createdFrom) > 0) {
            var fieldLookup = search.lookupFields({ type: search.Type.TRANSACTION, id: createdFrom, columns: ['type'] });
            var createdFromType = fieldLookup['type'];
            if (createdFromType && createdFromType.length > 0 && createdFromType[0].value == 'SalesOrd') {
                return true;
            }
        }
        return false;
    }
    exports.isCreatedFromSO = isCreatedFromSO;
    return exports;
});
