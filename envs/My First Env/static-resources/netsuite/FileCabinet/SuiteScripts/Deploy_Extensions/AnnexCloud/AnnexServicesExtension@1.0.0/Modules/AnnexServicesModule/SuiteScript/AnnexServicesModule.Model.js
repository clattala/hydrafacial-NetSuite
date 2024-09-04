
// Example of basic CRUD operations of AnnexCloud.AnnexServicesExtension.AnnexServicesModule

define('AnnexCloud.AnnexServicesExtension.AnnexServicesModule.Model'
,	[
		'SC.Model'
	,	'SC.Models.Init'

	,	'underscore'
	]
,	function (
		SCModel
	,	ModelsInit

	,	_
	)
{
	'use strict';

	return SCModel.extend({
		
		name: 'AnnexCloud.AnnexServicesExtension.AnnexServicesModule'

	,	validation: {
			title: {required: true, msg: 'Title is required'}
		}

	,	get: function (id,n)
		{
			//var list = nlapiGetContext().getSessionObject('annexservicesmodule_list');
			//list = list !== null && list !== '' ? JSON.parse(list) : [];
			//return list;
			var page=id;

      try {
		        // var request = 
		                 // nlapiLogExecution('DEBUG', 'ID', JSON.stringify(id));
		// var page  = request.getParameter("page")
		          var columns=[];
		columns.push(new nlobjSearchColumn('custrecord_annexcloud_siteid'));
		columns.push(new nlobjSearchColumn('custrecord_annexcloud_templateid'));
		columns.push(new nlobjSearchColumn('custrecord_page_id_product'));
		columns.push(new nlobjSearchColumn('custrecord_page_id_category'));
		columns.push(new nlobjSearchColumn('custrecord_page_id_home'));
		columns.push(new nlobjSearchColumn('custrecord_access_token'));
		columns.push(new nlobjSearchColumn('custrecord_annexcloud_handleloginurl'));

		var results=nlapiSearchRecord('customrecord_annexcloud', null, ['internalid','anyof',1], columns);
		var data={};
		data.siteId=results[0].getValue('custrecord_annexcloud_siteid');//  4487980;
		data.templateId=results[0].getValue('custrecord_annexcloud_templateid') ;//254;
		data.accesstoken = results[0].getValue('custrecord_access_token');
		data.handleloginurl = results[0].getValue('custrecord_annexcloud_handleloginurl');
		// data.page=id;
		// data.test="test";
		if(page=='pdp'){
		data.pageId = results[0].getValue('custrecord_page_id_product') ;
		}else if(page=='category'){
		data.pageId = results[0].getValue('custrecord_page_id_category') ;

		}else{
		  data.pageId = results[0].getValue('custrecord_page_id_home') ;

		}
		return JSON.stringify(data);
		      } catch (e) {
		          nlapiLogExecution('DEBUG', 'Error In SuiteScript', JSON.stringify(e));
			  }
			 
		}

	,	update: function (data)
		{
			var list = nlapiGetContext().getSessionObject('annexservicesmodule_list');
			list = list !== null && list !== '' ? JSON.parse(list) : [];

			if(data.internalid)
			{
				var task = _.findWhere(list, {internalid: data.internalid});
				task.title = data.title;
				task.completed = data.completed;
				
				nlapiGetContext().setSessionObject('annexservicesmodule_list', JSON.stringify(list));
				return task;
			}
			else
			{
				throw new Error('Invalid TODO id ' + data.internalid);
			}
		}

	,	create: function (data)
		{
			var list = nlapiGetContext().getSessionObject('annexservicesmodule_list');
			list = list !== null && list !== '' ? JSON.parse(list) : [];
			var task = {
				internalid: list.length + 1
			,	title: data.title
			,	completed: false
			};

			list.push(task);

			nlapiGetContext().setSessionObject('annexservicesmodule_list', JSON.stringify(list));
          	return task;
		}

	,	remove: function (id)
		{
			var list = nlapiGetContext().getSessionObject('annexservicesmodule_list');
			list = list !== null && list !== '' ? JSON.parse(list) : [];

			if(id)
			{
            	var task = _.findWhere(list, {internalid: parseInt(id, 10)});
				var index = _.indexOf(list, task);
				if(task && index >= 0)
				{
					list.splice(index, 1);
					nlapiGetContext().setSessionObject('annexservicesmodule_list', JSON.stringify(list));
					return {'status': 'ok'};
				}
				else
				{
					throw new Error('Could not find TODO with id ' + id);
				}
			}
			else
			{
				throw new Error('Invalid TODO id ' + id);
			}
		}
	});
});