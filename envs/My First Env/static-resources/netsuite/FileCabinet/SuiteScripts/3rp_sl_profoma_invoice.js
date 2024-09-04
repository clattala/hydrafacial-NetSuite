/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/render', 'N/file', 'N/record', 'N/runtime'],
    function(render, file, record, runtime) {
        function printProformaPDF(context) {
            var serverResponse = context.request.parameters;
            var recId = serverResponse.recId;
            var recType = serverResponse.recType;
            var tranNo = serverResponse.tranNo;
            var pdfId;
            //log.debug('tranNo', tranNo+', recId-'+recId+', recType-'+recType);

            var currentScript = runtime.getCurrentScript();

            var renderer = render.create();
            if(recType == 'salesorder'){
            	pdfId = 'CUSTTMPL_PROFORMA_INV_EMEA_SO';
            }else if (recType == 'estimate') {
            	pdfId = 'CUSTTMPL_PROFORMA_INV_EMEA_QUOTE';
            	//log.debug('tranNo', tranNo+', recId-'+recId+', recType-'+recType+', pdfId-'+pdfId);
            }
            renderer.setTemplateByScriptId(pdfId);

            renderer.addRecord({
                templateName: 'record',
                record: record.load({
                    type: recType,
                    id: recId
                })
            });
            var xml = renderer.renderAsString();
            var pdfFile = render.xmlToPdf({
                xmlString: xml
            });
            pdfFile.name = 'Proforma_Invoice_' + tranNo + '.pdf';
            context.response.writeFile(pdfFile, true);
        }
        return {
            onRequest: printProformaPDF 
        }
    });