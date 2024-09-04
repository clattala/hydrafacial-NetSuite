/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
var SENDER_ID = '161694';


define(['N/record', 'N/log', 'N/email', 'N/render', 'N/runtime'],
    function (record, log, email, render, runtime) {

        function afterSubmit(context) {
            try {
                if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT || context.type == context.UserEventType.COPY) {
                    var currentRecord = context.newRecord;
                    var cid = currentRecord.id;
                    log.debug('SO cid', cid)
                    var sendEmail = false;
                    var soCustomer = currentRecord.getValue('entity');
                    var sotaxtotal = currentRecord.getValue('taxtotal');
                    var sosubtotal = currentRecord.getValue('subtotal');
                    var soDate = currentRecord.getValue('trandate');
                    var sendEmail_Chekbox = currentRecord.getValue('custbody_hf_send_out_stock_email');
                    var otherrefnum = currentRecord.getValue('otherrefnum');
                    var tranid = currentRecord.getValue('tranid');


                    var numLines = currentRecord.getLineCount({
                        sublistId: 'item'
                    });
                    log.debug('numLines', numLines)

                    if (soCustomer) {
                        var custRecord = record.load({
                            type: record.Type.CUSTOMER,
                            id: soCustomer,
                            isDynamic: true,
                        });
                        var customerEmail = custRecord.getValue('email');
                        var customerName = custRecord.getValue('entityid');

                        if (customerEmail) {
                            if (tranid) {
                                var emailSubject = "Your Order No. " + tranid + " Contains Items Out of Stock";
                            } else {
                                var emailSubject = "Your Order No. " + cid + " Contains Items Out of Stock";

                            }

                            var emailBody = "";
                            emailBody += "<img src='https://6248126-sb2.app.netsuite.com/core/media/media.nl?id=71351&c=6248126_SB2&h=UwM3w8AFUX1WiX5s395SuAu4rWXCP7wnFHr5wMdO36OL-3_3' alt='HydraFacial' width='auto' height='auto'><br>";
                            // emailBody += "<br><br>"
                            emailBody += "<p>Hey <span>" + customerName + "</span></p>"
                            //  emailBody += "<p>Thank you for Shopping at The Hydrafacial Company.</p>"
                            emailBody += "<p>Your order #" + tranid + " contains items that are currently out of stock. Don't worry. We will ship them as soon as they become available and as fast as possible!</p>"
                            emailBody += "<p>Your credit card will not be charged until the item ships. </p><br>"
                            emailBody += "<br>"
                            emailBody += "<p>Out of Stock Summary:</p>"
                            emailBody += "<div>";
                            emailBody += "<table width='100%' style='margin-top:20px;'>";
                            emailBody += "<tr style='font-weight:bold;background-color:black;color:white;'>";

                            emailBody += "<td>";
                            emailBody += "Item";
                            emailBody += "</td>";

                            // emailBody += "<td>";
                            // emailBody += "Qty out of Stock";
                            // emailBody += "</td>";

                            emailBody += "<td>";
                            emailBody += "Qty Ordered";
                            emailBody += "</td>";

                            // emailBody += "<td>";
                            // emailBody += "Brief Description";
                            // emailBody += "</td>";

                            emailBody += "<td>";
                            emailBody += "Rate";
                            emailBody += "</td>";

                            emailBody += "<td>";
                            emailBody += "Amount";
                            emailBody += "</td>";

                            emailBody += "</tr>";

                            if (numLines > 0) {

                                for (var i = 0; i < numLines; i++) {

                                    var item_id = currentRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'item',
                                        line: i
                                    });
                                    var item_display = currentRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'item_display',
                                        line: i
                                    });

                                    var item_quantityavailable = currentRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantityavailable',
                                        line: i
                                    });

                                    var item_quantity = currentRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',
                                        line: i
                                    });
                                    var item_backordered = currentRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantitybackordered',
                                        line: i
                                    });
                                    var item_rate = currentRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'rate',
                                        line: i
                                    });

                                    var item_description = currentRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'description',
                                        line: i
                                    });

                                    var item_amount = currentRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'amount',
                                        line: i
                                    });

                                    var item_net_item_rate = currentRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_net_item_rate',
                                        line: i
                                    });
                                    var item_fulfillable = currentRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'fulfillable',
                                        line: i
                                    });

                                    
                                    /////

                                    var item_quantitycommitted = currentRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantitycommitted',
                                        line: i
                                    });

                                    var item_quantitypickpackship = currentRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantitypickpackship',
                                        line: i
                                    });

                                    var item_quantityfulfilled = currentRecord.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantityfulfilled',
                                        line: i
                                    });


                                    log.debug('item_rate', item_rate)
                                    log.debug('item_fulfillable', item_fulfillable)

                                    // log.debug('item_backordered', item_backordered)
                                    // log.debug('item_quantitycommitted', item_quantitycommitted)
                                    // log.debug('item_quantity', item_quantity)
                                    // log.debug('item_quantityavailable', item_quantityavailable)

                                    if (item_fulfillable== 'T' || item_fulfillable== true) {

                                        if (item_backordered > 0 && (item_quantitycommitted < item_quantity || item_quantitypickpackship < item_quantity || item_quantityfulfilled < item_quantity)) {
                                            log.debug('if run', item_quantity)
                                            sendEmail = true;
                                            emailBody += "<tr>";

                                            emailBody += "<td>";
                                            emailBody += item_display;
                                            emailBody += "</td>";

                                            // emailBody += "<td>";
                                            // emailBody += item_backordered;
                                            // emailBody += "</td>";

                                            emailBody += "<td>";
                                            emailBody += item_quantity;
                                            emailBody += "</td>";

                                            // emailBody += "<td>";
                                            // emailBody += item_description;
                                            // emailBody += "</td>";

                                            emailBody += "<td>";
                                            emailBody += parseFloat(item_rate).toFixed(2);
                                            emailBody += "</td>";

                                            emailBody += "<td>";
                                            emailBody += parseFloat(item_amount).toFixed(2);
                                            emailBody += "</td>";

                                            emailBody += "</tr>";

                                        } else {
                                            if (item_quantityavailable < item_quantity) {
                                                if ((item_quantitycommitted < item_quantity || item_quantitypickpackship < item_quantity || item_quantityfulfilled < item_quantity)) {
                                                    log.debug('else run', item_quantity)

                                                    sendEmail = true;
                                                    emailBody += "<tr>";

                                                    emailBody += "<td>";
                                                    emailBody += item_display;
                                                    emailBody += "</td>";

                                                    // emailBody += "<td>";
                                                    // emailBody += item_quantity - item_quantityavailable;
                                                    // emailBody += "</td>";

                                                    emailBody += "<td>";
                                                    emailBody += item_quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                                    emailBody += "</td>";

                                                    // emailBody += "<td>";
                                                    // emailBody += item_description;
                                                    // emailBody += "</td>";

                                                    emailBody += "<td>";
                                                    emailBody += "$ "+parseFloat(item_rate).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                                    emailBody += "</td>";

                                                    emailBody += "<td>";
                                                    emailBody += "$ "+parseFloat(item_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                                    emailBody += "</td>";

                                                    emailBody += "</tr>";
                                                }
                                            }
                                        }
                                    }
                                }


                                emailBody += "<tr>";

                                // emailBody += "<td>";
                                // emailBody += "";
                                // emailBody += "</td>";

                                // emailBody += "<td>";
                                // emailBody += "";
                                // emailBody += "</td>";

                                emailBody += "<td>";
                                emailBody += "";
                                emailBody += "</td>";

                                // emailBody += "<td>";
                                // emailBody += "";
                                // emailBody += "</td>";

                                // emailBody += "<td>";
                                // emailBody += "Total";
                                // emailBody += "</td>";

                                // emailBody += "<td>";
                                // emailBody += parseFloat(sosubtotal).toFixed(2);
                                // emailBody += "</td>";

                                emailBody += "</tr>";


                                emailBody += "</table>"
                                emailBody += "</div>";

                                emailBody += "<br><br>"

                                emailBody += "Any questions? Call us at 562-597-0102 or email <a href='mailto:orders@hydrafacial.com'>orders@hydrafacial.com</a>. We are here to help. ";
                                emailBody += "<br><br>"

                                emailBody += "Let's Do This Together";
                                emailBody += "<br><br>"
                                emailBody += "HydraFacial";
                                emailBody += "<br><br>"

                                emailBody += "PS : If You have not heard the news yet, our new delivery system is here!";
                                emailBody += "<br><br>"

                                emailBody += "Learn more about Syndeo: <a href='https://hydrafacial.com/syndeo/'>https://hydrafacial.com/syndeo/</a>";


                                // log.debug('emailBody', emailBody)

                                if (sendEmail == true && (sendEmail_Chekbox == 'F' || sendEmail_Chekbox == false)) {
                                    log.debug('email', 'emailsend')
                                    email.send({
                                        author: SENDER_ID ? SENDER_ID : -5,
                                        recipients: customerEmail,
                                        subject: emailSubject,
                                        body: emailBody,
                                        relatedRecords: {
                                            transactionId: cid //record.id
                                        }
                                    });
                                    record.submitFields({
                                        type: record.Type.SALES_ORDER,
                                        id: cid,
                                        values: {
                                            "custbody_hf_send_out_stock_email": 'T'
                                        }
                                    })
                                }
                            }
                        }
                    }

                }
            } catch (e) {
                log.debug({
                    title: "error",
                    details: JSON.stringify(e.message)
                });
            }

        }
        return {
            afterSubmit: afterSubmit
        };
    }
);