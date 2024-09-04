/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
 define(['N/search','N/record', 'N/render', 'N/runtime','N/email','N/ui/serverWidget'],
 /**
* @param{record} record
* @param{render} render
*/
 (search, record, render, runtime, email, serverWidget) => {
     /**
      * Defines the Suitelet script trigger point.
      * @param {Object} scriptContext
      * @param {ServerRequest} scriptContext.request - Incoming request
      * @param {ServerResponse} scriptContext.response - Suitelet response
      * @since 2015.2
      */
     const onRequest = (context) => {
       
             var serverResponse = context.request.parameters;
             var recId       = serverResponse.recId;
             var recType     = serverResponse.recType;
             var tranNo      = serverResponse.tranNo;

             var rec              = record.load({type: recType, id: recId, isDynamic: true });
             
             var customer_id      = rec.getValue({fieldId:'entity'});
             var customer_name    = rec.getText({fieldId:'entity'});

            // ------------ Search Customer Email ---------------------

            var customerSearch = search.create({
                type: "customer",
                filters:
                [ ["internalid","anyof",customer_id] ],
                columns:
                [  search.createColumn({name: "email", label: "Email"}) ] 
            });
            
            var searchResults = customerSearch .run().getRange({ start: 0, end: 1});

            var to_email      = searchResults[0].getValue({name:'email'});

            // ------------ Create the PDF Files -----------------------------------------------------  

             var currentScript = runtime.getCurrentScript();

             if (recType == 'estimate')
                var advPDFintID =   currentScript.getParameter({name: 'custscript_3rp_hf_print_03_quote_advpdf'});
             
            if (recType == 'salesorder')
                var advPDFintID =   currentScript.getParameter({name: 'custscript_3rp_hf_print_03_so_advpdf'});


             var renderer = render.create();
     
             log.debug("advPDFintID", advPDFintID);
             
             renderer.setTemplateByScriptId(advPDFintID);
     
             renderer.addRecord({
                     
                     templateName: 'record',
                     record: record.load({type: recType,id: recId})
                 });

             var xml = renderer.renderAsString();
             var pdfFile = render.xmlToPdf({
                     xmlString: xml
                 });

             pdfFile.name = 'Proforma_Invoice_' + tranNo + '.pdf';
             
            //----------------Send Email  --------------------------------------------------------

            var subject_content = "Hydrafacial - ProForma " + tranNo; 
            var body_content    = "Hello,<br><br>" + "Please see attached ProForma Invoice for your HydraFacial machine. Please use the quote number " + tranNo + " when making payment <br><br>" + "Our bank details for payment are included on the ProForma.<br><br>" + "If you require any other assistance you can also contact us by emailing AR-UK@hydrafacial.com .<br><br>Thanks <br> HydraFacial Finance"

            email.send({

                author: runtime.getCurrentUser().id,
                recipients: to_email,
                subject: subject_content,
                body: body_content,
                attachments: [pdfFile],

                relatedRecords: {
                    entityId:       customer_id,
                    transactionId:  recId

                }

            });


            var form = serverWidget.createForm({title: 'Profoma Email Automation', hideNavBar: false });

            var displaySentResult = form.addField({
                id: 'custpage_3rp_hf_epi_03_display',
                type: serverWidget.FieldType.INLINEHTML, 
                label: 'Message',
                });

            var statement = '<p style="font-size:200%;"> Proforma Email is sent to ' + customer_name  + ' ( '+ to_email + ' ) </p>';

            displaySentResult.defaultValue = statement ;  
            
            
            context.response.writePage(form); 

     }

     return {onRequest}

 });