/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 * Date: 02/13/2024
 * Summary: Updates 'rate' and 'amount' fields  to match 'estimatedrate' and 'estimatedamount'.
 * CHN-429 - Hemang Dave
 */
define(['N/format'],
    function(format) {

        function validateLine(context) {
            try {
                var currentRecord = context.currentRecord;
                var sublistId = context.sublistId;
                if (sublistId == 'item' || sublistId == 'expense') {
                    log.debug('sublistId', sublistId)
                    var vendor = currentRecord.getCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: 'povendor'
                    });
                    log.debug('vendor', vendor)

                    if (!vendor) {
                        alert('Please enter Vendor and add the line ');
                        return false;
                    }

                }

                if (sublistId == 'item') {
                    var quantity = currentRecord.getCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: 'quantity'
                    });
                    log.debug('quantity', quantity)
                    if (quantity == 0 || quantity == '0') {
                        alert('Quantity cannot be zero , Please enter Quantity')
                        return false;
                    }

                    var rate = currentRecord.getCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: 'estimatedrate'
                    });
                    log.debug('rate', rate)
                    if (rate == 0 || rate == '0') {
                        alert('Estimated Rate cannot be zero , Please enter Estimated rate')
                        return false;
                    }

                }
                return true;
            } catch (error) {
                log.debug('Error in validateLine ' + error.message, error)
                alert('Error in validateLine ' + error.message)
            }
        }


        function saveRecord(context) {
            try {
                var currentRecord = context.currentRecord;
                var lineCount = currentRecord.getLineCount({
                    sublistId: 'item'
                });
                //var arr_vendor = [];
                var vendor = ''
                var headerDepartment = currentRecord.getValue('department')
                log.debug('headerDepartment', headerDepartment)

                for (var i = 0; i < lineCount; i++) {
                    var linevendor = currentRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'povendor',
                        line: i
                    });
                    log.debug('linevendor ' + linevendor, ' vendor ' + vendor)
                    if (vendor == '') {
                        vendor = linevendor
                    } else {
                        log.debug('else linevendor ' + linevendor, ' vendor ' + vendor)

                        if (linevendor != vendor) {
                            alert('Please select only one Vendor in all the lines ')
                            return false;
                        }
                    }
                    currentRecord.selectLine({
                        sublistId: 'item',
                        line: i
                    });
                    currentRecord.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'department',
                        value: headerDepartment,

                    });
                    currentRecord.commitLine({
                        sublistId: 'item'
                    });

                }
                return true;
            } catch (error) {
                log.debug('Error in saveRecord ' + error.message, error)
                alert('Error in saveRecord ' + error.message)
            }
        }

        function fieldChanged(context) {
            try {
                var currentRecord = context.currentRecord;
                var sublistId = context.sublistId;
                var fieldId = context.fieldId
                if (fieldId == 'custbody_hf_parent_department') {
                    log.debug('sublistId when fieldID is department', sublistId);

                    //	var departmentId = currentRecord.getValue('department');
                    //var departmentDetails = getDepartmentDetails(departmentId)
					var parentDepartment = currentRecord.getValue('custbody_hf_parent_department')
                    var department = currentRecord.getValue('department')
                   log.debug('parentDepartment' + parentDepartment,  'department ' + department)
					if(!parentDepartment && department){
						alert('Please Enter Correct Department , Parent Departments are not allowed ' ); 
											currentRecord.setValue({
						fieldId: 'department',
						value: '',
						ignoreFieldChange: true
					});
					}
                }
                if (sublistId == 'item' && fieldId == 'item') {

                    var item = currentRecord.getCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: 'item'
                    });
                    if (item) {
                        var originalDuedate = currentRecord.getCurrentSublistValue({
                            sublistId: sublistId,
                            fieldId: 'custcol_hf_original_due_date'
                        });

                        if (!originalDuedate) {

                            log.debug('originalDuedate', originalDuedate)
                            var today = new Date()
                            log.debug('today', today)

                            currentRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_hf_original_due_date',
                                value: today
                            });

                        }

                    }
                }
				//New code added
				if (sublistId === 'item') { // Ensure the change is in the 'item' sublist
				if (context.fieldId === 'estimatedrate') {
					// Get the estimated rate value of the current line
					var estimatedRate = currentRecord.getCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'estimatedrate'
					});

					// Set the rate value of the current line to the estimated rate value
					currentRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'rate',
						value: estimatedRate,
						ignoreFieldChange: true // Prevent triggering additional fieldChanged events
					});
					// Get the estimated amount value of the current line
					var estimatedAmount = currentRecord.getCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'estimatedamount'
					});

					// Set the amount value of the current line to the estimated amount value
					currentRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'amount',
						value: estimatedAmount,
						ignoreFieldChange: true // Prevent triggering additional fieldChanged events
					});
				}
			}// New code ends
            } catch (error) {
                alert('Error in fieldChanged ' + error.message)
            }
        }

        function postSourcing(context) {
            try {
                var currentRecord = context.currentRecord;
                var sublistId = context.sublistId;
                var fieldId = context.fieldId

                if (sublistId == 'item' && fieldId == 'item') {

                    var item = currentRecord.getCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: 'item'
                    });
                    if (item) {
                        var headerDepartment = currentRecord.getValue('department')

                        currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'department',
                            value: headerDepartment
                        });
                        var estimatedRate = currentRecord.getCurrentSublistValue({
                            sublistId: sublistId,
                            fieldId: 'estimatedrate'
                        });
                        log.debug('estimatedRate', estimatedRate)
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: estimatedRate
                        });



                    }
                }
            } catch (error) {
                alert('Error in postSourcing ' + error.message)
            }
        }

        function getDepartmentDetails(departmentId) {
            log.debug(' getDepartmentDetails ');
            var lookupObj = search.lookupFields({
                type: 'department',
                id: departmentId,
                columns: ['parent']
            });
            log.debug('lookupObj', lookupObj)
            if (lookupObj) {
                log.debug('lookup obj is here')
            } else {
                log.debug('not there');
            }
            // console.log(lookupObj);
        }

        return {
            fieldChanged: fieldChanged,
            validateLine: validateLine,
            saveRecord: saveRecord,
            postSourcing: postSourcing
        };
    });