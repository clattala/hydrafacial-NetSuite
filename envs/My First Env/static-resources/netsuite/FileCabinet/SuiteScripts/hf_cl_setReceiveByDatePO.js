/**
*@NApiVersion 2.x
*@NScriptType ClientScript
*/
define(['N/error'],
    function (error) {
        function lineInit(context) {
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var receiveddate = currentRecord.getValue({ fieldId: "duedate" });
            if (receiveddate && sublistName === 'item') {
                var expdate = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: "expectedreceiptdate"
                });
                currentRecord.setCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'expectedreceiptdate',
                    value: receiveddate
                });
                /*} else {
                    currentRecord.setCurrentSublistValue({
                        sublistId: sublistName,
                        fieldId: 'expectedreceiptdate',
                        value: expdate
                    });
                }*/
                return true;
            }
            return true;
        }
        function validateLine(context) {
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var receiveddate = currentRecord.getValue({ fieldId: "duedate" });
            if (receiveddate && sublistName === 'item') {
                var expdate = currentRecord.getCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: "expectedreceiptdate"
                });
                //var rectime = receiveddate.getTime();
                // var exptime = expdate.getTime();
                // if (receiveddate = expdate) {
                currentRecord.setCurrentSublistValue({
                    sublistId: sublistName,
                    fieldId: 'expectedreceiptdate',
                    value: receiveddate
                });
                return true;
            }
            return true;
        }
        return {
            lineInit: lineInit,
            validateLine: validateLine
        }
    });