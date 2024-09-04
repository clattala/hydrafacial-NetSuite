/**
 * @NApiVersion 2.x
 * @NModuleScope TargetAccount
 */
define(['N/https', 'N/log', 'N/query', 'N/record', 'N/runtime', 'N/search'], function (https, log, query, record, runtime, search) {
    'use strict';

    var loyaltyConfigRecordId = 'customrecord_hf_loyalty_tier_config';
    var loyaltyPointsRecordId = 'customrecord_hf_loyalty';

    return {
      getUserPoints: function getUserPoints(request) {
        var parameters     = request.parameters;
        var currentUser    = runtime.getCurrentUser().id;
        var customerLookup = search.lookupFields({ type: record.Type.CUSTOMER, id: currentUser, columns: ['custentity_hf_loyalty_optin', 'custentity_hf_current_loyalty_tier', 'currency', 'subsidiary'] })
        var resp           = { optedIn: false, tierConfig: {}, pointsBalance: 0 }
        var isOptedIn      = customerLookup['custentity_hf_loyalty_optin'];
        if (isOptedIn) {
          var LOYALTY_CONFIG = this.getConfig();
          var currentTier    = customerLookup['custentity_hf_current_loyalty_tier'];
          log.debug('currentTier', currentTier);
          if (currentTier && currentTier.length > 0 && Number(currentTier[0].value) > 0) {
            var subsidiary = customerLookup['subsidiary'];
            var currency   = customerLookup['currency'];
            var key        = currentTier[0].value + ':' + currency[0].value + ':' + subsidiary[0].value;
            var tierConfig = LOYALTY_CONFIG[key];
            log.debug('tierConfig', tierConfig);
            if (!tierConfig) {
              log.error('no config found for this tier ' + key, LOYALTY_CONFIG);
              resp.optedIn = false;
            } else {
              resp.tierConfig = tierConfig;
              resp.optedIn    = true;
            }

            resp.pointsBalance = this.getPointsBalance(currentUser);
          }
        }

        return resp;
      },

      getPromotionCode: function getPromotionCode(request) {
        var parameters = request.parameters;
        //TODO: setup a config record with the form and discount ID?
        try {
          var customerId      = runtime.getCurrentUser().id;
          var timestamp       = Date.now();
          var discount        = parameters.discount;
          var promotionFormId = -10502;
          var discountId      = 3243;
          var siteid          = 2;
          var name            = "Hydrafacial Loyalty Rewards Redemption - " + customerId + ' ' + timestamp.toString();
          var code            = "HFLOY_" + customerId + "_" + timestamp;
          // x Loyalty Points Applied

          var promotionRec = record.create({ type: 'promotioncode' });

          var fieldsToSet = [
            { name: 'name', value: name },
            { name: 'customform', value: promotionFormId },
            { name: 'repeatdiscount', value: 'F' },
            { name: 'whatthecustomerneedstobuy', value: 'ANYTHING' },
            { name: 'applydiscountto', value: 'FIRSTSALE' },
            { name: 'discount', value: discountId },
            { name: 'discounttype', value: 'flat' },
            { name: 'rate', value: Math.floor(Math.abs(discount)) },
            { name: 'code', value: code }
          ]

          fieldsToSet.forEach(function (field) {
            promotionRec.setValue(field.name, field.value);
          });

          var promotionId = promotionRec.save();

          record.submitFields({
            type  : 'promotioncode',
            id    : promotionId,
            values: {
              'audience'     : 'SPECIFICCUSTOMERS',
              'customers'    : customerId.toString(),
              'saleschannels': 'SPECIFICWEBSITES',
              'website'      : siteid.toString()
            }
          });

          return { status: 'OK', response: { promotionId: promotionId, promotionCode: code } }

        } catch (e) {
          log.error('Error creating promotion code for points redemption', JSON.stringify(e))
          return { status: 'ERROR', error: 'There was a problem redeeming your points. Please try again', response: {} }
        }
      },

      removePromotion: function removePromotion(request) {
        var parameters  = request.parameters;
        var promotionId = parameters['promotionId'];
        try {
          record.delete({ type: 'promotioncode', id: promotionId });
          return { status: 'OK', response: promotionId }

        } catch (e) {
          log.error('Error removing promotion', JSON.stringify(e))
          return {
            status  : 'ERROR',
            error   : 'There was a problem removing your points.',
            response: {}
          }
        }
      },

      getConfig: function getConfig() {
        var sessionObj   = runtime.getCurrentSession();
        var cachedConfig = sessionObj.get('hf_loyalty_tiers');
        if (!cachedConfig) {
          var tierMap        = {};
          var queryObj       = query.create({ type: loyaltyConfigRecordId });
          var inActive       = queryObj.createCondition({ fieldId: 'isinactive', operator: query.Operator.IS, values: false });
          queryObj.condition = queryObj.and(inActive);
          queryObj.columns   = [
            queryObj.createColumn({ fieldId: 'id' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_loyalty_tier', alias: 'tierId' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_loyalty_tier', alias: 'tierName', context: query.FieldContext.DISPLAY }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_price_level', alias: 'tierPriceLevel' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_price_level', alias: 'tierPriceLevelName', context: query.FieldContext.DISPLAY }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_points_multiplier', alias: 'tierRate' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_ytd_spend_req', alias: 'spendRequired' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_config_days_expire', alias: 'tierDaysExpire' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_tier_currency', alias: 'currency' }),
            queryObj.createColumn({ fieldId: 'custrecord_hf_tier_subsidiary', alias: 'subsidiary' })
          ]
          var runQuery       = queryObj.run();
          var iterator       = runQuery.iterator();
          iterator.each(function (result) {
            var resultObj = result.value.asMap();
            log.debug('tier result', resultObj);
            var key      = resultObj.tierId + ':' + resultObj.currency + ':' + resultObj.subsidiary;
            tierMap[key] = {
              tierName         : resultObj.tierName,
              tierId           : Number(resultObj.tierId),
              tierMultiplier   : Number(resultObj.tierRate),
              tierRatio        : Number(resultObj.tierRate) / 100,
              tierPriceLevel   : Number(resultObj.tierPriceLevel),
              tierExpireDays   : Number(resultObj.tierDaysExpire),
              tierSpendRequired: Number(resultObj.spendRequired),
              currency         : Number(resultObj.currency),
              subsidiary       : Number(resultObj.subsidiary)
            }
            return true;
          });
          cachedConfig = JSON.stringify(tierMap);
          sessionObj.set('hf_loyalty_tiers', cachedConfig);
        }
        log.debug('getConfig', typeof cachedConfig)
        return JSON.parse(cachedConfig);
      },

      getPointsBalance: function (customerId) {
        var queryObj           = query.create({ type: loyaltyPointsRecordId });
        var inActive           = queryObj.createCondition({ fieldId: 'isinactive', operator: query.Operator.IS, values: false });
        var customerFilter     = queryObj.createCondition({ fieldId: 'custrecord_hf_loyalty_customer', operator: query.Operator.ANY_OF, values: customerId });
        queryObj.condition     = queryObj.and(inActive, customerFilter);
        queryObj.columns       = [
          queryObj.createColumn({ fieldId: 'id' }),
          queryObj.createColumn({ fieldId: 'custrecord_hf_loyalty_total' })
        ]
        queryObj.sort          = [
          queryObj.createSort({ column: queryObj.columns[0], ascending: true })
        ]
        var runQuery           = queryObj.runPaged({ pageSize: 1 }); // get the latest entry
        var iterator           = runQuery.iterator();
        var currentPointsTotal = 0;
        iterator.each(function (resultPage) {
          var currentPageData = resultPage.value.data.asMappedResults();
          for (var i = 0; i < currentPageData.length; i++) {
            currentPointsTotal = Number(currentPageData[i].custrecord_hf_loyalty_total)
          }
          return true;
        });

        return currentPointsTotal;
      }

    }
  }
)
