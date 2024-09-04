// @module Tavanoteam.TT_Pacejet.Pacejet
define('Tavanoteam.TT_Pacejet.Pacejet.View'
,	[
		'tavanoteam_tt_pacejet_pacejet.tpl'
	,	'Utils'
	,	'Backbone'
	,	'jQuery'
	,	'underscore'
	]
,	function (
		tavanoteam_tt_pacejet_pacejet_tpl
	,	Utils
	,	Backbone
	,	jQuery
	,	_
	)
{
	'use strict';

	// @class Tavanoteam.TT_Pacejet.Pacejet.View @extends Backbone.View
	return Backbone.View.extend({

		template: tavanoteam_tt_pacejet_pacejet_tpl

	,	initialize: function (options) {

			/*  Uncomment to test backend communication with an example service 
				(you'll need to deploy and activate the extension first)
			*/
			this.message = '';
			// var service_url = Utils.getAbsoluteUrl(getExtensionAssetsPath('services/Pacejet.Service.ss'));

			// jQuery.get(service_url)
			// .then((result) => {

			// 	this.message = result;
			// 	this.render();
			// });
		}

	,	events: {
		}

	,	bindings: {
		}

	, 	childViews: {
			
		}

		//@method getContext @return Tavanoteam.TT_Pacejet.Pacejet.View.Context
	,	getContext: function getContext()
		{
			//@class Tavanoteam.TT_Pacejet.Pacejet.View.Context
			this.message = this.message || 'Hello World!!'
			return {
				message: this.message
			};
		}
	});
});