/*************************************************************
Fresh Service ID: 
Script Name   : HF | US | Set Payment Operation To Capt
Applies To    : Paid Invoice
Date          : 08/04/2023
Author        : Ayush Gehalot
UpdatedBy     :
Description   : Set payment operation to Capture on Paid Invoice
*************************************************************/
/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/error'],
    function (error) {
        var CASHSALE = "cashsale";
        var PAYMENTOPERATION = "paymentoperation";
        var CAPTURE = "CAPTURE";
      function pageInit(context) {
        }
        function saveRecord(context) {
            try {
              log.debug("Start:");
                var currentRecord = context.currentRecord;
                if (currentRecord.type == CASHSALE) {
                    currentRecord.setValue({
                        fieldId: PAYMENTOPERATION,
                        value: CAPTURE
                    });
                  log.debug("setting payment operation to Capture");
                }
            } catch (err) {
                log.error("ERROR: while setting payment operation to Capture", err);
            }
            return true;
        }
        return {
          pageInit: pageInit,
            saveRecord: saveRecord
        };
    });