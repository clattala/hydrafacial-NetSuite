/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @NAuthor Jerome Morden
 */
define(['N/format', 'N/record'],

	function (format, record) {

		/**
		 * Function to be executed after page is initialized.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
		 *
		 * @since 2015.2
		 */
		function pageInit(scriptContext) {
			//			jQuery('#custpage_tab_paymentmethodlnk').hide();
			//jQuery('#custpage_subtab_creditlnk').hide();
			//jQuery('#custpage_tab_paymentmethodlnk').hide();
		}

		/**
		 * Function to be executed when field is changed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
		 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
		 *
		 * @since 2015.2
		 */
		function fieldChanged(scriptContext) {
			var currentRecord = scriptContext.currentRecord;
			var sublistId = scriptContext.sublistId;
			var fieldId = scriptContext.fieldId;
			var lineNum = scriptContext.lineNum;


			if (!lineNum && sublistId)
				lineNum = currentRecord.getCurrentSublistIndex({ sublistId: sublistId });

			if (fieldId.match(/customer|currency|aracct|subsidiary|fromdate|todate/gi)) {
				window.onbeforeunload = null;
				var url = new URL(location.href);
				var params = '?script=' + url.searchParams.get('script') +
					'&deploy=' + url.searchParams.get('deploy');

				(['subsidiary', 'customer', 'currency', 'trandate', 'aracct', 'fromdate', 'todate', 'location', 'department']).forEach(function (id) {
					var value = currentRecord.getValue({ fieldId: 'custpage_' + id });
					if (!value)
						return;

					if (id.match(/date/gi))
						params += '&' + id + '=' + format.format({
							type: format.Type.DATE,
							value: value
						});
					else
						params += '&' + id + '=' + value;
				});

				window.open(url.pathname + params, '_self');
			} else if (fieldId == 'custpage_payment') {
				var paymentAmt = parseFloat(currentRecord.getValue({ fieldId: fieldId })) || 0;
				var appliedVal = parseFloat(jQuery('#applied_val').html().replace(/,/gi, '')) || 0;

				if (paymentAmt)
					fieldChanged.paymententered = 1;
				else
					fieldChanged.paymententered = 0;

				//console.log('fieldChanged.paymententered custpage_payment', fieldChanged.paymententered);
				var autoApply = currentRecord.getValue({ fieldId: 'custpage_autoapply' });
				if (autoApply) {
					autoApplyPayment(currentRecord);
				} else {
					if (!paymentAmt)
						paymentAmt = appliedVal;
				}

				var unappliedVal = (paymentAmt - appliedVal).toFixed(2);

				paymentAmt = paymentAmt.toFixed(2);

				if (!autoApply) {
					jQuery('#total_val').html(addCommas(paymentAmt));
					jQuery('#unapplied_val').html(addCommas(unappliedVal));
				}

				currentRecord.setValue({
					fieldId: fieldId,
					value: paymentAmt,
					ignoreFieldChange: true
				});

			} else if (fieldId.match(/custcol_cd_payment|custcol_dp_payment/gi)) {

				var prefix = fieldId.match(/custcol_cd_payment/gi) ? 'custcol_cd_' : 'custcol_dp_';

				var amount = currentRecord.getSublistValue({
					sublistId: sublistId,
					fieldId: fieldId,
					line: lineNum
				}) || 0;
				var amountRemaining = currentRecord.getSublistValue({
					sublistId: sublistId,
					fieldId: prefix + 'amountremaining',
					line: lineNum
				}) || 0;

				if (amount > amountRemaining)
					amount = amountRemaining;

				//console.log('fieldChanged.paymententered custcol_cd_payment', fieldChanged.paymententered);

				// if (fieldChanged.paymententered) {
				// 	var appliedValue = getTotalAppliedCredits(currentRecord);
				// 	var totalAmount = currentRecord.getValue({ fieldId: 'custpage_payment' });
				// 	var unapplied = (totalAmount - amount) - appliedValue;
				// 	if (amount > unapplied)
				// 		amount = unapplied;
				// }

				// if (amount < 0)
				// 	amount = 0;

				currentRecord.setCurrentSublistValue({
					sublistId: sublistId,
					fieldId: prefix + 'apply',
					value: amount ? true : false,
					ignoreFieldChange: true
				});
				currentRecord.setCurrentSublistValue({
					sublistId: sublistId,
					fieldId: fieldId,
					value: amount ? amount.toFixed(2) : '',
					ignoreFieldChange: true
				});
				currentRecord.commitLine({ sublistId: sublistId });

				summarizeCreditAmount(currentRecord);

			} else if (fieldId.match(/custcol_payment/gi)) {

				var amount = currentRecord.getSublistValue({
					sublistId: sublistId,
					fieldId: fieldId,
					line: lineNum
				}) || 0;

				var amountRemaining = currentRecord.getSublistValue({
					sublistId: sublistId,
					fieldId: 'custcol_amountremaining',
					line: lineNum
				}) || 0;

				if (amount > amountRemaining)
					amount = amountRemaining;

				if (fieldChanged.paymententered) {
					var appliedValue = getTotalApplied(currentRecord) || 0;
					var appliedCredValue = getTotalAppliedCredits(currentRecord) || 0;
					var appliedDepValue = getTotalAppliedDeposits(currentRecord) || 0;
					var totalAmount = currentRecord.getValue({ fieldId: 'custpage_payment' });
					console.log('payment entered appliedValue', appliedValue);
					console.log('payment entered appliedCredValue', appliedCredValue);
					console.log('payment entered totalAmount', totalAmount);
					var unapplied = totalAmount + appliedCredValue + appliedDepValue - appliedValue + amount;
					console.log('payment entered unapplied', unapplied);
					console.log('payment entered amount', amount);
					if (amount > unapplied)
						amount = unapplied;
				}

				if (amount < 0)
					amount = 0;

				currentRecord.setCurrentSublistValue({
					sublistId: sublistId,
					fieldId: 'custcol_apply',
					value: amount ? true : false,
					ignoreFieldChange: true
				});

				currentRecord.setCurrentSublistValue({
					sublistId: sublistId,
					fieldId: fieldId,
					value: amount ? amount.toFixed(2) : '',
					ignoreFieldChange: true
				});
				//console.log('custcol_payment amount', amount);
				currentRecord.commitLine({ sublistId: 'custpage_apply' });

				summarizeAmount(currentRecord);


			} else if (fieldId.match(/custcol_apply/gi)) {
				// console.log('invoices apply');
				var isChecked = currentRecord.getSublistValue({
					sublistId: sublistId,
					fieldId: fieldId,
					line: lineNum
				});
				if (isChecked) {
					var amountRemaining = currentRecord.getSublistValue({
						sublistId: sublistId,
						fieldId: 'custcol_amountremaining',
						line: lineNum
					});

					currentRecord.setCurrentSublistValue({
						sublistId: sublistId,
						fieldId: 'custcol_payment',
						value: parseFloat(amountRemaining)
					});
				} else {
					currentRecord.setCurrentSublistValue({
						sublistId: sublistId,
						fieldId: 'custcol_payment',
						value: ''
					});
				}
			} else if (fieldId.match(/custcol_cd_apply|custcol_dp_apply/gi)) {

				var prefix = fieldId.match(/custcol_cd_apply/gi) ? 'custcol_cd_' : 'custcol_dp_';
				console.log('prefix: ' + prefix + 'amountremaining')
				var isChecked = currentRecord.getSublistValue({
					sublistId: sublistId,
					fieldId: fieldId,
					line: lineNum
				});
				console.log('isChecked', isChecked);

				if (isChecked) {
					var amountRemaining = currentRecord.getSublistValue({
						sublistId: sublistId,
						fieldId: prefix + 'amountremaining',
						line: lineNum
					});

					console.log('amountRemaining ' + amountRemaining);
					currentRecord.setCurrentSublistValue({
						sublistId: sublistId,
						fieldId: prefix + 'payment',
						value: parseFloat(amountRemaining)
					});
				} else {
					currentRecord.setCurrentSublistValue({
						sublistId: sublistId,
						fieldId: prefix + 'payment',
						value: ''
					});
				}


			} else if (fieldId.match(/custpage_autoapply/gi)) {

				if (currentRecord.getValue({ fieldId: fieldId }))
					autoApplyPayment(currentRecord);
			}
		}

		function autoApplyPayment(currentRecord) {
			var paymentAmount = currentRecord.getValue({ fieldId: 'custpage_payment' }) || 0;
			var amount = paymentAmount

			var lineCount = currentRecord.getLineCount({ sublistId: 'custpage_apply' });
			for (var line = 0; line < lineCount; line++) {
				var lineAmount = currentRecord.getSublistValue({
					sublistId: 'custpage_apply',
					fieldId: 'custcol_amountremaining',
					line: line
				});

				lineAmount = lineAmount > amount ? amount : lineAmount;
				amount -= lineAmount;

				currentRecord.selectLine({
					sublistId: 'custpage_apply',
					line: line
				});
				currentRecord.setCurrentSublistValue({
					sublistId: 'custpage_apply',
					fieldId: 'custcol_apply',
					value: lineAmount ? true : false,
					ignoreFieldChange: true
				});
				currentRecord.setCurrentSublistValue({
					sublistId: 'custpage_apply',
					fieldId: 'custcol_payment',
					value: lineAmount ? lineAmount.toFixed(2) : '',
					ignoreFieldChange: true
				});
				currentRecord.commitLine({ sublistId: 'custpage_apply' });
			}

			jQuery('#total_val').html(addCommas(paymentAmount.toFixed(2)));
			jQuery('#applied_val').html(addCommas((paymentAmount - amount).toFixed(2)));
			jQuery('#unapplied_val').html(addCommas(amount.toFixed(2)));

		}

		function summarizeAmount(currentRecord) {
			var totalVal = 0;
			var unappliedVal = 0;
			var appliedVal = getTotalApplied(currentRecord) || 0;
			var appliedCredValue = getTotalAppliedCredits(currentRecord) || 0;
			var appliedDepositValue = getTotalAppliedDeposits(currentRecord) || 0;

			console.log('appliedVal', appliedVal)
			//console.log('fieldChanged.paymententered custcol_payment', fieldChanged.paymententered);

			if (fieldChanged.paymententered) {
				totalVal = currentRecord.getValue({ fieldId: 'custpage_payment' }) || 0;
				totalVal += appliedCredValue;

				totalVal = totalVal || appliedVal;
				totalVal = (totalVal > appliedCredValue) ? (totalVal - appliedCredValue) : 0;
				unappliedVal = (totalVal > appliedVal) ? (totalVal - appliedVal) : 0;

				jQuery('#total_val').html(addCommas(totalVal.toFixed(2)));
				jQuery('#applied_val').html(addCommas(appliedVal.toFixed(2)));
				jQuery('#unapplied_val').html(addCommas(unappliedVal.toFixed(2)));
			} else {

				totalVal = totalVal || appliedVal;
				totalVal = (totalVal > (appliedCredValue + appliedDepositValue)) ? totalVal : (appliedCredValue + appliedDepositValue);
				unappliedVal = (totalVal > appliedVal) ? (totalVal - appliedVal) : 0;

				jQuery('#total_val').html(addCommas(totalVal.toFixed(2)));
				jQuery('#applied_val').html(addCommas(appliedVal.toFixed(2)));
				jQuery('#unapplied_val').html(addCommas(unappliedVal.toFixed(2)));
			}

			if (!fieldChanged.paymententered || fieldChanged.paymententered == undefined)
				currentRecord.setValue({
					fieldId: 'custpage_payment',
					value: ((appliedVal > appliedCredValue) ? (appliedVal - appliedCredValue) : 0.00).toFixed(2),
					ignoreFieldChange: true
				});
		}

		function summarizeCreditAmount(currentRecord) {
			var totalVal = 0;
			var unappliedVal = 0;
			var appliedCredVal = getTotalAppliedCredits(currentRecord) || 0;
			var appliedDepVal = getTotalAppliedDeposits(currentRecord) || 0;
			var appliedInvVal = getTotalApplied(currentRecord) || 0;

			//console.log('fieldChanged.paymententered ' + appliedCredVal, fieldChanged.paymententered
			//+ ',' + appliedInvVal);

			if (fieldChanged.paymententered) {
				totalVal = currentRecord.getValue({ fieldId: 'custpage_payment' }) || 0;
				totalVal = totalVal + appliedCredVal + appliedDepVal;
				unappliedVal = totalVal - appliedInvVal;

				jQuery('#total_val').html(addCommas(totalVal.toFixed(2)));
				jQuery('#applied_val').html(addCommas(appliedInvVal.toFixed(2)));
				jQuery('#unapplied_val').html(addCommas(unappliedVal.toFixed(2)));
			} else {

				totalVal = (appliedInvVal > (appliedCredVal + appliedDepVal)) ? (appliedInvVal) : (appliedCredVal + appliedDepVal);
				unappliedVal = totalVal - appliedInvVal;

				jQuery('#total_val').html(addCommas(totalVal.toFixed(2)));
				jQuery('#applied_val').html(addCommas(appliedInvVal.toFixed(2)));
				jQuery('#unapplied_val').html(addCommas(unappliedVal.toFixed(2)));
			}



			if (!fieldChanged.paymententered || fieldChanged.paymententered == undefined)
				currentRecord.setValue({
					fieldId: 'custpage_payment',
					value: (appliedInvVal > (appliedCredVal + appliedDepVal)) ? (appliedInvVal - (appliedCredVal + appliedDepVal)).toFixed(2) : 0,
					ignoreFieldChange: true
				});
		}

		function getTotalApplied(currentRecord) {
			var appliedVal = 0;
			var lineCount = currentRecord.getLineCount({ sublistId: 'custpage_apply' });
			for (var line = 0; line < lineCount; line++) {
				var lineAmount = currentRecord.getSublistValue({
					sublistId: 'custpage_apply',
					fieldId: 'custcol_payment',
					line: line
				}) || 0;

				//console.log('inv lineAmount', lineAmount);
				appliedVal += lineAmount;
			}
			return appliedVal;
		}

		function getTotalAppliedCredits(currentRecord) {
			var appliedVal = 0;
			var lineCount = currentRecord.getLineCount({ sublistId: 'custpage_apply_credit' });
			for (var line = 0; line < lineCount; line++) {
				var lineAmount = currentRecord.getSublistValue({
					sublistId: 'custpage_apply_credit',
					fieldId: 'custcol_cd_payment',
					line: line
				}) || 0;

				//console.log('lineAmount', lineAmount)

				appliedVal += lineAmount;
			}
			return appliedVal;
		}

		function getTotalAppliedDeposits(currentRecord) {
			var appliedVal = 0;
			var lineCount = currentRecord.getLineCount({ sublistId: 'custpage_apply_deposit' });
			for (var line = 0; line < lineCount; line++) {
				var lineAmount = currentRecord.getSublistValue({
					sublistId: 'custpage_apply_deposit',
					fieldId: 'custcol_dp_payment',
					line: line
				}) || 0;

				//console.log('lineAmount', lineAmount)

				appliedVal += lineAmount;
			}
			return appliedVal;
		}

		function hasChecked() {
			return jQuery('#custpage_apply_form').find('.checkbox_ck').length;
		}

		function addCommas(x) {
			var parts = x.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return parts.join(".");
		}

		/**
		 * Validation function to be executed when field is changed.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @param {string} scriptContext.sublistId - Sublist name
		 * @param {string} scriptContext.fieldId - Field name
		 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
		 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
		 *
		 * @returns {boolean} Return true if field is valid
		 *
		 * @since 2015.2
		 */
		function validateField(scriptContext) {
			var currentRecord = scriptContext.currentRecord;
			var fieldId = scriptContext.fieldId;
			if (hasChecked() && fieldId.match(/customer|currency|aracct|subsidiary/gi)) {
				if (confirm('Data you entered on this page has not been saved and will be lost.\nPress OK to proceed.'))
					return true;
				else
					return false;

			} else if (fieldId.match(/custpage_payment/gi)) {
				if (currentRecord.getValue({ fieldId: fieldId }) < 0) {
					alert('Invalid currency value. Value can not be negative');
					return false;
				}
			} else if (fieldId.match(/custpage_account/gi)) {
				var value = currentRecord.getValue({ fieldId: fieldId });
				var currency = currentRecord.getValue({ fieldId: 'custpage_currency' });

				if (!currency)
					return true;

				if (value) {
					var acctRecord = record.load({
						type: 'account',
						id: value
					});
					var acctCurrency = acctRecord.getValue({ fieldId: 'currency' });

					if (acctCurrency != currency) {
						alert('This account has a different currency.');
						return false;
					}
				}
			}

			return true;
		}

		/**
		 * Validation function to be executed when record is saved.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.currentRecord - Current form record
		 * @returns {boolean} Return true if record is valid
		 *
		 * @since 2015.2
		 */
		function saveRecord(scriptContext) {
			var unappliedVal = parseFloat(jQuery('#unapplied_val').html().replace(/,/gi, '')) || 0;
			if (unappliedVal < 0) {
				alert('You cannot apply more than your total payments.');
				return false;
			}

			if (!jQuery('#custpage_apply_splits').find('.checkbox_ck').length) {
				alert('Please select at least one invoice');
				return false;
			}

			return true;
		}

		function payAll() {
			fieldChanged.paymententered = 0;

			jQuery('#custpage_apply_form').find('.checkbox_ck').click();
			jQuery('#custpage_apply_form').find('.checkbox_unck').click();
		}

		function markAllCredits() {
			jQuery('#custpage_apply_credit_splits').find('.checkbox_unck').click();
		}

		function unmarkAllCredits() {
			jQuery('#custpage_apply_credit_splits').find('.checkbox_ck').click();
		}

		function markAllDeposits() {
			jQuery('#custpage_apply_deposit_splits').find('.checkbox_unck').click();
		}

		function unmarkAllDeposits() {
			jQuery('#custpage_apply_deposit_splits').find('.checkbox_ck').click();
		}



		function autoApply() {
			jQuery('#custpage_autoapply_fs').click()
			jQuery('#custpage_autoapply_fs').click()
		}

		function clear() {
			jQuery('#custpage_apply_form').find('.checkbox_ck').click();
		}

		return {
			pageInit: pageInit,
			fieldChanged: fieldChanged,
			validateField: validateField,
/*			postSourcing: postSourcing,
			sublistChanged: sublistChanged,
			lineInit: lineInit,
			validateLine: validateLine,
			validateInsert: validateInsert,
			validateDelete: validateDelete,
*/			saveRecord: saveRecord,
			payAll: payAll,
			autoApply: autoApply,
			clear: clear,
			markAllCredits: markAllCredits,
			unmarkAllCredits: unmarkAllCredits,
			markAllDeposits: markAllDeposits,
			unmarkAllDeposits: unmarkAllDeposits
		};

	}
);
