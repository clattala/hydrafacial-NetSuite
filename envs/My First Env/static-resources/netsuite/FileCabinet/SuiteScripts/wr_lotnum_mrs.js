/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/runtime', 'N/search', 'N/record', 'N/error', 'N/email', 'N/render', 'N/task'],
    function (runtime, search, record, errorMod, emailMod, renderMod, task) {

        function getInputData() {
            var warranty_registration_search = search.create({
                type: "customrecord_wrm_warrantyreg",
                filters:
                [
                    ["custrecord_hf_serial_string","isempty",""], 
                    "AND", 
                    ["custrecord_wrm_reg_serialnumber","noneof","@NONE@"]
                 ],
                columns:
                [
                   search.createColumn({name: "custrecord_wrm_reg_customer", label: "Customer"}),
                   search.createColumn({name: "custrecord_wrm_reg_registration", label: "Registration No."}),
                   search.createColumn({name: "custrecord_wrm_reg_invoice", label: "Invoice No."}),
                   search.createColumn({name: "custrecord_wrm_reg_item", label: "Item"}),
                   search.createColumn({name: "custrecord_wrm_reg_quantity", label: "Quantity"}),
                   search.createColumn({
                      name: "internalid",
                      join: "CUSTRECORD_WRM_REG_SERIALNUMBER",
                      label: "Internal ID"
                   }),
                   search.createColumn({
                      name: "inventorynumber",
                      join: "CUSTRECORD_WRM_REG_SERIALNUMBER",
                      label: "Number"
                   })
                ]
            });

            let results = warranty_registration_search.run().getRange({ start: 0, end: 1000 });
            let inputDataArray = [];
            for (let result of results) {
                let internalid = result.id;
                let customer = result.getValue({
                    name: 'custrecord_wrm_reg_customer'
                });
                let registration_num = result.getValue({
                    name: 'custrecord_wrm_reg_registration'
                });
                let invoice_num = result.getValue({
                    name: "custrecord_wrm_reg_invoice"
                });
                let custrecord_wrm_reg_item = result.getValue({
                    name: "itemid"
                });
                let serial_id = result.getValue({
                    name: "internalid",
                    join: "CUSTRECORD_WRM_REG_SERIALNUMBER"
                });
                let serial_number = result.getValue({
                    name: "inventorynumber",
                    join: "CUSTRECORD_WRM_REG_SERIALNUMBER"
                });
                let data = {
                    "internalid" : internalid,
                    "customer": customer,
                    "registration_num": registration_num,
                    "invoice_num": invoice_num,
                    "custrecord_wrm_reg_item": custrecord_wrm_reg_item,
                    "serial_id": serial_id,
                    "serial_number": serial_number
                }
                inputDataArray.push(data)
            }

            log.debug("inputDataArray", inputDataArray)
            return inputDataArray
        }

        function reduce(context) {
            // log.debug("context.key", context.key)
            // the list index for inputDataArray

            // log.debug("context.values", context.values)
            // the list of values located in inputDataArray[context.key] i.e. 	["{\"7636481\":{\"id\":\"7636481\",\"docNum\":\"SO1113610\",\"tranType\":\"SalesOrd\"}}"]

            let valueObj = JSON.parse(context.values[0])
            // data used in each iterating version of reduce i.e. 	{"id":"7698581","docNum":"SO1121954","tranType":"SalesOrd"}
            log.debug("valueObj", valueObj)

            let recObj = record.load({
                type: "customrecord_wrm_warrantyreg",
                id: valueObj.internalid,
            });
            recObj.setValue({
                fieldId: "custrecord_hf_serial_string",
                value: valueObj.serial_number
            });            
            recObj.save()
        }

        return {
            getInputData: getInputData,
            reduce: reduce,
        };

    });