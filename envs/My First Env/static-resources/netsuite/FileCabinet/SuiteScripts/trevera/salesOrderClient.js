/**
 * salesOrderClient.ts
 * by shelby.severin@trevera.com
 *
 * @NScriptName HF | Sales Order | Client
 * @NScriptType ClientScript
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/currentRecord", "N/format", "N/runtime", "./Utils/treveraUtilsClient", "./Utils/shippingCutoff", "./Utils/hfEntityDefaults", "./Utils/hfGlobalConfig"], function (require, exports, currentRecord, format, runtime, treveraUtilsClient_1, shippingCutoff_1, hfEntityDefaults_1, hfGlobalConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkForCustomPromotions = exports.saveRecord = exports.postSourcing = exports.fieldChanged = exports.pageInit = exports.MODE = exports.ITEM_LOCATIONS = exports.ITEMS = void 0;
    exports.ITEMS = {};
    exports.ITEM_LOCATIONS = {};
    exports.MODE = '';
    let _globalConfig;
    function pageInit(context) {
        _globalConfig = (0, hfGlobalConfig_1._getConfig)();
        console.log('subsidiary', context.currentRecord.getValue({ fieldId: 'subsidiary' }));
        exports.MODE = context.mode;
        if ((context.mode == 'create' || context.currentRecord.getValue('location') == '') && context.currentRecord.getValue({ fieldId: 'subsidiary' }) != '') {
            (0, treveraUtilsClient_1.getDefaultLocationForSubsidiary)();
            if (context.mode == 'create' || context.mode == 'copy') {
                const subsidiary = context.currentRecord.getValue({ fieldId: 'subsidiary' });
                if (subsidiary == _globalConfig.usSubsidiary.toString())
                    setShippingDate();
                if (Number(context.currentRecord.getValue('entity')) > 0) {
                    (0, hfEntityDefaults_1.setEntityDefaults)(context.currentRecord, true);
                    addCOTaxItem();
                }
            }
        }
        if (runtime.getCurrentUser().id == 339) {
            if (context.mode == 'create') {
                context.currentRecord.setValue('custbody_hf_order_type', '1'); // new order
                context.currentRecord.setValue('custbody_hf_ordersource', '1'); // online
            }
            if (Number(context.currentRecord.getValue('entity')) > 0) {
                (0, hfEntityDefaults_1.setEntityDefaults)(context.currentRecord, true);
            }
        }
    }
    exports.pageInit = pageInit;
    function fieldChanged(context) {
        if (context.fieldId == 'subsidiary') {
            (0, treveraUtilsClient_1.getDefaultLocationForSubsidiary)();
            if (context.currentRecord.getValue({ fieldId: 'subsidiary' }) == _globalConfig.usSubsidiary.toString() && context.currentRecord.id < 1) {
                setShippingDate();
            }
        }
        if (context.fieldId == 'shipaddress' && context.currentRecord.getValue({ fieldId: 'subsidiary' }) == _globalConfig.usSubsidiary.toString())
            addCOTaxItem();
        if (context.fieldId == 'custbody_hf_de_fin_leasing_company' && _globalConfig.runPartnerLogicFor.includes(context.currentRecord.getValue({ fieldId: 'subsidiary' })))
            (0, hfEntityDefaults_1.setInvoiceAddress)(context.currentRecord, context.currentRecord.getValue({ fieldId: 'entity' }), true);
    }
    exports.fieldChanged = fieldChanged;
    /*export function sublistChanged(context: EntryPoints.Client.sublistChangedContext) { // this has to run in order to trigger the validateLine on multiadd
      if (context.sublistId === 'item') {
        if (Object.keys(ITEMS).length != context.currentRecord.getLineCount({ sublistId: 'item' })) {
          for (let line = 0; line < context.currentRecord.getLineCount({ sublistId: 'item' }); line++) {
            ITEMS[line]          = context.currentRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line }) as string;
            ITEM_LOCATIONS[line] = context.currentRecord.getSublistValue({ sublistId: 'item', fieldId: 'location', line }) as string;
            // set the class to the customer region
            context.currentRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'class', value: context.currentRecord.getValue('class') });
          }
        }
      }
    }*/
    function postSourcing(context) {
        // if the header location changes, reset it to the subsidiary default
        if (context.fieldId == 'location' && !context.sublistId)
            (0, treveraUtilsClient_1.getDefaultLocationForSubsidiary)();
        // set the line location based on the header when an item is added
        //if (context.fieldId == 'item' && context.sublistId == 'item') setLineLocationFromHeader(ITEMS, true);
        // when the ship address changes, check if its CO and add a tax item if it is
        if (context.fieldId == 'shipaddress')
            addCOTaxItem();
        // when the entity changes, for the US, set the entity defaults
        if (context.fieldId == 'entity') {
            (0, hfEntityDefaults_1.setEntityDefaults)(context.currentRecord, true);
        }
    }
    exports.postSourcing = postSourcing;
    /**
     * Moved to saveRecord validation as per NS support: This behaviour is caused by client script which validate line faster then post sourcing set the value on the location field.
     export function validateLine(context: EntryPoints.Client.validateLineContext) {
     if (context.sublistId == 'item') {
     if (!requireInventoryLocationOnLine(context.currentRecord)) {
     return false;
     }
     if (!requireLocationOnLine(context.currentRecord)) {
     return false;
     }
     }
     return true;
     }
     */
    function saveRecord(context) {
        const subsidiary = context.currentRecord.getValue({ fieldId: 'subsidiary' });
        const isCancelled = ~['C', 'F', 'G', 'H'].indexOf(context.currentRecord.getValue({ fieldId: 'orderstatus' }));
        if (subsidiary == _globalConfig.usSubsidiary.toString() && !isCancelled) {
            const currentShipDateStr = context.currentRecord.getValue({ fieldId: 'shipdate' });
            if (!!currentShipDateStr) {
                const currentShipDate = format.parse({ value: currentShipDateStr, type: format.Type.DATE, timezone: format.Timezone.AMERICA_LOS_ANGELES });
                const nowPST = format.format({ value: new Date(), type: format.Type.DATE, timezone: format.Timezone.AMERICA_LOS_ANGELES });
                const now = new Date(nowPST);
                console.log('nowPst', nowPST, now);
                if (currentShipDate < now) {
                    /*window.alert('You have entered a ship date in the past.');
                    return false;*/
                    context.currentRecord.setValue('shipdate', now);
                    for (let line = 0; line < context.currentRecord.getLineCount({ sublistId: 'item' }); line++) {
                        context.currentRecord.selectLine({ sublistId: 'item', line });
                        context.currentRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'expectedshipdate', value: currentShipDate });
                        context.currentRecord.commitLine({ sublistId: 'item' });
                    }
                }
            }
        }
        const shippingValid = (0, treveraUtilsClient_1.isShippingValid)();
        if (shippingValid.length > 0) {
            alert(shippingValid);
            return false;
        }
        if (context.currentRecord.getValue('custbody_hf_shippayacct') == 'C058Y9')
            context.currentRecord.setValue('custbody_hf_shippayacct', ''); // clear the account on save.
        return true;
    }
    exports.saveRecord = saveRecord;
    /*export function validateDelete(context: EntryPoints.Client.validateDeleteContext) {
      if (context.sublistId == 'item') {
        for (let i = 0; i < context.currentRecord.getLineCount({ sublistId: 'item' }); i++) {
          ITEMS[i]          = context.currentRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i }) as string;
          ITEM_LOCATIONS[i] = context.currentRecord.getSublistValue({ sublistId: 'item', fieldId: 'location', line: i }) as string;
        }
      }
      return true;
    }*/
    function setShippingDate() {
        currentRecord.get.promise().then(rec => {
            const currentShipDate = (0, shippingCutoff_1.setShippingDateFromCutoffTime)(rec, Number(_globalConfig.usSubsidiary));
            for (let line = 0; line < rec.getLineCount({ sublistId: 'item' }); line++) {
                rec.selectLine({ sublistId: 'item', line });
                rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'expectedshipdate', value: currentShipDate });
                rec.commitLine({ sublistId: 'item' });
            }
        });
    }
    function addCOTaxItem() {
        currentRecord.get.promise().then(rec => {
            const addressSubRecord = rec.getSubrecord({ fieldId: 'shippingaddress' });
            const state = addressSubRecord.getValue('state').toLowerCase();
            console.log(`checking state of shipping address`, state);
            if (_globalConfig.coloradoTaxItem && _globalConfig.coloradoTaxItemOn) {
                const taxItemOnOrder = rec.findSublistLineWithValue({ sublistId: 'item', fieldId: 'item', value: _globalConfig.coloradoTaxItem });
                if (state == 'co') { // colorado
                    if (taxItemOnOrder < 0) {
                        const location = rec.getValue('location');
                        const region = rec.getValue('class');
                        rec.selectNewLine({ sublistId: 'item' });
                        rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: _globalConfig.coloradoTaxItem, fireSlavingSync: true });
                        rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'location', value: location });
                        rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'class', value: region });
                        rec.commitLine({ sublistId: 'item' });
                    }
                }
                else {
                    if (taxItemOnOrder > -1) {
                        rec.removeLine({ sublistId: 'item', line: taxItemOnOrder });
                    }
                }
            }
        });
    }
    function checkForCustomPromotions() {
        /*currentRecord.get.promise().then(rec => {
         const lines = rec.getLineCount({sublistId: 'item'});
         if(lines > 0) {
         const promotions = listPromotions(rec.getValue('entity') as string, '');
         const nonDiscountLines = [];
         for (let i = 0; i < lines; i++) {
         if(rec.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: i}) != 'Discount') {
         nonDiscountLines.push(i);
         }
         }
         }
         })*/
    }
    exports.checkForCustomPromotions = checkForCustomPromotions;
});
