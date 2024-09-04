define('LoyaltyPointsRedemption.Model',
    [
        'SC.Model',
        'SC.Models.Init',
        'Configuration',
        'underscore'
    ],	function (
        SCModel,
        ModelsInit,
        Configuration,
        _
    ) {
        'use strict';
        return SCModel.extend({
            name: 'LoyaltyPointsRedemption.Model',

            getAnnexConfigurations: function getAnnexConfigurations(website){
				//console.log(website);
                var ret = {};
                try{

                    var configurationsSearch = nlapiCreateSearch('customrecord_annex_configuration_hydra',
                        [
                            new nlobjSearchFilter('custrecord_lpr_website', null, 'anyof', website)
                        ],
                        [
                            new nlobjSearchColumn('internalid'),
                            new nlobjSearchColumn('name'),
                            new nlobjSearchColumn('custrecord_lpr_host_url'),
                            new nlobjSearchColumn('custrecord_lpr_client_name'),
                            new nlobjSearchColumn('custrecord_lpr_site_id'),
                            new nlobjSearchColumn('custrecord_lpr_secret_key'),
                            new nlobjSearchColumn('custrecord_lpr_get_points_url'),
                            new nlobjSearchColumn('custrecord_lpr_debit_point_url'),
                            new nlobjSearchColumn('custrecord_lpr_order_promotion_form_id'),
                            new nlobjSearchColumn('custrecord_lpr_discount_id'),
                            new nlobjSearchColumn('custrecord_lpr_website'),
                            new nlobjSearchColumn('custrecord_lpr_ratio')
                        ]);

                    var configurations = [];
                    var configurationResult = configurationsSearch.runSearch();
					//console.log(configurationResult);
                    configurationResult.forEachResult(function(res){
                        configurations.push({
                            id: res.id,
                            name: res.getValue('name'),
                            hostUrl: res.getValue('custrecord_lpr_host_url'),
                            clientName: res.getValue('custrecord_lpr_client_name'),
                            siteId: res.getValue('custrecord_lpr_site_id'),
                            secretKey: res.getValue('custrecord_lpr_secret_key'),
                            getPointsUrl: res.getValue('custrecord_lpr_get_points_url'),
                            debitPointsUrl: res.getValue('custrecord_lpr_debit_point_url'),
                            orderPromotionFormId: res.getValue('custrecord_lpr_order_promotion_form_id'),
                            discountId: res.getValue('custrecord_lpr_discount_id'),
                            website: res.getValue('custrecord_lpr_website'),
                            ratio: res.getValue('custrecord_lpr_ratio')
                        });
                        return true;
                    });


                    ModelsInit.context.setSessionObject('annex_config', JSON.stringify(configurations[0]));
                    this.configuration = configurations[0];

                    ret = {
                        status: 'OK',
                        response: {
                            configuration: {
                                clientName: this.configuration.clientName,
                                siteId: this.configuration.siteId,
                                key: this.configuration.secretKey,
                                ratio: this.configuration.ratio
                            }
                        }
                    }

                } catch(e){
                    nlapiLogExecution('ERROR', 'Error retrieving Annex configurations', JSON.stringify(e));
                    ret = {
                        status: 'ERROR',
                        error: JSON.stringify(e),
                        response: {}
                    }
                }
                return ret;
            },

            getUserPoints: function getUserPoints(requestPayload, token) {
                var ret = {};

                try {
                    var annex_config = ModelsInit.context.getSessionObject('annex_config');
                    var config = JSON.parse(annex_config || {});

                    var data = JSON.parse(requestPayload);
                    var url = config.hostUrl + config.getPointsUrl + '/' + data.email;

                    var header = {
                        "Authorization": "Bearer " + token,
                        "X-AnnexCloud-Site": config.siteId
                    };

                    var response = nlapiRequestURL(url, null, header);
                    var body = response.getBody() || '{}';
                    body = JSON.parse(body);

                    nlapiLogExecution('DEBUG', 'Annex - Get User Points', JSON.stringify(body));

                    ret = {
                        status: 'OK',
                        response: body
                    }

                } catch (e) {
                    nlapiLogExecution('ERROR', 'Error retrieving Annex user points', JSON.stringify(e));
                    ret = {
                        status: 'ERROR',
                        error: JSON.stringify(e),
                        response: {}
                    }
                }

                return ret;
            },

            getPromotionCode: function getPromotionCode(discount) {
                var ret = {};
//console.log("I M HERE 2");
                try {
                    var annex_config = ModelsInit.context.getSessionObject('annex_config');
                    var config = JSON.parse(annex_config || {});

                    var promotionFormId = config.orderPromotionFormId;
                    var discountId = config.discountId;

                    var customerid = nlapiGetUser();
                    var siteid = ModelsInit.session.getSiteSettings(['siteid']).siteid;
                    var timestamp = Date.now();
                    var name = "Loyalty Redemption Points - " + customerid + timestamp.toString();
                    var code = "LRP_" + customerid + "_" + timestamp;

                    var promotioncode = nlapiCreateRecord('promotioncode');

                    var fieldsToSet = [
                        {name: 'name', value: name},
                        {name: 'customform', value: promotionFormId},
                        {name: 'repeatdiscount', value: 'F'},
                        {name: 'whatthecustomerneedstobuy', value: 'ANYTHING'},
                        {name: 'applydiscountto', value: 'FIRSTSALE'},
                        {name: 'discount', value: discountId},
                        {name: 'discounttype', value: 'flat'},
                        {name: 'rate', value: discount},
                        {name: 'code', value: code}
                    ]

                    fieldsToSet.forEach(function(field){
                        promotioncode.setFieldValue(field.name, field.value);
                    })

                    var id = nlapiSubmitRecord(promotioncode);

                    var updateFields = ['audience', 'customers', 'saleschannels', 'website'];
                    var updateValues = ['SPECIFICCUSTOMERS', customerid.toString(), 'SPECIFICWEBSITES', siteid.toString()];

                    nlapiSubmitField('promotioncode', id, updateFields, updateValues);

                    ret = {
                        status: 'OK',
                        response: {
                            promotionid: id,
                            promotioncode: code
                        }
                    }

                } catch (e) {
                    nlapiLogExecution('ERROR', 'Error creating promotion code for points redemption', JSON.stringify(e));
                    ret = {
                        status: 'ERROR',
                        error: JSON.stringify(e),
                        response: {}
                    }
                }

                return ret;
            },

            debitRedeemedPoints: function debitRedeemedPoints(requestPayload, token) {
                var ret = {};

                try {

                    var annex_config = ModelsInit.context.getSessionObject('annex_config');
                    var config = JSON.parse(annex_config || {});

                    var url = config.hostUrl + config.debitPointsUrl;

                    var header = {
                        "Authorization": "Bearer " + token,
                        "X-AnnexCloud-Site": config.siteId,
                        "Content-type": "application/json"
                    };
					//console.log(url);
					//console.log(requestPayload);
                    var response = nlapiRequestURL(url, requestPayload, header);
                    var body = response.getBody() || '{}';
                    body = JSON.parse(body);
//console.log(body);
                    nlapiLogExecution('DEBUG', 'Annex - Debit User Points', JSON.stringify(body));

                    ret = {
                        status: 'OK',
                        response: body
                    }

                } catch (e) {
                    nlapiLogExecution('ERROR', 'Error debiting Annex user points', JSON.stringify(e));
                    ret = {
                        status: 'ERROR',
                        error: JSON.stringify(e),
                        response: {}
                    }
                }

                return ret;
            },

            removePromotion: function removePromotion(promotionId) {
                var ret = {};

                try {

                    var id = nlapiDeleteRecord('promotioncode', promotionId);

                    ret = {
                        status: 'OK',
                        response: id
                    }

                } catch (e) {
                    nlapiLogExecution('ERROR', 'Error removing promotion', JSON.stringify(e));
                    ret = {
                        status: 'ERROR',
                        error: JSON.stringify(e),
                        response: {}
                    }
                }

                return ret;
            }
        });
    });