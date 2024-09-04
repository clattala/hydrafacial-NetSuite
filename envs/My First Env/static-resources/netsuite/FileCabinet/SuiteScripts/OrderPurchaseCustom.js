/**
  * Module Description
  * 
  * Version    Date            Author           Remarks
  * 1.00       27 Sep 2018     Rakesh K       MultiSite feature enabled.
  *
  */

/**
  * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
  * @appliedtorecord recordType
  * 
  * @param {String} type Operation types: create, edit, delete, xedit,
  *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
  *                      pack, ship (IF only)
  *                      dropship, specialorder, orderitems (PO only) 
  *                      paybills (vendor payments)
  * @returns {Void}
  */
var totalSalesDis = 0;
var totaldiscount = 0;
var discountamount = 0;
var annexRecId = '';
var holdPoints = 'F';
var flag = false;

function orderPurchase(type) {
  //  if(inLoyaltyProgram == 1){ 

  var entity = nlapiGetFieldValue('entity');
  //nlapiLogExecution('DEBUG',"entity", entity);
  var scisAccount = nlapiLookupField('customrecord_annex_cloud_site_details', '1', ['custrecord_customer_site_account_type', 'custrecord_annex_multi_site_config']);
  var accountType = defVal(scisAccount.custrecord_customer_site_account_type);
  var multiSiteConfField = defVal(scisAccount.custrecord_annex_multi_site_config);
  if (accountType == '1' && !multiSiteConfField) {
    annexRecId = '1';
  } else {

    if (!multiSiteConfField) {
      throw "Please Enter MULTI SITE CONFIGURATION ID in Annex Cloud Site Details Record";

    }
    if (entity) {

      var customerobj = nlapiLoadRecord('customer', entity);
      var field = customerobj.getField(multiSiteConfField);
      var fieldtype = field.getType();
      if (fieldtype == 'text') {
        var multiSiteValue = customerobj.getFieldValue(multiSiteConfField);
        annexRecId = annexConfiguration(multiSiteValue);
      } else {

        var customerobj = nlapiLoadRecord('customer', entity);
        var multiSiteValue = customerobj.getFieldText(multiSiteConfField);
        //nlapiLogExecution('debug','multiSiteValue===>',multiSiteValue);
        annexRecId = annexConfiguration(multiSiteValue);
      }
    }


  }
  if (annexRecId) {
    var scismainAccount = nlapiLookupField('customrecord_scis_account', annexRecId, ['custrecord_domain', 'custrecord_site_id', 'custrecord_token', 'custrecord_annex_jwt_token_generation', 'custrecord_annex_points_awarded_record', 'custrecord_annex_hold_points', 'custrecord_annex_cloud_sales_order']);
    var domain = defVal(scismainAccount.custrecord_domain);
    var siteId = defVal(scismainAccount.custrecord_site_id);
    var token = defVal(scismainAccount.custrecord_token);
    var jwtDomain = defVal(scismainAccount.custrecord_annex_jwt_token_generation);
    var pointsAwardedRec = defVal(scismainAccount.custrecord_annex_points_awarded_record);
    var primary_key = defVal(scismainAccount.custrecord_loyalty_primary_key);
    var inactiveSOscript = defVal(scismainAccount.custrecord_annex_cloud_sales_order);


    holdPoints = defVal(scismainAccount.custrecord_annex_hold_points);
    if (domain == '' || siteId == '' || token == '' || jwtDomain == '' || pointsAwardedRec == '' || primary_key == '') {
      throw "Please Enter Account details in Annex Account Record";
    }

  }
  if (inactiveSOscript != 'T' && pointsAwardedRec) { 

    var getRecType = getTransaction(pointsAwardedRec);
    var currRecType = nlapiGetRecordType();
   
    if (getRecType == currRecType ) {

      var a = {
        "Content-Type": "application/x-www-form-urlencoded"
      }
      var orderId = '';
      var rcdType = nlapiGetRecordType();
      var rcdId = nlapiGetRecordId();
      var SalesRcd = nlapiLoadRecord(rcdType, rcdId);
      orderId = SalesRcd.getFieldValue('tranid');
      nlapiLogExecution('DEBUG',"orderId===>", orderId);
      var createdWithPoints = SalesRcd.getFieldValue('custbody_created_with_reward_points');
      var orderStatus = SalesRcd.getFieldValue('status');
      nlapiLogExecution('DEBUG', "orderStatus===>", orderStatus);
      var i_count = SalesRcd.getLineItemCount('item');
      var flag = false;
      for (var k = 1; k <= i_count; k++) {
        var isClosed = SalesRcd.getLineItemValue('item', 'isclosed', k);
        if (isClosed != 'F') {
          flag = true;
          break;
        }
      }

      nlapiLogExecution('DEBUG', "flag===>", flag);
     
      if (orderStatus != 'Closed' && orderStatus != 'Cancelled' && flag != true) {

        var entity = SalesRcd.getFieldValue('entity');
        var fields = ['email', 'custentity_annex_cloud_loyalty_program', 'firstname', 'lastname', 'custentity_annex_cloud_pi_loyalty_id'];

        if (entity) {
          var columns = nlapiLookupField('customer', entity, fields);
          var email = defVal(columns.email);
          var firstname = columns.firstname;
          var lastname = columns.lastname;
          var inLoyaltyProgram = defVal(columns.custentity_annex_cloud_loyalty_program);
          var loyaltyId = defVal(columns.custentity_annex_cloud_pi_loyalty_id);
        }

        var purchaseInfoUrl = domain +'/orders';
        var totalamount = defVal(SalesRcd.getFieldValue('total'));
        discountamount = Number(SalesRcd.getFieldValue('discounttotal'));
        var location = defVal(SalesRcd.getFieldText('location'));
        var itemdetails = new Array();
        var giftCartTotal = defVal(SalesRcd.getFieldValue('giftcertapplied'));
        //nlapiLogExecution('DEBUG',"giftCartTotal====> ", giftCartTotal);
        discountamount = parseFloat(discountamount) + parseFloat(giftCartTotal);
        discountamount = discountamount * -1;
        var couponcode = [];
        var promotion_count = defVal(SalesRcd.getLineItemCount('promotions'));
        if (promotion_count > 0) {
          for (var j = 1; j <= promotion_count; j++) {
            var promoCode = defVal(SalesRcd.getLineItemText('promotions', 'couponcode', j));
            if (promoCode) {
              couponcode.push(promoCode)
            }
          }

        }

        var itemCount = defVal(SalesRcd.getLineItemCount('item'));
        var i_last_item = null;
        var i_line_number = 1;
        for (var i = 1; i <= itemCount; i++) {
          if (itemCount == 1) {
            var qty = SalesRcd.getLineItemValue('item', 'quantity', i);
            var itemId = SalesRcd.getLineItemValue('item', 'item', i);
            var Amt = defVal(SalesRcd.getLineItemValue('item', 'amount', i));
           var finAmount = parseFloat(Amt) / parseFloat(qty)
           finAmount = finAmount.toFixed(2)
            var orderDetail = {
              "id": itemId,
              "quantity": qty,
              "unitPrice": finAmount

            }
            itemdetails.push(orderDetail);
            
          } else {

            var o_item_id = SalesRcd.getLineItemValue('item', 'item', i);
            var s_item_type = SalesRcd.getLineItemValue('item', 'itemtype', i);
            if (s_item_type != 'Discount') {
              var productQty = SalesRcd.getLineItemValue('item', 'quantity', i);
              i_last_item = o_item_id;
              i_line_number = i;
            }

            if (s_item_type == 'Discount') {
              var discAmt = defVal(SalesRcd.getLineItemValue('item', 'amount', i));
              totaldiscount = parseFloat(discAmt) + parseFloat(totaldiscount);
              

            }

            if (SalesRcd.getLineItemValue('item', 'itemtype', i + 1) != 'Discount') {
              var saleAmt = defVal(SalesRcd.getLineItemValue('item', 'amount', i_line_number));
             
              totalSalesDis = parseFloat(saleAmt) + parseFloat(totaldiscount);
             var finalValue = parseFloat(totalSalesDis) / parseFloat(productQty);
                    finalValue = finalValue.toFixed(2);
                    var orderDetail = {
                      "id": i_last_item,
                      "quantity": productQty,
                      "unitPrice": finalValue

                    }
              itemdetails.push(orderDetail);

              totalSalesDis = 0;
              totaldiscount = 0;
            }
          }
        }
       
        var createOrderPayload = {
          "id": orderId,
          "userId": loyaltyId,
          "email": email,
          "orderDetail": itemdetails,
          "storeId": location,
          "coupon": couponcode,
          "discountAmount": discountamount
        };
        createOrderPayload = JSON.stringify(createOrderPayload);
        jwtDomain = jwtDomain + '&annexcloudId=' + annexRecId;
        var JWTresponse = nlapiRequestURL(jwtDomain, createOrderPayload, a);
        var str_JWT = defVal(JWTresponse.getBody());
        var str1 = str_JWT.replace(/\n|\r/g, '');
        var header = {
          "X-AnnexCloud-Site": siteId,
          "Content-Type": "application/json",
          "Authorization": 'Bearer ' + str1

        }
        nlapiLogExecution('DEBUG', purchaseInfoUrl, purchaseInfoUrl);
        var purchaseInfoObj = nlapiRequestURL(purchaseInfoUrl, createOrderPayload, header, 'POST');
        var purchaseInfoRes = JSON.parse(defVal(purchaseInfoObj.getBody()));
        var purchaseInfoErrCode = purchaseInfoRes.errorCode;
        if (purchaseInfoErrCode) {
          var statusCode = purchaseInfoRes.errorCode;
          var errorDescription = purchaseInfoRes.errorMessage;
          var errSt = statusCode + ': ' + errorDescription;
          nlapiLogExecution('DEBUG', 'Send purchase Information api exception', errSt);

        } else {

          var earnedPoints = purchaseInfoRes.pointsAwarded;
          var recordfields = ['custbody_scis_loyalty_points', 'custbody_created_with_reward_points'];
          var recordvalues = [earnedPoints, 'T'];
          nlapiSubmitField(rcdType, rcdId, recordfields, recordvalues);
          if (type == 'edit') {
            type = 'create';
          }
          updateTiersDetails(type, loyaltyId, entity, annexRecId);
        }

      } else if(orderStatus == 'Closed' && flag == true){

        var RecordId = nlapiGetRecordId();
        var salesOrder = nlapiLoadRecord('salesorder', RecordId);
        var email = salesOrder.getFieldValue('email');
        var rcdId = nlapiGetRecordId();
        var orderId = salesOrder.getFieldValue('tranid');
        var purchaseInfoUrl = domain + '/orders/'+orderId;

        nlapiLogExecution('DEBUG', "holdPoints====> ", holdPoints);
        if (holdPoints != 'T') {
          var createOrderPayload = {
            "orderId": orderId,
            "status": "return"
          };
        } else {
          var createOrderPayload = {
            "orderId": orderId,
            "status": "cancel"
          };
        }

        createOrderPayload = JSON.stringify(createOrderPayload);
        jwtDomain = jwtDomain + '&annexcloudId=' + annexRecId;
        var JWTresponse = nlapiRequestURL(jwtDomain, createOrderPayload, a);
        var str_JWT = defVal(JWTresponse.getBody());
        var str1 = str_JWT.replace(/\n|\r/g, '');
        var header = {
          "X-AnnexCloud-Site": siteId,
          "Content-Type": "application/json",
          "Authorization": 'Bearer ' + str1
        }

        var purchaseInfoObj = nlapiRequestURL(purchaseInfoUrl, createOrderPayload, header, 'PUT');
        var purchaseInfoRes = JSON.parse(defVal(purchaseInfoObj.getBody()));
        var purchaseInfoErrCode = purchaseInfoRes.errorCode;
        if (purchaseInfoErrCode) {

          var statusCode = purchaseInfoRes.errorCode;
          var errorDescription = purchaseInfoRes.errorMessage;
          var errSt = statusCode + ': ' + errorDescription;
          nlapiLogExecution('DEBUG', 'Send purchase Information api exception', errSt);
        } else {
          var earnedPoints = purchaseInfoRes.pointsRemoved;
          earnedPoints = earnedPoints * -1;
          nlapiLogExecution('DEBUG', 'pointsRemoved', earnedPoints)
          nlapiSubmitField(rcdType, rcdId, ['custbody_scis_loyalty_points', 'custbody_annex_send_return_request'], [earnedPoints, 'T']);
          type = 'create';
          updateTiersDetails(type, loyaltyId, entity, annexRecId)
        }

      }else if(orderStatus == 'Cancelled'){
		  
		  var promotion_count = defVal(SalesRcd.getLineItemCount('promotions'));
        if (promotion_count > 0) {
          for (var j = 1; j <= promotion_count; j++) {
			var finalRate =0;
            var couponRate = defVal(SalesRcd.getLineItemValue('promotions', 'discountrate', j));
            if (couponRate){
				
				//finalRate = couponRate + 
				
				//2590 
				 nlapiLogExecution('DEBUG', 'couponRate', couponRate);
				
				
              
            }
          }

        }
		
		
		
		
		//creditcouponcodePoints(loyaltyId,annexRecId,jwtDomain,siteId,credit_points,domain)
	  }


    }
  }

}

