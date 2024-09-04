
define('QuestionsAndAnswersModule.Model'
,	[
		'Backbone'
	,	'Utils'
	,	'underscore'
	]
,	function (
		Backbone
	,	Utils
	,	_
	)
{
	'use strict';

	var QuestionsAndAnswersModuleModel = Backbone.Model.extend({

		//urlRoot: Utils.getAbsoluteUrl(getExtensionAssetsPath('services/QuestionsAndAnswersModule.Service.ss'))
		urlRoot: Utils.getAbsoluteUrl('extensions/AnnexCloud/AnnexServicesExtension/1.0.0/services/AnnexServicesModule.Service.ss')
	,	validation: {
			title: {
				required: true
			,	msg: _('Valid task name is required').translate()
			}
		}

	,	defaults: {
			'title': ''
		,	'completed': false
		}

	,	initialize: function (options)
		{
			this.options = options;

		}
	});

	return QuestionsAndAnswersModuleModel;
});
