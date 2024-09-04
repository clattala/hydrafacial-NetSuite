/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/ui/message', 'N/search'],
    function (msg, search) {
        function showErrorMessage(msgText) {
            var myMsg = msg.create({
                title: "Cannot Save Record",
                message: msgText,
                type: msg.Type.ERROR
            });

            myMsg.show({
                duration: 10000
            });
        }

        function saveRec(context) {
          	console.log(context.currentRecord.getValue({
                fieldId: 'id'
            }));
          	console.log('text');
            var rec = context.currentRecord;
            var country = rec.getValue({
                fieldId: 'custrecord_hf_csm_bdm_country'
            });
            var zip = rec.getValue({
                fieldId: 'custrecord_hf_csm_bdm_postcode'
            });
          	var id = rec.getValue({
                fieldId: 'id'
            });
          	var filters = [];
            filters.push(["custrecord_hf_csm_bdm_postcode", "is", zip]);
            filters.push("AND");
            filters.push(["custrecord_hf_csm_bdm_country", "anyof", country]);

            if(id != ''){
                filters.push("AND");
                filters.push(["internalid", "noneof", id]);
            }
          	console.log(filters);
            var customrecord_hf_csm_bdm_fieldsSearchObj = search.create({
                type: "customrecord_hf_csm_bdm_fields",
              	filters: filters,
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            var searchResultCount = customrecord_hf_csm_bdm_fieldsSearchObj.runPaged().count;
			console.log(searchResultCount);
            //validate count is greater than 0
            if (searchResultCount >= 1) {
                showErrorMessage("The counrty with post code you have entered already exists.");
                return false;
            }
            return true;
        }

        return {
            saveRecord: saveRec
        }
    });