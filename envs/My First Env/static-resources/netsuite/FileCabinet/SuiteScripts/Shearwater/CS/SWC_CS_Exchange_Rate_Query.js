/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope public
 */
define(['N/record','N/currentRecord','N/url','N/search','N/format'],

	function(record,currentRecord,url,search,format) {

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

		}
		/**
		 * 查询功能
		 */
		function query() {
			debugger;
			var curRecord = currentRecord.get();
			var startDateObj = curRecord.getValue({fieldId:'custpage_startdate'}); // 开始账期
			if(!startDateObj){
				alert("请填写查询期间");
				return;
			}
			var filterJsonOption = {
				'startDateObj':startDateObj
			};
			// 取消提示框
			window.onbeforeunload = null;
			var urlObj = url.resolveScript({
				scriptId: 'customscript_swc_sl_exchange_rate_query',
				deploymentId: 'customdeploy_swc_sl_exchange_rate_query',
				params: {'filterJsonOption':JSON.stringify(filterJsonOption),'queryFlag':true}
			});
			window.location.href = urlObj;
		}


		/**
		 * 输出base64编码
		 * @param s
		 * @returns {string}
		 */
		function base64(s) {
			return window.btoa(unescape(encodeURIComponent(s)));
		}


		return {
			query : query,
			fieldChanged : fieldChanged
		};

	});
