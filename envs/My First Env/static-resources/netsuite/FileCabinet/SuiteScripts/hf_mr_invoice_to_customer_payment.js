/*************************************************************
JIRA  ID      : NGO-4462, NGO-6133, NGO-5790
Script Name   : HF_mr_invoice_to_customer_payment.js
Date          : 08/29/2022
Author        : Ayush Gehalot
UpdatedBy     :
Description   : Create Payment from invoice record
*************************************************************/

/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/record', 'N/runtime'], function (search, record, runtime) {
    function getInputData() {
        return search.load({ id: 'customsearch_hf_auto_pay_generation_new' });
    }
    function map(context) {
        var rowJson = JSON.parse(context.value);
        log.debug('rowJson', rowJson);

        var recordType = rowJson.recordType;
        var recordId = rowJson.id;
        var salesOrderId = rowJson.values['createdfrom'].value;
        var customerId = rowJson.values['internalid.customer'].value;
        var attempts = rowJson.values['custbody_hf_atmpts_fr_creating_pay_rec'];
        try {
            var objRecord3 = record.transform({
                fromType: recordType,
                fromId: recordId,
                toType: record.Type.CUSTOMER_PAYMENT,
                isDynamic: true,
            });
            log.debug('objRecord3', objRecord3);
            var card = getCustomerCard(customerId);
            if (card.skip) {
              	try {
                    storeError({
                        'recordId': recordId,
                        'err': 'No Default or Machine Payment card available on customer (Not submitting the invoice for payment.) Please review teh customer cards.',
                        'attempts': attempts == '' ? 0 : attempts,
                        'type': recordType
                    });
                } catch (e) {
                    log.debug('e2', e);
                }
                return;
                //throw "NoCreditCard";
            }
            if (card.cardId != '') {
                var cardList = objRecord3.getField({
                    fieldId: 'paymentoption'
                });

                var cardListOptions = cardList.getSelectOptions();

                for (var i = 0; i < cardListOptions.length; i++) {
                    if (cardListOptions[i].value == card.cardId) {
                        // objRecord3.setValue('creditcard', cardListOptions[i].value);
                        // objRecord3.setValue('ccapproved', true);
                        // objRecord3.setValue('creditcardprocessor', 1);
                        objRecord3.setValue('paymentoption', cardListOptions[i].value);
                        objRecord3.setValue('handlingmode', 'PROCESS');
                        objRecord3.setValue('paymentprocessingprofile', 1);
                        break;
                    }
                    log.debug('creditcard', cardListOptions[i].value);
                }
            } else {
                var cardList = objRecord3.getField({
                    fieldId: 'paymentoption'
                });

                var cardListOptions = cardList.getSelectOptions();
				log.debug(objRecord3.getValue('paymentoption'));
				log.debug(objRecord3.getValue('handlingmode'));
				log.debug(objRecord3.getValue('paymentprocessingprofile'));
              	
                if (cardListOptions.length == 0) {
                    return;
                    // throw "NoCreditCard";
                }
            }
            var payment = objRecord3.save({
                ignoreMandatoryFields: true
            });
        } catch (e) {
            log.debug('e', e);
            storeError({
                'recordId': recordId,
                'err': e.message,
                'attempts': attempts == '' ? 0 : attempts,
                'type': recordType
            });
        }
        log.debug('payment', payment);
        try {
            if(payment){
                record.submitFields({
                    "type": recordType,
                    "id": recordId,
                    "values": {
                        "custbody_hf_atmpts_fr_creating_pay_rec": 0
                    }
                });
            }
        } catch (e) {
            log.debug('e2', e);
        }
    }

    function getCustomerCard1(custId) {
        var card = {
            'cardId': '',
            'ccdefault': '',
            'ccexpiredate': '',
            'ccmemo': '',
            'ccname': '',
            'ccnumber': '',
            'ccpanid': '',
            'paymentmethod': '',
            'skip': false
        };
        if (custId) {
            var customerRec = record.load({
                type: 'customer',
                id: custId
            });

            var lineCount = customerRec.getLineCount({
                sublistId: "creditcards"
            });
            log.debug("lineCount", lineCount);
            if (lineCount == 0) {
                card.skip = true;
            }
            var defaultCard = [];
            for (var i = 0; i < lineCount; i++) {
                card.ccmemo = customerRec.getSublistValue({
                    sublistId: "creditcards",
                    fieldId: 'ccmemo',
                    line: i
                });
                card.ccdefault = customerRec.getSublistValue({
                    sublistId: "creditcards",
                    fieldId: 'ccdefault',
                    line: i
                });
                defaultCard.push(card.ccdefault);
                if (card.ccmemo.toLowerCase() != 'machine payment') {
                    continue;
                }
                card.cardId = customerRec.getSublistValue({
                    sublistId: "creditcards",
                    fieldId: 'internalid',
                    line: i
                });
                card.ccexpiredate = customerRec.getSublistValue({
                    sublistId: "creditcards",
                    fieldId: 'ccexpiredate',
                    line: i
                });
                card.ccname = customerRec.getSublistValue({
                    sublistId: "creditcards",
                    fieldId: 'ccname',
                    line: i
                });
                card.ccnumber = customerRec.getSublistValue({
                    sublistId: "creditcards",
                    fieldId: 'ccnumber',
                    line: i
                });
                card.ccpanid = customerRec.getSublistValue({
                    sublistId: "creditcards",
                    fieldId: 'ccpanid',
                    line: i
                });
                card.paymentmethod = customerRec.getSublistValue({
                    sublistId: "creditcards",
                    fieldId: 'paymentmethod',
                    line: i
                });
            }
            if(card.skip == false && defaultCard.indexOf(true) == -1 && card.cardId == ''){
                card.skip = true;
            }
        }
        return card;
    }

    function getCustomerCard(custId) {
        var card = {
            'cardId': '',
            'ccdefault': '',
            'ccexpiredate': '',
            'ccmemo': '',
            'ccname': '',
            'ccnumber': '',
            'ccpanid': '',
            'paymentmethod': '',
            'skip': false
        };
        if (custId) {
            var customerRec = record.load({
                type: 'customer',
                id: custId
            });
    
            var lineCount = customerRec.getLineCount({
                sublistId: "paymentinstruments"
            });
            log.debug("lineCount", lineCount);
            if (lineCount == 0) {
                card.skip = true;
            }
            var defaultCard = [];
            for (var i = 0; i < lineCount; i++) {
                var inactive = customerRec.getSublistValue({
                    sublistId: "paymentinstruments",
                    fieldId: 'isinactive',
                    line: i
                });
              	log.debug("inactive", inactive);
                if(inactive == false || inactive == 'F')
                {
                    card.ccmemo = customerRec.getSublistValue({
                        sublistId: "paymentinstruments",
                        fieldId: 'memo',
                        line: i
                    });
                    card.ccdefault = customerRec.getSublistValue({
                        sublistId: "paymentinstruments",
                        fieldId: 'isdefault',
                        line: i
                    });
                    defaultCard.push(card.ccdefault);
                    if (card.ccmemo.toLowerCase() != 'machine payment') {
                        continue;
                    }
                    card.cardId = customerRec.getSublistValue({
                        sublistId: "paymentinstruments",
                        fieldId: 'id',
                        line: i
                    });
                }
            }
            if(card.skip == false && defaultCard.indexOf(true) == -1 && card.cardId == ''){
                card.skip = true;
            }
        }
      	log.debug("card", card);
        return card;
    }

    function storeError(data) {
        try {
            var dataToSubmit = {
                "custbody_hf_atmpts_fr_creating_pay_rec": (Number(data.attempts) + 1)
            };
            if ((Number(data.attempts) + 1) == 2) {
                var runAutoPayScript = runtime.getCurrentScript().getParameter({ name: 'custscript_run_auto_pay_script' });
                
                dataToSubmit.custbody_hf_run_auto_payment_script = runAutoPayScript;
            }
            record.submitFields({
                "type": data.type,
                "id": data.recordId,
                "values": dataToSubmit
            });
        } catch (e) {
            log.debug('e2', e);
        }

        var FailedInvSearchObj = search.create({
            type: "customrecord_hf_failed_auto_payment",
            filters:
                [
                    ["custrecord_hf_failed_auto_pay_invoice", "is", data.recordId],
                ],
            columns:
                [
                    search.createColumn({
                        name: "internalid",
                        sort: search.Sort.DESC,
                        label: "Internal ID"
                    })
                ]
        });
        var recordId;
        var resultset = FailedInvSearchObj.run();
        var results = resultset.getRange(0, 1);
        for (var i in results) {
            var result = results[i];
            recordId = result.getValue('internalid');
        }
        log.error({
            'title': 'data',
            'details': data
        });
        if (recordId) {
            log.error({
                'title': 'load',
                'details': recordId
            });
            var d = new Date();
            var text = d.toString();
            record.submitFields({
                "type": 'customrecord_hf_failed_auto_payment',
                "id": recordId,
                "values": {
                    "custrecord_hf_failed_auto_pay_comments": 'Date: ' + text + ' - Message: ' + JSON.stringify(data.err)
                }
            });
        } else {
            var failedPaymentGenrationRecord = record.create({
                type: 'customrecord_hf_failed_auto_payment',
                isDynamic: true
            });
            log.error({
                'title': 'create',
                'details': data.recordId
            });
            failedPaymentGenrationRecord.setValue('custrecord_hf_failed_auto_pay_invoice', data.recordId);
          	failedPaymentGenrationRecord.setValue('custrecord_hf_failed_auto_pay_comments', JSON.stringify(data.err));
        	failedPaymentGenrationRecord.save();
        }
    }

    function summarize(context) {
        log.audit({
            title: 'Usage units consumed',
            details: context.usage
        });
        log.audit({
            title: 'Concurrency',
            details: context.concurrency
        });
        log.audit({
            title: 'Number of yields',
            details: context.yields
        });
    }

    // Link each entry point to the appropriate function.
    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
});