function creditcouponcodePoints(loyaltyId,annexRecId,jwtDomain,siteId,credit_points,domain){
	
             nlapiLogExecution('debug','inside changeTrade');
             var deductPointsUrl = domain + '/points';
             var createCustomerPayload = {"id":loyaltyId,"actionId":"100","activity":"CREDIT","credit":credit_points,"reason":'Coupon Code Points Rewarded.'};
             createCustomerPayload = JSON.stringify(createCustomerPayload);
             var a = {"User-Agent-x": "SuiteScript-Call"};
             jwtDomain = jwtDomain+'&annexcloudId='+annexRecId;
             var JWTresponse = nlapiRequestURL(jwtDomain, createCustomerPayload, a);
             var str_JWT = defVal(JWTresponse.getBody());
             //nlapiLogExecution('DEBUG','str_JWT',str_JWT);
             var str1 = str_JWT.replace(/\n|\r/g, '');
             //nlapiLogExecution('DEBUG','str1',str1);
             var header = {
               "X-AnnexCloud-Site": siteId,
               "Content-Type": "application/json",
               "Authorization": 'Bearer '+str1
               
               }
             
               var deductPointDetail = {"id":loyaltyId,"actionId":"100","activity":"CREDIT","credit":credit_points,"reason":'Coupon Code Points Rewarded.'};
               deductPointDetail=  JSON.stringify(deductPointDetail);
               var deductPointsObj = nlapiRequestURL(deductPointsUrl,deductPointDetail,header,'POST');
               var deductPointsRes = JSON.parse(deductPointsObj.getBody());
               var deductPointsErrCode = deductPointsRes.errorCode;
 
               nlapiLogExecution('debug','deductPointsErrCode',deductPointsErrCode);
   
 //  autoOptin(loyaltyId,annexRecId,jwtDomain,siteId,domain);
 
   
 
}
function annexConfiguration(multiSiteValue) {
  var annexRecId;
  if (multiSiteValue) {

    var customrecord_scis_accountSearch = nlapiSearchRecord("customrecord_scis_account", null,
      [
        ["isinactive", "is", "F"],
        "AND",
        ["custrecord_multi_site_configuration_val", "is", multiSiteValue]
      ],
      [
        new nlobjSearchColumn("internalid").setSort(false),

      ]
    );

    nlapiLogExecution('debug', 'customrecord_scis_accountSearch', customrecord_scis_accountSearch);
    if (customrecord_scis_accountSearch) {
      for (var i = 0; i < customrecord_scis_accountSearch.length; i++) {
        var resultSet = customrecord_scis_accountSearch[i];
         var annexRecId = resultSet.getValue('internalid');

      }
    }

  }

  return annexRecId;
}

function defVal(value) {

  if (value == null || value == undefined || value == 'undefined' || value == ' ' || value == 'NaN/NaN/NaN' || value == 'NaN') {
    value = '';
  } else {
    return value;
  }
}

function getTransaction(pointsawardid) {

  var transactiontype = '';

  if (pointsawardid == 5) {
    transactiontype = "cashsale";
  } else if (pointsawardid == 7) {
    transactiontype = "invoice";
  } else if (pointsawardid == 9) {
    transactiontype = "customerpayment";
  } else if (pointsawardid == 31) {
    transactiontype = "salesorder";
  } else if (pointsawardid == 32) {
    transactiontype = "itemfulfillment";
  } else {
    transactiontype = "";
  }

  return transactiontype;
}