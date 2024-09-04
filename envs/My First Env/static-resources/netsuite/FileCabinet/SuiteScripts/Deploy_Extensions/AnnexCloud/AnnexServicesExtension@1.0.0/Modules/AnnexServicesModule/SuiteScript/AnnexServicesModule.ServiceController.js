
define(
	'AnnexCloud.AnnexServicesExtension.AnnexServicesModule.ServiceController'
,	[
		'ServiceController'
	,	'SC.Models.Init'
	,	'AnnexCloud.AnnexServicesExtension.AnnexServicesModule.Model'
	]
,	function(
		ServiceController
	,	ModelsInit
	,	AnnexServicesModuleModel
	)
	{
		'use strict';

		return ServiceController.extend({

			name: 'AnnexCloud.AnnexServicesExtension.AnnexServicesModule.ServiceController'

			// The values in this object are the validation needed for the current service.
			// Can have values for all the request methods ('common' values) and specific for each one.
		,	options: {
				common: {
					requireLoggedInPPS: true
				}
			}

		,	get: function get()
			{
				var id = this.request.getParameter('id');  
            	var n =  this.request.getParameter('n'); 
				return AnnexServicesModuleModel.get(id,n);
			}

		,	post: function post()
			{
				return AnnexServicesModuleModel.create(this.data);
			}

		,	put: function put()
			{
				return AnnexServicesModuleModel.update(this.data);
			}
			
		,	delete: function()
			{
				var id = this.request.getParameter('internalid');
          		return AnnexServicesModuleModel.remove(id);
			}
		});
	}
);