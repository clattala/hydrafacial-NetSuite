/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
  /*************************************************************
JIRA  ID      : https://hydrafacial.atlassian.net/browse/NGO-6836
Date          : 05/10/2023
Author        : Pavan Kaleru
Description   : To send a german pdf to the customer when the Item fulfilment is shipped
*************************************************************
 */
define(['N/record', 'N/search', 'N/render', 'N/email', 'N/runtime'],
    function(record, search, render, email, runtime) {

        function sendEmail_afterSubmit(context) {
            try {
                log.debug('start', context.newRecord.id)
                if (context.type != 'delete') {
                    var subsidiary = context.newRecord.getValue('subsidiary')
                    log.debug('subsidiarty', subsidiary)
                    if (subsidiary == '6') {
                        if (context.type == 'create') {

                            var shipstatus = context.newRecord.getValue('shipstatus')
                            if (shipstatus == 'C') {
                                createXMLAndSendEmail(context)
                            }
                        } else {
                            var oldStatus = context.oldRecord.getValue('shipstatus')
                            var newStatus = context.newRecord.getValue('shipstatus')
                            log.debug('oldStatus' + oldStatus, 'new Status ' + newStatus)

                            if (oldStatus != newStatus && newStatus == 'C') {
                                createXMLAndSendEmail(context)
                            }
                        }
                    }

                }

            } catch (error) {
                log.debug('error ', error.message)
            }
        }

        function createXMLAndSendEmail(context) {
            var xmlStr = '' //'<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'
            var fulfillmentrecord = record.load({
                type: record.Type.ITEM_FULFILLMENT,
                id: context.newRecord.id
            });
            var salesOrderNumber = fulfillmentrecord.getValue('createdfrom')
            var customer = fulfillmentrecord.getValue('entity')
            var customerEmail = getCustomerEmail(customer)
            if (customerEmail) {
                var scriptObj = runtime.getCurrentScript()
                var advancePdfTemplate = scriptObj.getParameter({
                    name: 'custscript_hf_advance_pdf'
                });
                var emailTemplate = scriptObj.getParameter({
                    name: 'custscript_hf_de_email_template'
                });
                var renderer = render.create();
                log.debug('renderer is done ')
                renderer.setTemplateById(advancePdfTemplate);
                log.debug('221 set temolate')
                renderer.addRecord({
                    templateName: 'record',
                    record: fulfillmentrecord
                });
                renderer.addRecord({
                    templateName: 'salesorder',
                    record: record.load({
                        type: 'salesorder',
                        id: salesOrderNumber
                    })
                });

                renderer.addRecord({
                    templateName: 'customer',
                    record: record.load({
                        type: 'customer',
                        id: customer
                    })
                });
                log.debug('xmlStr', xmlStr)
                xmlStr += renderer.renderAsString() //.replace(/&(?!(#\\d+|\\w+);)/g, "&amp;$1");
                var pdfFile = render.xmlToPdf({
                    xmlString: xmlStr
                });
                pdfFile.name = fulfillmentrecord.getValue('tranid') + '.pdf'
                log.debug('pdfFile', pdfFile)
                //createXml()

                var mergeResult = render.mergeEmail({
                    templateId: emailTemplate
                });

                email.send({
                    author: runtime.getCurrentUser().id,
                    recipients: customerEmail,
                    subject: mergeResult.subject,
                    body: mergeResult.body,
                    attachments: [pdfFile],

                });
            }
        }

        function getCustomerEmail(customer) {
            try {
                var fieldLookUp = search.lookupFields({
                    type: 'customer',
                    id: customer,
                    columns: ['email']
                });

                return fieldLookUp.email
            } catch (error) {
                log.debug('errror in getCustomerEmail' + error.message, error)
            }

        }

        return {
            afterSubmit: sendEmail_afterSubmit
        }
    });