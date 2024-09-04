/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @NAuthor Jerome Morden
 */
define(['N/format', 'N/ui/serverWidget', 'N/search', 'N/record', 'N/redirect', 'N/runtime', 'N/url'],

	(format, ui, search, record, redirect, runtime, url) => {

		/**
		 * Definition of the Suitelet script trigger point.
		 *
		 * @param {Object} context
		 * @param {ServerRequest} context.request - Encapsulation of the incoming request
		 * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
		 * @Since 2015.2
		 */
		const onRequest = context => {

			log.debug('Starting script')

			if (context.request.method == 'GET')
				getRequest(context);
			else
				postRequest(context);
		}

		const getRequest = context => {
			var { request, response } = context;
			var params = request.parameters;

			if (params.je) {
				var journalDocNum = search.lookupFields({
					type: search.Type.JOURNAL_ENTRY,
					id: params.je,
					columns: ['tranid']
				}).tranid;
				var journalURL = url.resolveRecord({
					recordType: record.Type.JOURNAL_ENTRY,
					recordId: params.je
				});

				var form = ui.createForm({ title: `Payment successfully generated <a href="${journalURL}" style="color: #255599">Journal #${journalDocNum}</a>.` });
				form.addButton({
					id: 'custpage_btnnewpayment',
					label: 'New Payment',
					functionName: `window.open(location.href.replace(/(&je.*)/gi,''));`
				});
				response.writePage(form);

				return;
			}

			// Add custom fields
			var { form, fields, sublist, credSublist, depSublist } = buildForm(params);
			log.debug('params', params);

			if (params.customer) {
				setSublistValue(fields, sublist, params);
				var creditMemoSearchId = runtime.getCurrentScript().getParameter('custscript_custconspayment_savedsearch_2');
				setCredSublistValue(creditMemoSearchId, credSublist, params, 'custcol_cd_', 'custcred');
				var depositSearchId = runtime.getCurrentScript().getParameter('custscript_custconspayment_savedsearch_3');
				setCredSublistValue(depositSearchId, depSublist, params, 'custcol_dp_', 'custdep');
			}


			context.response.writePage(form);
		}

		const buildForm = params => {
			var script = runtime.getCurrentScript();
			var form = ui.createForm({
				title: 'Consolidated Payment'
			});

			// Add Tab
			form.addTab({
				id: 'custpage_tab_apply',
				label: 'Apply'
			});
			form.addTab({
				id: 'custpage_tab_paymentmethod',
				label: 'Payment Method'
			});

			form.addSubtab({
				id: 'custpage_subtab_invoice',
				label: 'Invoices',
				tab: 'custpage_tab_apply'
			});
			form.addSubtab({
				id: 'custpage_subtab_credit',
				label: 'Credits',
				tab: 'custpage_tab_apply'
			});

			form.addSubtab({
				id: 'custpage_subtab_deposit',
				label: 'Deposits',
				tab: 'custpage_tab_apply'
			});

			// Add field group
			form.addFieldGroup({
				id: 'custpage_fldgrp_main',
				label: 'Primary Information'
			});

			var fields = {};
			([
				//['id', 'label', 'type', 'source', 'container'],
				['subsidiary', 'Subsidiary', ui.FieldType.SELECT, null, 'custpage_fldgrp_main'],
				['customer', 'Customer', ui.FieldType.SELECT, 'customer', 'custpage_fldgrp_main'],
				['cb_consolidatedjedocnum', 'Payment #', ui.FieldType.TEXT, null, 'custpage_fldgrp_main'],
				['aracct', 'A/R Account', ui.FieldType.SELECT, null, 'custpage_fldgrp_main'],
				['account', 'Bank Account', ui.FieldType.SELECT, null, 'custpage_fldgrp_main'],
				['currency', 'Currency', ui.FieldType.SELECT, null, 'custpage_fldgrp_main'],
				['trandate', 'Date', ui.FieldType.DATE, null, 'custpage_fldgrp_main'],
				['department', 'Department', ui.FieldType.SELECT, null, 'custpage_fldgrp_main'],
				['location', 'Location', ui.FieldType.SELECT, null, 'custpage_fldgrp_main'],
				['memo', 'Memo', ui.FieldType.TEXT, null, 'custpage_fldgrp_main'],
				['payment', 'Payment Amount', ui.FieldType.FLOAT, null, 'custpage_tab_apply', 'custpage_fldgrp_main'],
				['autoapply', 'Auto Apply', ui.FieldType.CHECKBOX, null, 'custpage_tab_apply', 'custpage_fldgrp_main'],
				['paymentmethod', 'Payment Method', ui.FieldType.SELECT, 'paymentmethod', 'custpage_tab_paymentmethod'],
				['checknum', 'Check#', ui.FieldType.TEXT, null, 'custpage_tab_paymentmethod'],
				['creditcardnum', 'Credit Card#', ui.FieldType.TEXT, null, 'custpage_tab_paymentmethod'],
				['creditcardprocessor', 'Payment Processing Profile', ui.FieldType.SELECT, 'paymentprocessingprofile', 'custpage_tab_paymentmethod'],
				['creditcard', 'Credit Card Select', ui.FieldType.SELECT, 'creditcard', 'custpage_tab_paymentmethod'],
				['ccsecuritycode', 'CSC', ui.FieldType.TEXT, null, 'custpage_tab_paymentmethod'],
				['ccexpirydate', 'EXPIRES(MM/YYYY)', ui.FieldType.TEXT, null, 'custpage_tab_paymentmethod'],
				['ccname', 'Name ON CARD', ui.FieldType.TEXT, null, 'custpage_tab_paymentmethod'],
				['ccstreet', 'CARD STREET', ui.FieldType.TEXT, null, 'custpage_tab_paymentmethod'],
				['cczipcode', 'CARD ZIP CODE', ui.FieldType.TEXT, null, 'custpage_tab_paymentmethod'],
				['ccapproved', 'CC Approved', ui.FieldType.CHECKBOX, null, 'custpage_tab_paymentmethod'],
				['chargeit', 'Charge Credit Card', ui.FieldType.CHECKBOX, null, 'custpage_tab_paymentmethod'],
				['pnrefrun', 'P/N Ref.', ui.FieldType.TEXT, null, 'custpage_tab_paymentmethod'],
				['authcode', 'Auth. Code', ui.FieldType.TEXT, null, 'custpage_tab_paymentmethod'],
				['ccavstreetmatch', 'AVS Street Match', ui.FieldType.SELECT, null, 'custpage_tab_paymentmethod'],
				['ccavszipmatch', 'AVS Zip Match', ui.FieldType.SELECT, null, 'custpage_tab_paymentmethod'],
				['ccsecuritycodematch', 'CSC Match', ui.FieldType.SELECT, null, 'custpage_tab_paymentmethod'],
				['isrecurringpayment', 'Recurring Payment', ui.FieldType.CHECKBOX, null, 'custpage_tab_paymentmethod'],
				['ccprocessaspurchasecard', 'Send line-level Data', ui.FieldType.CHECKBOX, null, 'custpage_tab_paymentmethod'],
				['for_elec_bank_pay', 'FOR ELECTRONIC BANK PAYMENT (DIRECT DEBIT)', ui.FieldType.CHECKBOX, null, 'custpage_tab_paymentmethod'],
				//				['tranid', 'Check #', ui.FieldType.TEXT, null, 'custpage_fldgrp_main'],
				['fromdate', 'Date From', ui.FieldType.DATE, null, 'custpage_subtab_invoice'],
				['todate', 'Date To', ui.FieldType.DATE, null, 'custpage_subtab_invoice'],
				//['fromdate_cd', 'Date From', ui.FieldType.DATE, null, 'custpage_subtab_credit'],
				//['todate_cd', 'Date To', ui.FieldType.DATE, null, 'custpage_subtab_credit'],
				//['dummy', ' ', ui.FieldType.TEXT, null, 'custpage_subtab_credit'],
				//['dummy2', ' ', ui.FieldType.TEXT, null, 'custpage_tab_paymentmethod'],
				['summary', ' ', ui.FieldType.RICHTEXT, null, 'custpage_fldgrp_main']
			]).forEach(fld => {
				fields[fld[0]] = form.addField({
					id: `custpage_${fld[0]}`,
					label: fld[1],
					type: fld[2],
					source: fld[3],
					container: fld[4]
				});
			});

			// Hidden fields
			var hiddenFields = [];
			// Required fields
			var reqFields = ['subsidiary', 'customer', 'aracct', 'account', 'trandate', 'payment', 'cb_consolidatedjedocnum'];
			if (runtime.isFeatureInEffect({ feature: 'MULTICURRENCY' }))
				reqFields.push('currency');
			else
				hiddenFields.push('currency');

			if (!script.getParameter('custscript_custconspayment_hasdepartment'))
				hiddenFields.push('department');

			if (!script.getParameter('custscript_custconspayment_haslocation'))
				hiddenFields.push('location');

			if (script.getParameter('custscript_custconspayment_reqdepartment'))
				reqFields.push('department');

			if (script.getParameter('custscript_custconspayment_reqlocation'))
				reqFields.push('location');

			// Set required fields
			reqFields.forEach(id => {
				fields[id].isMandatory = true;
			});

			// Set field display type to hidden
			hiddenFields.forEach(id => {
				fields[id].updateDisplayType({
					displayType: ui.FieldDisplayType.HIDDEN
				});
			});

			// Set field display type to inline
			fields.summary.updateDisplayType({
				displayType: ui.FieldDisplayType.INLINE
			});

			// Set payment amount field size
			fields.payment.updateDisplaySize({
				width: 20,
				height: 1
			});

			// Building summary html;
			fields.trandate.updateBreakType({
				breakType: ui.FieldBreakType.STARTCOL
			});
			fields.summary.updateBreakType({
				breakType: ui.FieldBreakType.STARTCOL
			});
			fields.summary.defaultValue = summaryHTML();

			// Put auto apply beside the amount
			fields.payment.updateLayoutType({
				layoutType: ui.FieldLayoutType.STARTROW
			});
			fields.autoapply.updateLayoutType({
				layoutType: ui.FieldLayoutType.ENDROW
			});

			// Put To Date beside the From Date
			fields.fromdate.updateLayoutType({
				layoutType: ui.FieldLayoutType.STARTROW
			});
			fields.todate.updateLayoutType({
				layoutType: ui.FieldLayoutType.ENDROW
			});

			// Setting from date and to date defaultValue
			fields.fromdate.defaultValue = params.fromdate || '';
			fields.todate.defaultValue = params.todate || '';

			// Setting date field default value
			fields.trandate.defaultValue = params.trandate || format.format({ type: format.Type.DATE, value: new Date() });

			// Set payment default value
			fields.payment.defaultValue = '0.00';

			// SETTING SELECT FIELD's OPTION
			var customerRecord = '';
			try {
				if (params.customer)
					customerRecord = record.load({
						type: 'customer',
						id: params.customer
					});
			} catch (e) {
				params.customer = '';
			}
			if (customerRecord) {
				// Load customer record

				// Set customer value
				fields.customer.defaultValue = params.customer;

				// Set subsidiary options
				var subs = [];
				search.create({
					type: search.Type.CUSTOMER_SUBSIDIARY_RELATIONSHIP,
					filters: [['entity', 'anyof', params.customer], 'AND', ['subsidiary.isinactive', 'is', 'F']],
					columns: [{ name: 'subsidiary', sort: search.Sort.ASC }]
				}).run().getRange(0, 1000).forEach(res => {
					var text = res.getText(res.columns[0]);
					var value = res.getValue(res.columns[0]);

					text = text.split(' : ');
					text = text[text.length - 1];

					fields.subsidiary.addSelectOption({ text, value });

					subs.push(value);
				});
				if (!subs.length)
					fields.subsidiary.addSelectOption({
						value: customerRecord.getValue({ fieldId: 'subsidiary' }),
						text: customerRecord.getText({ fieldId: 'subsidiary' })
					});

				// Set subsidiary value
				params.subsidiary = subs.indexOf(params.subsidiary) > -1 ? params.subsidiary :
					customerRecord.getValue({ fieldId: 'subsidiary' });
				params.subsidiary = subs.indexOf(params.subsidiary) > -1 ? params.subsidiary : subs[0];
				fields.subsidiary.defaultValue = params.subsidiary;

				// Set department options
				if (hiddenFields.indexOf('department') < 0) {
					var department = [];
					fields.department.addSelectOption({ text: '', value: '' });
					search.create({
						type: 'department',
						filters: [['subsidiary', 'anyof', params.subsidiary], 'AND', ['isinactive', 'is', 'F']],
						columns: [{ name: 'namenohierarchy', sort: search.Sort.ASC }]
					}).run().getRange(0, 1000).forEach(res => {
						var value = res.id;
						var text = res.getValue(res.columns[0]);

						fields.department.addSelectOption({ text, value });
						department.push(value);
					});
					params.department = department.indexOf(params.department) > -1 ? params.department : '';
					// Set department value
					fields.department.defaultValue = params.department;
					// --->>
				}


				// Set location options
				if (hiddenFields.indexOf('location') < 0) {
					var location = [];
					fields.location.addSelectOption({ text: '', value: '' });
					search.create({
						type: 'location',
						filters: [['subsidiary', 'anyof', params.subsidiary], 'AND', ['isinactive', 'is', 'F']],
						columns: [{ name: 'namenohierarchy', sort: search.Sort.ASC }]
					}).run().getRange(0, 1000).forEach(res => {
						var value = res.id;
						var text = res.getValue(res.columns[0]);

						fields.location.addSelectOption({ text, value });
						location.push(value);
					});
					params.location = location.indexOf(params.location) > -1 ? params.location : '';

					// Set department value
					fields.location.defaultValue = params.location;
				}
				// --->>

				// Add currency option
				if (hiddenFields.indexOf('currency') < 0) {
					var currencies = [];
					for (var line = 0; line < customerRecord.getLineCount({ sublistId: 'currency' }); line++) {
						fields.currency.addSelectOption({
							value: customerRecord.getSublistValue({ sublistId: 'currency', fieldId: 'currency', line }),
							text: customerRecord.getSublistText({ sublistId: 'currency', fieldId: 'currency', line })
						});

						currencies.push(customerRecord.getSublistValue({ sublistId: 'currency', fieldId: 'currency', line }));
					}
					if (!currencies.length && customerRecord.getValue({ fieldId: 'currency' }))
						fields.currency.addSelectOption({
							value: customerRecord.getValue({ fieldId: 'currency' }),
							text: customerRecord.getText({ fieldId: 'currency' })
						});
					// Set currency value
					params.currency = currencies.indexOf(params.currency) > -1 ? params.currency :
						customerRecord.getValue({ fieldId: 'currency' });
					params.currency = currencies.indexOf(params.currency) > -1 ? params.currency : currencies[0];
					fields.currency.defaultValue = params.currency;
				}

				// Add accounts field option
				fields.account.addSelectOption({ text: '', value: '' });
				getAllSSResult(search.create({
					type: search.Type.ACCOUNT,
					filters: [
						['type', 'anyof', ['Bank']], 'AND',
						['subsidiary', 'anyof', params.subsidiary], 'AND',
						['issummary', 'is', 'F']
					],
					columns: [
						{ name: 'displayname' },
						{ name: 'name', sort: search.Sort.ASC }
					]
				}).run()).forEach(res => {
					fields['account'].addSelectOption({
						value: res.id,
						text: res.getValue(res.columns[0])
					});
				});

				log.debug('params.customer', params.customer);

				// Add payment method details
				var customerSearchObj = search.create({
					type: "customer",
					filters:
						[
							["internalid", "anyof", params.customer]
						],
					columns:
						[
							search.createColumn({ name: "ccdefault", label: "Default Credit Card" }),
							search.createColumn({ name: "ccnumber", label: "Credit Card Number" }),
							search.createColumn({ name: "prefccprocessor", label: "Credit Card Processor" }),
							search.createColumn({ name: "ccholdername", label: "Credit Cardholder Name" }),
							search.createColumn({ name: "cctype", label: "Credit Card Type" }),
							search.createColumn({ name: "ccinternalid", label: "Credit Card Internal ID" }),
							search.createColumn({ name: "ccexpdate", label: "CC Expire Date" }),
						]
				});
				var searchResultCount = customerSearchObj.runPaged().count;
				log.debug("customerSearchObj result count", searchResultCount);
				customerSearchObj.run().each(function (result) {
					log.debug('result', result);
					fields.paymentmethod.defaultValue = result.getValue('cctype');
					fields.creditcardnum.defaultValue = result.getValue('ccnumber');
					fields.ccexpirydate.defaultValue = result.getValue('ccexpdate');
					fields.ccname.defaultValue = result.getValue('ccholdername');
					fields.creditcard.defaultValue = result.getValue('ccinternalid');
					return true;
				});

			}


			// Add sublist
			var sublist = form.addSublist({
				id: 'custpage_apply',
				label: 'Invoices',
				type: ui.SublistType.LIST,
				tab: 'custpage_subtab_invoice'
			});

			([
				// [id, label, functionName]
				['payall', 'Pay All', 'payAll();'],
				['autoapply', 'Auto Apply', 'autoApply();'],
				['clear', 'Clear', 'clear();']
			]).forEach(btn => {
				sublist.addButton({
					id: `custpage_btn${btn[0]}`,
					label: btn[1],
					functionName: btn[2]
				});
			});

			var sublistFields = {};
			([
				//['id', 'label', 'type', 'source'],
				['internalid', 'Internal ID', ui.FieldType.TEXT, null],
				['customer', 'Customer ID', ui.FieldType.TEXT, null],
				['apply', 'Apply', ui.FieldType.CHECKBOX, null],
				['trandate', 'Date', ui.FieldType.DATE, null],
				['type', 'Type', ui.FieldType.TEXT, null],
				['tranid', 'Ref No.', ui.FieldType.TEXT, null],
				['amount', 'Orig. Amt.', ui.FieldType.FLOAT, null],
				['amountremaining', 'Amt. Due', ui.FieldType.FLOAT, null],
				['currency', 'Currency', ui.FieldType.SELECT, 'currency'],
				['entity', 'Customer', ui.FieldType.TEXT, null],
				['discdate', 'Disc. Date', ui.FieldType.DATE, null],
				['discavail', 'Disc. Avail', ui.FieldType.FLOAT, null],
				['disctaken', 'Disc. Taken', ui.FieldType.FLOAT, null],
				['payment', 'Payment', ui.FieldType.FLOAT, null],
			]).forEach(fld => {
				sublistFields[fld[0]] = sublist.addField({
					id: `custcol_${fld[0]}`,
					label: fld[1],
					type: fld[2],
					source: fld[3]
				});
			});

			// Set columns display type
			for (var id in sublistFields) {
				sublistFields[id].updateDisplayType({
					displayType: ui.FieldDisplayType[
						id.match(/internalid|customer/gi) ? 'HIDDEN' :
							id.match(/apply|payment/gi) ? 'ENTRY' :
								!runtime.isFeatureInEffect({ feature: 'MULTICURRENCY' }) && id == 'currency' ? 'HIDDEN' :
									id.match(/disctaken/gi) ? 'DISABLED' : 'INLINE'
					]
				});

				// Make entry fields wider
				if (id.match(/payment|disctaken/gi)) {
					sublistFields[id].updateDisplaySize({
						width: 40,
						height: 1
					});
				}
			}

			//Add credits sublist
			var credSublist = form.addSublist({
				id: 'custpage_apply_credit',
				label: 'Credits',
				type: ui.SublistType.LIST,
				tab: 'custpage_subtab_credit'
			});

			([
				// [id, label, functionName]
				['markall', 'Mark All', 'markAllCredits();'],
				['unmarkall', 'Unmark All', 'unmarkAllCredits();']
			]).forEach(btn => {
				credSublist.addButton({
					id: `custpage_btn${btn[0]}`,
					label: btn[1],
					functionName: btn[2]
				});
			});

			var credSublistFields = {};
			([
				//['id', 'label', 'type', 'source'],
				['internalid', 'Internal ID', ui.FieldType.TEXT, null],
				['customer', 'Customer ID', ui.FieldType.TEXT, null],
				['apply', 'Apply', ui.FieldType.CHECKBOX, null],
				['trandate', 'Date', ui.FieldType.DATE, null],
				['type', 'Type', ui.FieldType.TEXT, null],
				['tranid', 'Ref No.', ui.FieldType.TEXT, null],
				['amount', 'Orig. Amt.', ui.FieldType.FLOAT, null],
				['amountremaining', 'Amt. Remaining', ui.FieldType.FLOAT, null],
				['currency', 'Currency', ui.FieldType.SELECT, 'currency'],
				['entity', 'Customer', ui.FieldType.TEXT, null],
				['payment', 'Credit', ui.FieldType.FLOAT, null],
			]).forEach(fld => {
				credSublistFields[fld[0]] = credSublist.addField({
					id: `custcol_cd_${fld[0]}`,
					label: fld[1],
					type: fld[2],
					source: fld[3]
				});
			});

			for (var id in credSublistFields) {
				credSublistFields[id].updateDisplayType({
					displayType: ui.FieldDisplayType[
						id.match(/internalid|customer/gi) ? 'HIDDEN' :
							id.match(/apply|payment/gi) ? 'ENTRY' :
								!runtime.isFeatureInEffect({ feature: 'MULTICURRENCY' }) && id == 'currency' ? 'HIDDEN' :
									id.match(/disctaken/gi) ? 'DISABLED' : 'INLINE'
					]
				});

				// Make entry fields wider
				if (id.match(/payment/gi)) {
					credSublistFields[id].updateDisplaySize({
						width: 40,
						height: 1
					});
				}
			}



			//Add deposits sublist
			var depSublist = form.addSublist({
				id: 'custpage_apply_deposit',
				label: 'Deposits',
				type: ui.SublistType.LIST,
				tab: 'custpage_subtab_deposit'
			});

			([
				// [id, label, functionName]
				['markall', 'Mark All', 'markAllDeposits();'],
				['unmarkall', 'Unmark All', 'unmarkAllDeposits();']
			]).forEach(btn => {
				depSublist.addButton({
					id: `custpage_btn_dp_${btn[0]}`,
					label: btn[1],
					functionName: btn[2]
				});
			});

			var depSublistFields = {};
			([
				//['id', 'label', 'type', 'source'],
				['internalid', 'Internal ID', ui.FieldType.TEXT, null],
				['customer', 'Customer ID', ui.FieldType.TEXT, null],
				['apply', 'Apply', ui.FieldType.CHECKBOX, null],
				['trandate', 'Date', ui.FieldType.DATE, null],
				['type', 'Type', ui.FieldType.TEXT, null],
				['tranid', 'Ref No.', ui.FieldType.TEXT, null],
				['amount', 'Orig. Amt.', ui.FieldType.FLOAT, null],
				['amountremaining', 'Amt. Remaining', ui.FieldType.FLOAT, null],
				['currency', 'Currency', ui.FieldType.SELECT, 'currency'],
				['entity', 'Customer', ui.FieldType.TEXT, null],
				['payment', 'Payment', ui.FieldType.FLOAT, null],
			]).forEach(fld => {
				depSublistFields[fld[0]] = depSublist.addField({
					id: `custcol_dp_${fld[0]}`,
					label: fld[1],
					type: fld[2],
					source: fld[3]
				});
			});

			for (var id in depSublistFields) {
				depSublistFields[id].updateDisplayType({
					displayType: ui.FieldDisplayType[
						id.match(/internalid|customer/gi) ? 'HIDDEN' :
							id.match(/apply|payment/gi) ? 'ENTRY' :
								!runtime.isFeatureInEffect({ feature: 'MULTICURRENCY' }) && id == 'currency' ? 'HIDDEN' :
									id.match(/disctaken/gi) ? 'DISABLED' : 'INLINE'
					]
				});

				// Make entry fields wider
				if (id.match(/payment/gi)) {
					depSublistFields[id].updateDisplaySize({
						width: 40,
						height: 1
					});
				}
			}

			form.addSubmitButton();
			form.addButton({
				id: 'custpage_btn_cancel',
				label: 'Cancel',
				functionName: ''
			});

			form.clientScriptModulePath = './se_cs_customConsolidatedPayment';

			return {
				form,
				fields,
				sublist,
				credSublist,
				depSublist
			};
		}

		const setSublistValue = (fields, sublist, params) => {
			var script = runtime.getCurrentScript();
			var invoiceSearchId = script.getParameter('custscript_custconspayment_savedsearch');

			var invoiceSearch = search.load({ id: invoiceSearchId });
			var filters = invoiceSearch.filterExpression;
			filters.push(
				'AND', [
				['customersubof', 'anyof', params.customer], 'OR',
				['customer.internalid', 'anyof', params.customer]
			]
			);
			if (params.subsidiary)
				filters.push('AND', ['subsidiary', 'anyof', params.subsidiary]);
			if (params.currency)
				filters.push('AND', ['currency', 'anyof', params.currency]);

			if (params.fromdate && params.todate) {
				filters.push('AND', ['trandate', 'within', [params.fromdate, params.todate]]);
			} else if (params.fromdate) {
				filters.push('AND', ['trandate', 'onorafter', params.fromdate]);
			} else if (params.todate) {
				filters.push('AND', ['trandate', 'onorbefore', params.todate]);
			}

			invoiceSearch.filterExpression = filters;

			// Get default A/R account and set field options
			fields.aracct.addSelectOption({ text: '', value: '' });

			var arAcctSearch = search.load({ id: invoiceSearchId });
			arAcctSearch.filterExpression = filters;
			arAcctSearch.columns = [{ name: 'account', summary: search.Summary.GROUP, sort: search.Sort.ASC }];

			var aracct = [];
			arAcctSearch.run().getRange(0, 1000).forEach((res, line) => {
				if (!params.aracct)
					params.aracct = res.getValue(res.columns[0]);

				aracct.push(res.getValue(res.columns[0]));
				fields['aracct'].addSelectOption({
					value: res.getValue(res.columns[0]),
					text: res.getText(res.columns[0])
				});
			});
			params.aracct = aracct.indexOf(params.aracct) < 0 ? aracct[0] : params.aracct;
			// -->>>

			if (params.aracct) {
				filters.push('AND', ['account', 'anyof', params.aracct]);
				invoiceSearch.filterExpression = filters;
			}
			//log.debug('filters', filters);
			invoiceSearch.run().getRange(0, 1000).forEach((res, line) => {
				res.columns.forEach(col => {
					var value = col.name.match(/type/gi) ?
						`<a id="apply_displayval" class="dottedlink" href="/app/accounting/transactions/custinvc.nl?id=${res.id}" onclick="setWindowChanged(window, false);">${res.getText(col)}</a>` :
						col.name.match(/entity/gi) ?
							res.getText(col) : res.getValue(col);

					if (col.name.match(/entity/gi)) {
						var number = value.split(' ')[0];
						value = value.replace(number, '').trim();
						value = number + ' ' + value.split(' : ')[value.split(' : ').length - 1];
					}

					sublist.setSublistValue({
						id: `custcol_${col.join || col.name}`,
						value,
						line
					});
				});
			});

			fields.aracct.defaultValue = params.aracct;
		}

		function getDepostAmountApplied(entity) {

			var invoiceSearchObj = search.create({
				type: "invoice",
				filters:
					[
						["type", "anyof", "CustInvc"],
						"AND",
						["mainline", "is", "T"],
						"AND",
						["applyingtransaction.type", "anyof", "DepAppl"],
						"AND",
						["name", "anyof", entity]
					],
				columns:
					[
						search.createColumn({ name: "applyingtransaction", label: "Applying Transaction" }),
						search.createColumn({
							name: "amount",
							join: "applyingTransaction",
							label: "Amount"
						})
					]
			});
			//var searchResultCount = invoiceSearchObj.runPaged().count;
			//log.debug("deposit application result count", searchResultCount);
			var amountApplied = 0;
			invoiceSearchObj.run().each(function (result) {
				amountApplied += result.getValue('amount')
				return true;
			});

			return amountApplied;
		}

		function loadSearchResults(searchId, params) {

			var creditMemoSearch = search.load({ id: searchId });

			var filters = creditMemoSearch.filterExpression;
			filters.push(
				'AND', [
				['customersubof', 'anyof', params.customer], 'OR',
				['customer.internalid', 'anyof', params.customer]
			]
			);
			if (params.subsidiary)
				filters.push('AND', ['subsidiary', 'anyof', params.subsidiary]);
			if (params.currency)
				filters.push('AND', ['currency', 'anyof', params.currency]);

			if (params.fromdate && params.todate) {
				filters.push('AND', ['trandate', 'within', [params.fromdate, params.todate]]);
			} else if (params.fromdate) {
				filters.push('AND', ['trandate', 'onorafter', params.fromdate]);
			} else if (params.todate) {
				filters.push('AND', ['trandate', 'onorbefore', params.todate]);
			}

			creditMemoSearch.filterExpression = filters;

			return creditMemoSearch;
		}

		const setCredSublistValue = (searchId, sublist, params, prefix, hyperlinktype) => {

			var creditMemoSearch = loadSearchResults(searchId, params);

			creditMemoSearch.run().getRange(0, 1000).forEach((res, line) => {
				var amountApplied = 0.00;
				res.columns.forEach(col => {

					var value = col.name.match(/type/gi) ?
						`<a id="apply_displayval" class="dottedlink" href="/app/accounting/transactions/${hyperlinktype}.nl?id=${res.id}" onclick="setWindowChanged(window, false);">${res.getText(col)}</a>` :
						col.name.match(/entity/gi) ?
							res.getText(col) : res.getValue(col);

					if (col.name.match(/entity/gi)) {
						var number = value.split(' ')[0];
						value = value.replace(number, '').trim();
						value = number + ' ' + value.split(' : ')[value.split(' : ').length - 1];
						amountApplied = getDepostAmountApplied(params.customer);
						log.debug('customer deposit amountApplied', amountApplied);
					}

					//log.debug('sublistValue', `${prefix}${col.join || col.name}`)

					if (value) {
						sublist.setSublistValue({
							id: `${prefix}${col.join || col.name}`,
							value,
							line
						});
					}

					if (`${prefix}${col.join || col.name}` == 'custcol_dp_amount') {
						sublist.setSublistValue({
							id: 'custcol_dp_amountremaining',
							value: parseFloat(value) - parseFloat(amountApplied),
							line: line
						});
					}

				});
			});
		}

		const summaryHTML = () => {
			return `<span class="bgmd totallingbg" style="display:inline-block; position:relative;left: -20px; padding: 10px 25px; margin-bottom:5px;"> <img class="totallingTopLeft" src="/images/nav/ns_x.gif" alt=""> <img class="totallingTopRight" src="/images/nav/ns_x.gif" alt=""> <img class="totallingBottomLeft" src="/images/nav/ns_x.gif" alt=""> <img class="totallingBottomRight" src="/images/nav/ns_x.gif" alt=""> <table class="totallingtable" cellspacing="0" cellpadding="0px" border="0px"> <caption style="display: none">Summary</caption> <tbody><tr> <td> <div class="uir-field-wrapper" data-field-type="currency"><span id="total_fs_lbl_uir_label" class="smalltextnolink uir-label "><span id="total_fs_lbl" class="smalltextnolink" style=""> <a>To Apply</a> </span></span><span class="uir-field inputreadonly"> <span id="total_fs" class="inputtotalling"><span id="total_val" class="inputtotalling" datatype="currency">0.00</span></span><input name="total" id="total" type="hidden" onchange="nlapiFieldChanged(null,'total');" value="0.00" datatype="currency"> </span> </div> </td> <td></td></tr> <tr> <td> <div class="uir-field-wrapper" data-field-type="currency"><span id="applied_fs_lbl_uir_label" class="smalltextnolink uir-label "><span id="applied_fs_lbl" class="smalltextnolink" style=""> <a>Applied</a> </span></span><span class="uir-field inputreadonly"> <span id="applied_fs" class="inputtotalling"><span id="applied_val" class="inputtotalling" datatype="currency">0.00</span></span><input name="applied" id="applied" type="hidden" value="0.00" datatype="currency"> </span> </div> </td> <td></td></tr> <tr><td colspan="3" class="uir-totallingtable-seperator"><div style="border-bottom: 1px solid #000000; width: 100%; font-size: 0px;"></div></td></tr> <tr> <td> <div class="uir-field-wrapper" data-field-type="currency"><span id="unapplied_fs_lbl_uir_label" class="smalltextnolink uir-label "><span id="unapplied_fs_lbl" class="smalltextnolink" style=""> <a>Unapplied</a> </span></span><span class="uir-field inputreadonly"> <span id="unapplied_fs" class="inputtotalling"><span id="unapplied_val" class="inputtotalling" datatype="currency">0.00</span></span><input name="unapplied" id="unapplied" type="hidden" value="0.00" datatype="currency"> </span> </div> </td> <td></td></tr> </tbody></table> </span>`;
		}

		const postRequest = context => {
			var { request, response } = context;
			var params = request.parameters;

			var journalRecord = record.create({
				type: record.Type.JOURNAL_ENTRY,
				isDynamic: true
			});

			params.custpage_trandate = format.parse({ type: format.Type.DATE, value: params.custpage_trandate });

			// Set header field values
			(['subsidiary', 'currency', 'trandate', 'memo', 'custbody_consolidatedjedocnum']).forEach(fieldId => {
				if (params[`custpage_${fieldId.replace(/(custbody_)/gi, 'cb_')}`])
					journalRecord.setValue({
						fieldId, value: params[`custpage_${fieldId.replace(/(custbody_)/gi, 'cb_')}`]
					});
			});

			journalRecord.setValue({
				fieldId: 'custbody_consolidated_amount',
				value: params.custpage_payment
			});
			journalRecord.setValue({
				fieldId: 'custbody_consolidatedje',
				value: true
			});
			journalRecord.setValue({
				fieldId: 'approvalstatus',
				value: 2
			});
			// -->>>

			var creditAccount = params.custpage_aracct;
			var debitAccount = params.custpage_account;

			var lines = {};
			var group = 'custpage_apply';
			var lineCount = request.getLineCount({ group });

			var sublistId = 'line';

			var journalLines = {};

			for (var line = 0; line < lineCount; line++) {
				var isApplied = request.getSublistValue({ group, name: 'custcol_apply', line });

				if (isApplied == 'F')
					continue;

				var invoice = request.getSublistValue({ group, name: 'custcol_internalid', line });
				var amount = parseFloat(request.getSublistValue({ group, name: 'custcol_payment', line })) || 0;
				var entity = request.getSublistValue({ group, name: 'custcol_customer', line });
				var docNum = request.getSublistValue({ group, name: 'custcol_tranid', line });

				lines[invoice] = { amount };

				if (!journalLines[entity])
					journalLines[entity] = {
						amount: 0,
						tranids: []
					};

				journalLines[entity].amount += amount;
				journalLines[entity].tranids.push(docNum);
			}

			var credLines = {}
			var credGroup = 'custpage_apply_credit';
			var credLineCount = request.getLineCount({ group: credGroup });


			for (var lineCred = 0; lineCred < credLineCount; lineCred++) {
				var isApplied = request.getSublistValue({ group: 'custpage_apply_credit', name: 'custcol_cd_apply', line: lineCred });

				if (isApplied == 'F')
					continue;

				var creditmemo = request.getSublistValue({ group: 'custpage_apply_credit', name: 'custcol_cd_internalid', line: lineCred });
				var amount = parseFloat(request.getSublistValue({ group: 'custpage_apply_credit', name: 'custcol_cd_payment', line: lineCred })) || 0;
				var entity = request.getSublistValue({ group: 'custpage_apply_credit', name: 'custcol_cd_customer', line: lineCred });
				var docNum = request.getSublistValue({ group: 'custpage_apply_credit', name: 'custcol_cd_tranid', line: lineCred });

				credLines[creditmemo] = { amount };

				if (!journalLines[entity])
					journalLines[entity] = {
						amount: 0,
						tranids: []
					};

				journalLines[entity].amount = (journalLines[entity].amount > amount) ? (journalLines[entity].amount - amount) : 0.00;
				journalLines[entity].tranids.push(docNum);
			}

			var depositLines = {}
			var depositGroup = 'custpage_apply_deposit';
			var depositLineCount = request.getLineCount({ group: depositGroup });


			for (var lineDep = 0; lineDep < depositLineCount; lineDep++) {
				var isApplied = request.getSublistValue({ group: 'custpage_apply_deposit', name: 'custcol_dp_apply', line: lineDep });

				if (isApplied == 'F')
					continue;

				var custDeposit = request.getSublistValue({ group: 'custpage_apply_deposit', name: 'custcol_dp_tranid', line: lineDep });
				var amount = parseFloat(request.getSublistValue({ group: 'custpage_apply_deposit', name: 'custcol_dp_payment', line: lineDep })) || 0;
				var entity = request.getSublistValue({ group: 'custpage_apply_deposit', name: 'custcol_dp_customer', line: lineDep });
				var docNum = request.getSublistValue({ group: 'custpage_apply_deposit', name: 'custcol_dp_tranid', line: lineDep });

				depositLines[custDeposit] = { amount };

				if (!journalLines[entity])
					journalLines[entity] = {
						amount: 0,
						tranids: []
					};

				journalLines[entity].amount = (journalLines[entity].amount > amount) ? (journalLines[entity].amount - amount) : 0.00;
				journalLines[entity].tranids.push(docNum);
			}
			for (var x in journalLines) {
				// Credit
				journalRecord.selectNewLine({ sublistId });
				journalRecord.setCurrentSublistValue({
					sublistId, fieldId: 'account',
					value: creditAccount
				});
				journalRecord.setCurrentSublistValue({
					sublistId, fieldId: 'credit',
					value: journalLines[x].amount
				});
				journalRecord.setCurrentSublistValue({
					sublistId, fieldId: 'entity',
					value: x
				});

				if (params.custpage_department)
					journalRecord.setCurrentSublistValue({
						sublistId, fieldId: 'department',
						value: params.custpage_department
					});

				if (params.custpage_location)
					journalRecord.setCurrentSublistValue({
						sublistId, fieldId: 'location',
						value: params.custpage_location
					});

				journalRecord.setCurrentSublistValue({
					sublistId, fieldId: 'memo',
					value: journalLines[x].tranids.join(', ')
				});
				journalRecord.commitLine({ sublistId });

				// Debit
				journalRecord.selectNewLine({ sublistId });
				journalRecord.setCurrentSublistValue({
					sublistId, fieldId: 'account',
					value: debitAccount
				});
				journalRecord.setCurrentSublistValue({
					sublistId, fieldId: 'debit',
					value: journalLines[x].amount
				});
				journalRecord.setCurrentSublistValue({
					sublistId, fieldId: 'entity',
					value: x
				});

				if (params.custpage_department)
					journalRecord.setCurrentSublistValue({
						sublistId, fieldId: 'department',
						value: params.custpage_department
					});

				if (params.custpage_location)
					journalRecord.setCurrentSublistValue({
						sublistId, fieldId: 'location',
						value: params.custpage_location
					});

				journalRecord.setCurrentSublistValue({
					sublistId, fieldId: 'memo',
					value: journalLines[x].tranids.join(', ')
				});
				journalRecord.commitLine({ sublistId });
			}
			var journalRecordId = journalRecord.save();

			log.debug('journalRecordId', journalRecordId);
			var totalPayment = params.custpage_payment;
			credLines[journalRecordId] = { amount: totalPayment };

			for (var x in journalLines) {
				var paymentRecord = record.create({
					type: record.Type.CUSTOMER_PAYMENT,
					isDynamic: true
				});

				paymentRecord.setValue({
					fieldId: 'customer',
					value: x
				});

				// Set header fields
				(['currency', 'aracct', 'account', 'trandate', 'memo', 'department', 'location']).forEach(fieldId => {
					if (params[`custpage_${fieldId}`])
						paymentRecord.setValue({ fieldId, value: params[`custpage_${fieldId}`] });
				});

				var paymentAmount = 0;

				var sublistId = 'apply';
				var lineCount = paymentRecord.getLineCount({ sublistId });
				for (var line = 0; line < lineCount; line++) {
					var id = paymentRecord.getSublistValue({ sublistId, fieldId: 'internalid', line });
					//log.debug('lines ' + id, lines);

					if (!lines[id])
						continue;

					paymentAmount += lines[id].amount;

					paymentRecord.selectLine({ sublistId, line });
					paymentRecord.setCurrentSublistValue({ sublistId, fieldId: 'apply', value: true });
					paymentRecord.setCurrentSublistValue({ sublistId, fieldId: 'amount', value: lines[id].amount });
					paymentRecord.commitLine({ sublistId });
				}

				sublistId = 'credit';
				var lineCount = paymentRecord.getLineCount({ sublistId });
				for (var line = 0; line < lineCount; line++) {
					var id = paymentRecord.getSublistValue({ sublistId, fieldId: 'internalid', line });
					//log.debug('credLines ' + id, credLines);

					if (!credLines[id])
						continue;

					paymentRecord.selectLine({ sublistId, line });
					paymentRecord.setCurrentSublistValue({ sublistId, fieldId: 'apply', value: true });
					paymentRecord.setCurrentSublistValue({ sublistId, fieldId: 'amount', value: credLines[id].amount });
					paymentRecord.commitLine({ sublistId });
				}


				sublistId = 'deposit';
				var lineCount = paymentRecord.getLineCount({ sublistId });
				for (var line = 0; line < lineCount; line++) {
					var id = paymentRecord.getSublistValue({ sublistId: sublistId, fieldId: 'refnum', line });
					//log.debug('depositlines ' + id, depositLines);


					if (!depositLines[id])
						continue;

					paymentRecord.selectLine({ sublistId, line });
					paymentRecord.setCurrentSublistValue({ sublistId, fieldId: 'apply', value: true });
					paymentRecord.setCurrentSublistValue({ sublistId, fieldId: 'amount', value: depositLines[id].amount });
					paymentRecord.commitLine({ sublistId });
				}

				try {
					var paymentRecordId = paymentRecord.save();
					log.debug('paymentRecordId', paymentRecordId);
				} catch (e) { log.debug('ERROR', e); }
			}

			var script = runtime.getCurrentScript();
			redirect.toSuitelet({
				scriptId: script.id,
				deploymentId: script.deploymentId,
				parameters: {
					je: journalRecordId
				}
			});
		}

		// Get all saved search results.
		const getAllSSResult = searchResultSet => {
			var result = [];
			for (var x = 0; x <= result.length; x += 1000)
				result = result.concat(searchResultSet.getRange(x, x + 1000) || []);
			return result;
		}

		return {
			onRequest
		};

	}
);
