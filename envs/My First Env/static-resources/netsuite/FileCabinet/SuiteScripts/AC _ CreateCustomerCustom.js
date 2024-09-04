/**
  * Module Description
  * 
  * Version    Date            Author           Remarks
  * 1.00      01 Nov 2019     Rakesh K		   This script creates customer record into Annex side and update points into NetSuite at Annex cloud tab at customer record. 
  * 1.00		  19 Jul 2020 	   Rakesh K		   Enable MultiSite Configuration for loyalty Program.
  * 1.00      18 Jan 2021      Rakesh K      Added feature for customer inactive script checkbox.
  */

/**
  * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
  * @appliedtorecord recordType
  * 
  * @param {String} type Operation types: create, edit, delete, xedit
  *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
  *                      pack, ship (IF)
  *                      markcomplete (Call, Task)
  *                      reassign (Case)
  *                      editforecast (Opp, Estimate)
  * @returns {Void}
  */


var token = '';
var url = '';

/*function loyaltyTier()
{
  var Loyalty_tier = nlapiGetFieldText('custentity_hf_loyalty_tier');
    nlapiLogExecution('DEBUG', 'Loyalty_tier',Loyalty_tier);
    var setcurrent_tier =  nlapiGetFieldValue('custentity_annex_cloud_li_current_tier');
      nlapiLogExecution('DEBUG', 'setcurrent_tier',setcurrent_tier);
     nlapiSetFieldText('custentity_hf_loyalty_tier',setcurrent_tier);
}*/

function createCustomer(type) {
  try {

    var rcdType = nlapiGetRecordType();
    nlapiLogExecution('DEBUG', 'rcdType==>', rcdType);
    var customer_id = nlapiGetRecordId();
     nlapiLogExecution('DEBUG', 'customer_id==>', customer_id);
    nlapiLogExecution('DEBUG', 'type==>', type);
    var currentContext = nlapiGetContext();
     nlapiLogExecution('DEBUG', 'currentContext==>', currentContext);
    var annexRecId = '';
    nlapiLogExecution('DEBUG', 'annexRecId==>', annexRecId);
    var scisAccount = nlapiLookupField('customrecord_annex_cloud_site_details', '1', ['custrecord_customer_site_account_type', 'custrecord_annex_multi_site_config']);
    var accountType = defVal(scisAccount.custrecord_customer_site_account_type);
    var multiSiteConfField = defVal(scisAccount.custrecord_annex_multi_site_config);
    if (accountType == '1' && !multiSiteConfField) {
      annexRecId = '1';
    } else {

      if (!multiSiteConfField) {
        throw "Please Enter MULTI SITE CONFIGURATION ID in Annex Cloud Site Details Record";

      }
      var field = nlapiGetField(multiSiteConfField);
      nlapiLogExecution('DEBUG', 'field', field);
      var fieldtype = field.getType();
      nlapiLogExecution('DEBUG', 'fieldtype', fieldtype);
      if (fieldtype == 'text') {
        var multiSiteValue = nlapiGetFieldValue(multiSiteConfField);
        annexRecId = annexConfiguration(multiSiteValue);
      } else {

        var customerobj = nlapiLoadRecord(rcdType, customer_id);


        var multiSiteValue = customerobj.getFieldText(multiSiteConfField);
        nlapiLogExecution('debug', 'multiSiteValue===>', multiSiteValue);
        annexRecId = annexConfiguration(multiSiteValue);
      }


    }

    if (annexRecId) {
      var scismainAccount = nlapiLookupField('customrecord_scis_account', annexRecId, ['custrecord_domain', 'custrecord_site_id', 'custrecord_token', 'custrecord_program_type', 'custrecord_sub_domain_name', 'custrecord_annex_jwt_token_generation', 'custrecord_loyalty_primary_key', 'custrecord_annex_cloud_customer_script']);
      var domain = defVal(scismainAccount.custrecord_domain);
      var siteId = defVal(scismainAccount.custrecord_site_id);
      var sub = defVal(scismainAccount.custrecord_sub_domain_name);
      token = defVal(scismainAccount.custrecord_token);
      var jwtDomain = defVal(scismainAccount.custrecord_annex_jwt_token_generation);
      var inactiveCustscript = defVal(scismainAccount.custrecord_annex_cloud_customer_script);
		nlapiLogExecution('DEBUG', 'inactiveCustscript', inactiveCustscript);
      var primary_key = defVal(scismainAccount.custrecord_loyalty_primary_key);
      if (domain == '' || siteId == '' || token == '' || sub == '' || jwtDomain == '' || primary_key == '') {
        throw "Please Enter Account details in Annex cloud configuration Record";
      }
      if(inactiveCustscript != 'F' && nlapiGetFieldValue('giveaccess') != 'F' ) 
      {

        CustomerActions(type, domain, siteId, token, sub, jwtDomain, primary_key, annexRecId, multiSiteValue);
      }

    }

  } catch (e) {
    nlapiLogExecution('DEBUG', 'Exception', e);

  }
}

function CustomerActions(type, domain, siteId, token, sub, jwtDomain, primary_key, annexRecId, multiSiteValue) {

  var rcdType = nlapiGetRecordType();
  var customer_id = nlapiGetRecordId();
  var loyaltyId = defVal(nlapiGetFieldValue(primary_key));
  var optInStatus = defVal(nlapiGetFieldValue('custentity_annex_cloud_loyalty_program'));
  var email = defVal(nlapiGetFieldValue('email'));

  var extendedAttribute = {
    "entityId": customer_id
  };
  var a = {
    "User-Agent-x": "SuiteScript-Call"
  };
  //nlapiLogExecution('DEBUG','email====>',email);
  if (type == 'create' && optInStatus == '1' && loyaltyId && annexRecId) {

   

     

    var isInvd = nlapiGetFieldValue('isperson');
    //nlapiLogExecution('DEBUG','isInvd',isInvd);
    nlapiLogExecution('DEBUG', 'primary_key==>', primary_key);
    if (isInvd == 'T') {
      var first_name = defVal(nlapiGetFieldValue('firstname'));
      var last_name = defVal(nlapiGetFieldValue('lastname'));
    } else {
      var first_name = defVal(nlapiGetFieldValue('companyname'));
      var last_name = "";
    }

    /*if(!loyaltyId && optInStatus == 1){
    	throw loyaltyId+"can't be blank";
    }*/
    var checkEmail = checkDuplicateCustomer(loyaltyId);
    if (checkEmail) {
      throw "Duplicate Customer with same Loyalty id";
    }
    //var birthdayDate = "";
    var birthdayDate = nlapiGetFieldValue('custentity_annex_cloud_pi_birthday');
    nlapiLogExecution('DEBUG', 'birthday Date', birthdayDate);
    if (!birthdayDate) {
      //birthdayDate = nlapiStringToDate('0.0.0000');
      birthdayDate = "";

    }
    if (birthdayDate) {
      birthdayDate = formatDate(birthdayDate);
    }
    //var loyaltyannverdate = "";
    var loyaltyannverdate = nlapiGetFieldValue('custentity_annex_cloud_pi_loyalty_anvrsy');
    nlapiLogExecution('DEBUG', 'loyaltyannverdate=>', loyaltyannverdate);
    if (!loyaltyannverdate) {
      loyaltyannverdate = "";
    }
    if (loyaltyannverdate) {
      loyaltyannverdate = formatDate(loyaltyannverdate);
    }

    var createCustomerPayload = {
      "id": loyaltyId,
      "email": email,
      "firstName": first_name,
      "lastName": last_name,
      "optInStatus": "YES",
      "status": "ACTIVE",
      "birthDate": birthdayDate,
      "extendedAttribute": extendedAttribute
    };
    createCustomerPayload = JSON.stringify(createCustomerPayload);
	 createCustomerPayload  = createCustomerPayload.replace(/[\u007F-\uFFFF]/g, function(chr) {
     return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
 });
    jwtDomain = jwtDomain + '&annexcloudId=' + annexRecId;
    var jwtresponse = nlapiRequestURL(jwtDomain, createCustomerPayload, a);
    var userActivityUrl = domain + '/users';
    var str_JWT = defVal(jwtresponse.getBody());
    var str1 = str_JWT.replace(/\n|\r/g, '');
    var header = {
      "X-AnnexCloud-Site": siteId,
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + str1,

    }

    var createCustomerSt = {
      "id": loyaltyId,
      "email": email,
      "firstName": first_name,
      "lastName": last_name,
      "optInStatus": "YES",
      "status": "ACTIVE",
      "birthDate": birthdayDate,
      "extendedAttribute": extendedAttribute
    };
    createCustomerSt = JSON.stringify(createCustomerSt);
	 createCustomerSt  = createCustomerSt.replace(/[\u007F-\uFFFF]/g, function(chr) {
     return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
 });
    var userActivityObj = nlapiRequestURL(userActivityUrl, createCustomerSt, header);
    var getCode = defVal(userActivityObj.getCode());
    var userActivityRes = defVal(userActivityObj.getBody());
    var userActivityErrCode = userActivityRes.errorCode;

    if (userActivityErrCode) {
      var statusCode = userActivityRes.errorCode;
      var errorDescription = userActivityRes.errorMessage;
      var errSt = statusCode + ': ' + errorDescription;
      //throw errSt;
      nlapiLogExecution('DEBUG', 'ERROR while creating customer In AC', 'Create Customer AC==> ' + errSt);

    } else {
      try {

        rewardPoints('create', annexRecId)
        updateLoyaltyPointsNS(loyaltyId, customer_id, rcdType, domain, jwtDomain, siteId, annexRecId);
      } catch (e) {
        nlapiLogExecution('DEBUG', 'update Loyalty Point create exception', e);
      }

    }


  } // Create customer end 
  else if (type == 'edit') {

    var currentStatus = nlapiGetFieldValue('custentity_annex_cloud_loyalty_program');
    var oldRcd = nlapiGetOldRecord();
    var oldStatus = oldRcd.getFieldValue('custentity_annex_cloud_loyalty_program');
    var loyaltyId = defVal(nlapiGetFieldValue('custentity_annex_cloud_pi_loyalty_id'));
    var email = defVal(nlapiGetFieldValue('email'));
    
    
    
    if (!loyaltyId && currentStatus == '1') {

      var newloyaltyId = defVal(nlapiGetFieldValue(primary_key));
      var isInvd = nlapiGetFieldValue('isperson');
      //nlapiLogExecution('DEBUG','isInvd',isInvd);
      //nlapiLogExecution('DEBUG','primary_key==>',primary_key);
      if (isInvd == 'T') {
        var first_name = defVal(nlapiGetFieldValue('firstname'));
        var last_name = defVal(nlapiGetFieldValue('lastname'));
      } else {
        var first_name = defVal(nlapiGetFieldValue('companyname'));
        var last_name = "";
      }
      var checkEmail = checkDuplicateCustomer(newloyaltyId);
      if (checkEmail) {
        throw "Duplicate Customer with same Loyalty id";
      }
      var birthdayDate = nlapiGetFieldValue('custentity_annex_cloud_pi_birthday');
      if (!birthdayDate) {
      //  birthdayDate = nlapiStringToDate('0.0.0000');
       
       birthdayDate = "";
      }
      if (birthdayDate) {
        birthdayDate = formatDate(birthdayDate);
      }
      var loyaltyannverdate = nlapiGetFieldValue('custentity_annex_cloud_pi_loyalty_anvrsy');
      nlapiLogExecution('debug', 'loyaltyannverdate==>', loyaltyannverdate);
      if (!loyaltyannverdate) {
        loyaltyannverdate = "";
      }
      if (loyaltyannverdate != 'undefined') {
        loyaltyannverdate = formatDate(loyaltyannverdate);
        nlapiLogExecution('debug', 'loyaltyannverdate==>', loyaltyannverdate);
      }
      var createCustomerPayload = {
        "id": newloyaltyId,
        "email": email,
        "firstName": first_name,
        "lastName": last_name,
        "optInStatus": "YES",
        "status": "ACTIVE",
        "birthDate": birthdayDate,
        "extendedAttribute": extendedAttribute
      };
      createCustomerPayload = JSON.stringify(createCustomerPayload);
	  createCustomerPayload  = createCustomerPayload.replace(/[\u007F-\uFFFF]/g, function(chr) {
     return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
 });
      jwtDomain = jwtDomain + '&annexcloudId=' + annexRecId;
      var jwtresponse = nlapiRequestURL(jwtDomain, createCustomerPayload, a);
      var userActivityUrl = domain + '/users';
      var str_JWT = defVal(jwtresponse.getBody());
      var str1 = str_JWT.replace(/\n|\r/g, '');
      var header = {
        "X-AnnexCloud-Site": siteId,
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + str1

      }

      var createCustomerSt = {
        "id": newloyaltyId,
        "email": email,
        "firstName": first_name,
        "lastName": last_name,
        "optInStatus": "YES",
        "status": "ACTIVE",
        "birthDate": birthdayDate,
        "extendedAttribute": extendedAttribute
      };
      createCustomerSt = JSON.stringify(createCustomerSt);
	  createCustomerSt  = createCustomerSt.replace(/[\u007F-\uFFFF]/g, function(chr) {
     return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
 });
      nlapiLogExecution('debug', 'createCustomerSt284==>', createCustomerSt);
      var userActivityObj = nlapiRequestURL(userActivityUrl, createCustomerSt, header);
      var getCode = defVal(userActivityObj.getCode());
      var userActivityRes = defVal(userActivityObj.getBody());
      var userActivityErrCode = userActivityRes.errorCode;

      if (userActivityErrCode) {
        var statusCode = userActivityRes.errorCode;
        var errorDescription = userActivityRes.errorMessage;
        var errSt = statusCode + ': ' + errorDescription;
        //throw errSt;
        nlapiLogExecution('DEBUG', 'ERROR while creating customer In AC', 'Create Customer AC==> ' + errSt);

      } else {
        try {

          //loyaltyTier();
          rewardPoints('create', annexRecId);
          updateLoyaltyPointsNS(newloyaltyId, customer_id, rcdType, domain, jwtDomain, siteId, annexRecId);

        } catch (e) {
          nlapiLogExecution('DEBUG', 'update Loyalty Point create exception', e);
        }

      }


    }
    // IF LOYALTY ID IS BLANK AND USER WANT TO OPTIN 

    // OPT OUT CUSTOMER FROM LOYALTY PROGRAM//
    if (oldStatus == '1' && currentStatus == '2' && loyaltyId) {

      var createCustomerPayload = {
        "id": loyaltyId,
        "optInStatus": "NO",
        "status": "INACTIVE"
      };
      createCustomerPayload = JSON.stringify(createCustomerPayload);
      //nlapiLogExecution('DEBUG','createCustomerPayload',createCustomerPayload);
      jwtDomain = jwtDomain + '&annexcloudId=' + annexRecId;
      var jwtresponse = nlapiRequestURL(jwtDomain, createCustomerPayload, a);
      var str_JWT = defVal(jwtresponse.getBody());
      var str1 = str_JWT.replace(/\n|\r/g, '');
      nlapiLogExecution('DEBUG', 'str1', str1);
      var createCustomerPayload = {
        "id": loyaltyId,
        "optInStatus": "NO",
        "status": "INACTIVE"
      };
      //nlapiLogExecution('DEBUG','createCustomerSt',createCustomerSt);
      createCustomerPayload = JSON.stringify(createCustomerPayload);
      //nlapiLogExecution('DEBUG','createCustomerPayload',createCustomerPayload);
      var userActivityUrl = domain + '/users/' + loyaltyId;
      var header = {
        "X-AnnexCloud-Site": siteId,
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + str1

      }

      var responseObj = nlapiRequestURL(userActivityUrl, createCustomerPayload, header, 'PUT');
      var response = JSON.parse(defVal(responseObj.getBody()));
      var errCode = response.errorCode;
      //	nlapiLogExecution('DEBUG','userActivityUrl errCode===>',errCode);
      if (errCode) {
        var statusCode = response.errorCode;
        var errorDescription = response.errorMessage;
        var errSt = statusCode + ': ' + errorDescription;
        nlapiLogExecution('DEBUG', 'exception edit Customer', errSt);

      } else {
        updateLoyaltyPointsNS(loyaltyId, customer_id, rcdType, domain, jwtDomain, siteId, annexRecId);

      }

    }
    // END OF LOYALTY OPTOUT CODE

    if (currentStatus == '1' && loyaltyId) {

      var birthdayDate = nlapiGetFieldValue('custentity_annex_cloud_pi_birthday');
      var loyaltyannverdate = nlapiGetFieldValue('custentity_annex_cloud_pi_loyalty_anvrsy');
      if (loyaltyannverdate) {
        loyaltyannverdate = formatDate(loyaltyannverdate);
      }
      if (birthdayDate) {
        birthdayDate = formatDate(birthdayDate);
      }

      var isInvd = nlapiGetFieldValue('isperson');
      var first_name = ''
      var last_name = ''
      if (isInvd == 'T') {
        first_name = defVal(nlapiGetFieldValue('firstname'));
        last_name = defVal(nlapiGetFieldValue('lastname'));
      } else {
        first_name = defVal(nlapiGetFieldValue('companyname'));
      }

      // CHANGE THE LOYALTY PRIMARY ID// START OF CODE
      var oldloyaltyId = oldRcd.getFieldValue('custentity_annex_cloud_pi_loyalty_id');

      if (oldloyaltyId) {
        var loyaltyId = defVal(nlapiGetFieldValue(primary_key));
        if (oldloyaltyId != loyaltyId) {
          nlapiLogExecution('DEBUG', 'oldloyaltyId', oldloyaltyId);
          nlapiLogExecution('DEBUG', 'NEW loyaltyId', loyaltyId);
          var createCustomerPayload = {
            "id": oldloyaltyId,
            "updateId": loyaltyId,
            "email": email,
            "firstName": first_name,
            "lastName": last_name,
            "optInStatus": "YES",
            "status": "ACTIVE",
            "phone": phonenumber,
            "anniversaryDate": loyaltyannverdate,
            "birthDate": birthdayDate,
            "extendedAttribute": extendedAttribute
          };
          createCustomerPayload = JSON.stringify(createCustomerPayload);
		   
	 createCustomerPayload  = createCustomerPayload.replace(/[\u007F-\uFFFF]/g, function(chr) {
     return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
 });
          jwtDomain = jwtDomain + '&annexcloudId=' + annexRecId;
          var jwtresponse = nlapiRequestURL(jwtDomain, createCustomerPayload, a);
          var str_JWT = defVal(jwtresponse.getBody());
          var str1 = str_JWT.replace(/\n|\r/g, '');
          var createCustomerSt = {
            "id": oldloyaltyId,
            "updateId": loyaltyId,
            "email": email,
            "firstName": first_name,
            "lastName": last_name,
            "optInStatus": "YES",
            "status": "ACTIVE",
            "phone": phonenumber,
            "anniversaryDate": loyaltyannverdate,
            "birthDate": birthdayDate,
            "extendedAttribute": extendedAttribute
          };
          createCustomerSt = JSON.stringify(createCustomerSt);
		  createCustomerSt  = createCustomerSt.replace(/[\u007F-\uFFFF]/g, function(chr) {
     return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
 });
          var userActivityUrl = domain + '/users/' + oldloyaltyId;
          var header = {
            "X-AnnexCloud-Site": siteId,
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + str1

          }

          var responseObj = nlapiRequestURL(userActivityUrl, createCustomerSt, header, 'PUT');
          var response = JSON.parse(defVal(responseObj.getBody()));
          var errCode = response.errorCode;
          if (errCode) {
            var statusCode = response.errorCode;
            var errorDescription = response.errorMessage;
            var errSt = statusCode + ': ' + errorDescription;
            nlapiLogExecution('DEBUG', 'exception edit Customer', errSt);

          } else {
            updateLoyaltyPointsNS(loyaltyId, customer_id, rcdType, domain, jwtDomain, siteId, annexRecId);
          }

        }
      }

      // CHANGE THE LOYALTY PRIMARY ID// END OF CODE

      if (loyaltyId) {
        var phonenumber = nlapiGetFieldValue('phone');
        var createCustomerPayload = {
          "id": loyaltyId,
          "email": email,
          "firstName": first_name,
          "lastName": last_name,
          "optInStatus": "YES",
          "status": "ACTIVE",
          "phone": phonenumber,
          "anniversaryDate": loyaltyannverdate,
          "birthDate": birthdayDate,
          "extendedAttribute": extendedAttribute
        };
        createCustomerPayload = JSON.stringify(createCustomerPayload);
		 createCustomerPayload  = createCustomerPayload.replace(/[\u007F-\uFFFF]/g, function(chr) {
     return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
 });
        nlapiLogExecution('DEBUG','createCustomerPayload462==>',createCustomerPayload);
        jwtDomain = jwtDomain + '&annexcloudId=' + annexRecId;
        var jwtresponse = nlapiRequestURL(jwtDomain, createCustomerPayload, a);
        var str_JWT = defVal(jwtresponse.getBody());
        var str1 = str_JWT.replace(/\n|\r/g, '');
        //nlapiLogExecution('DEBUG','str1',str1);
        var createCustomerSt = {
          "id": loyaltyId,
          "email": email,
          "firstName": first_name,
          "lastName": last_name,
          "optInStatus": "YES",
          "status": "ACTIVE",
          "phone": phonenumber,
          "anniversaryDate": loyaltyannverdate,
          "birthDate": birthdayDate,
          "extendedAttribute": extendedAttribute
        };
        //nlapiLogExecution('DEBUG','createCustomerSt',createCustomerSt);
        createCustomerSt = JSON.stringify(createCustomerSt);
		 createCustomerSt  = createCustomerSt.replace(/[\u007F-\uFFFF]/g, function(chr) {
     return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
 });
        nlapiLogExecution('DEBUG','createCustomerSt482==>',createCustomerSt);
        var userActivityUrl = domain + '/users/' + loyaltyId;
        var header = {
          "X-AnnexCloud-Site": siteId,
          "Content-Type": "application/json",
          "Authorization": 'Bearer ' + str1

        }

        var responseObj = nlapiRequestURL(userActivityUrl, createCustomerSt, header, 'PUT');
        var response = JSON.parse(defVal(responseObj.getBody()));
        var errCode = response.errorCode;
        //nlapiLogExecution('DEBUG','userActivityUrl errCode===>',errCode)
        if (errCode) {
          var statusCode = response.errorCode;
          var errorDescription = response.errorMessage;
          var errSt = statusCode + ': ' + errorDescription;
          nlapiLogExecution('DEBUG', 'exception edit Customer', errSt)

        } else {
          updateLoyaltyPointsNS(loyaltyId, customer_id, rcdType, domain, jwtDomain, siteId, annexRecId);

        }

      }
      //----------End Create Customer ------------ 
    }
  }

}

function replace64bit(source) {
  encodedSource = source.replace('+/', '=');
  encodedSource = source.replace('-_', '');
  return encodedSource;
}

function getUserJWT(loyaltyId, jwtDomain, annexRecId) {
  //var extendedAttribute = {"multisiteConfiguration":annexRecId}
  var getCustomerPayload = loyaltyId //,"extendedAttribute":extendedAttribute};
  getCustomerPayload = JSON.stringify(getCustomerPayload);
  var a = {
    "User-Agent-x": "SuiteScript-Call"
  };
  //jwtDomain = jwtDomain+'&annexcloudId='+annexRecId;
  nlapiLogExecution('DEBUG', 'getUserJWT===>', jwtDomain);

  var jwtresponse = nlapiRequestURL(jwtDomain, getCustomerPayload, a);
  var str_JWT = defVal(jwtresponse.getBody());
  var str1 = str_JWT.replace(/\n|\r/g, '');
  return str1;
}

function updateLoyaltyPointsNS(loyaltyId, customer, rcdType, domain, jwtDomain, siteId, annexRecId) {
  var str1 = getUserJWT(loyaltyId, jwtDomain, annexRecId);

  var header = {
    "Authorization": 'Bearer' + " " + str1,
    "X-AnnexCloud-Site": siteId,
    "Content-Type": "application/json"
  }
  nlapiLogExecution('DEBUG', 'updateLoyaltyPointsNS', 'updateLoyaltyPointsNS');

  var updateLoyaltyPointsUrl = domain + '/points/' + loyaltyId;
  var updatePointsObj = nlapiRequestURL(updateLoyaltyPointsUrl, null, header, 'GET');
  var updatePointsRes = JSON.parse(defVal(updatePointsObj.getBody()));
  var updatePointsErrCode = updatePointsRes.errorCode;
  nlapiLogExecution('DEBUG', 'updatePointsErrCode====>', updatePointsErrCode);

  var tiersDetailsUrl = domain + '/users/' + loyaltyId + '/tiers';
  var updateTierssObj = nlapiRequestURL(tiersDetailsUrl, null, header, 'GET');
  var updateTiersRes = JSON.parse(defVal(updateTierssObj.getBody()));

  var updateTiersErrCode = updateTiersRes.errorCode;

  nlapiLogExecution('DEBUG', 'updateTiersRes====>', JSON.stringify(updateTiersRes));
  var userDetailsURL = domain + '/users/' + loyaltyId;
  var updateUserObj = nlapiRequestURL(userDetailsURL, null, header, 'GET');
  var updateUserRes = JSON.parse(defVal(updateUserObj.getBody()));
  var updateUserErrCode = updateUserRes.errorCode;

  nlapiLogExecution('DEBUG', 'updateUserErrCode====>', updateUserErrCode);


  if (updatePointsErrCode || updateUserErrCode || updateTiersErrCode) {
    var statusCode = updatePointsRes.errorCode;
    var errorDescription = updatePointsRes.errorMessage;
    var errSt = statusCode + ': ' + errorDescription;
    nlapiLogExecution('DEBUG', 'Update Loyalty information Customer exception', errSt);

  } else {
      
    var finalTier;
    // POINTS INFORMATION//
    var loyalty_id = defVal(updatePointsRes.id);
    var available_points = defVal(updatePointsRes.availablePoints);
    if (!available_points) {
      available_points = '';
    }
    var lifetime_points = defVal(updatePointsRes.lifetimePoints);
    if (!lifetime_points) {
      lifetime_points = '';
    }
    var used_points = defVal(updatePointsRes.usedPoints);
    if (!used_points) {
      used_points = '';
    }
    var hold_points = defVal(updatePointsRes.holdPoints);
    if (!hold_points) {
      hold_points = '';
    }
    var points_expired = defVal(updatePointsRes.expiredPoints);
    if (!points_expired) {
      points_expired = '';
    }
    var upcoming_points_expire_date = defVal(updatePointsRes.pointsToExpireDate);
    upcoming_points_expire_date = upcoming_points_expire_date.split(" "||"0")[0]
    
    if (!upcoming_points_expire_date) {
      upcoming_points_expire_date = '';
    }
    var points_expiring = defVal(updatePointsRes.pointsToExpire);
    if (!points_expiring) {
      points_expiring = '';
    }

    // Tiers Details 
    var current_tier = defVal(updateTiersRes.currentTier);
    if (!current_tier) {
      current_tier = '';
    }
    
      var loyalty_tier = '';
     if(current_tier == 'Silver Circle'){

          loyalty_tier = 1;
      }else if( current_tier == 'White Star'){

         loyalty_tier = 2;

      }else if(current_tier == 'Black Diamond'){

         loyalty_tier = 3;
      }
      //nlapiSetFieldValue('custentity_hf_loyalty_tier',loyalty_tier);

    
    var req_points_for_next_tier = defVal(updateTiersRes.nextTier);
    nlapiLogExecution('DEBUG', 'req_points_for_next_tier===>like Gold,silver',req_points_for_next_tier);
    if (!req_points_for_next_tier) {
      req_points_for_next_tier = '';
    }

   // var pointsToNextTier = defVal(updateTiersRes.pointsToNextTier);
    var spendAmountToNextTier = defVal(updateTiersRes.spendAmountToNextTier);
			var pointsToNextTier = defVal(updateTiersRes.pointsToNextTier);
			var tierpayload=JSON.stringify(updateTiersRes);
			nlapiLogExecution("debug",'tierpayload==>',tierpayload);
			
			nlapiLogExecution("debug",'spendAmountToNextTier value==>',spendAmountToNextTier);
			nlapiLogExecution("debug",'pointsToNextTier value==>',pointsToNextTier);

			if(spendAmountToNextTier){
				finalTier = spendAmountToNextTier;

			}else if(pointsToNextTier){
				finalTier = pointsToNextTier;
			}
            
			nlapiLogExecution("debug",'finalTier value==>',finalTier);
		
    nlapiLogExecution('DEBUG', 'pointsToNextTier==> actual points like 0,120 etc',pointsToNextTier);
    if (!pointsToNextTier) {
      pointsToNextTier = '';
    }
    if (!spendAmountToNextTier) {
      spendAmountToNextTier = '';
    }
    // USER Details 

    var customer_status = defVal(updateUserRes.status);
    var customer_OptIn = defVal(updateUserRes.optInStatus);
    var customer_birthday = defVal(updateUserRes.birthDate);
    var customer_anniversary = defVal(updateUserRes.anniversaryDate);

    if (customer_OptIn == 'YES') {
      customer_OptIn = 1;
    } else {
      customer_OptIn = 2;
    }
    if (rcdType != 'customer') {
      nlapiSubmitField('customer', customer, ['custentity_annex_cloud_pi_loyalty_id', 'custentity_annex_cloud_li_available_poin', 'custentity_annex_cloud_li_points_used', 'custentity_annex_cloud_hold_points', 'custentity_annex_cloud_li_points_expired', 'custentity_annex_cloud_lfetme_pnts', 'custentity_annex_cloud_li_pnt_to_nxt_rwd', 'custentity_annex_cloud_li_current_tier', 'custentity_annex_cloud_li_pnt_to_nxt_rwd', 'custentity_annex_cloud_li_up_pnts_ex_dte', 'custentity_annex_cloud_li_points_expirin', 'custentity_annex_cloud_pi_birthday', 'custentity_annex_cloud_pi_loyalty_anvrsy', 'custentity_annex_cloud_loyalty_program','custentity_annex_cloud_li_points_to_next'], [loyalty_id, available_points, used_points, hold_points, points_expired, lifetime_points, req_points_for_next_tier, current_tier,finalTier, upcoming_points_expire_date, points_expiring, customer_birthday, customer_anniversary, customer_OptIn,req_points_for_next_tier]);

    } else {
      var cust_obj = nlapiLoadRecord('customer', customer);
      cust_obj.setFieldValue('custentity_annex_cloud_pi_loyalty_id', defVal(loyalty_id));
      cust_obj.setFieldValue('custentity_annex_cloud_loyalty_program', customer_OptIn);
      cust_obj.setFieldValue('custentity_annex_cloud_li_available_poin', defVal(available_points)); //realtime
      cust_obj.setFieldValue('custentity_annex_cloud_lfetme_pnts', defVal(lifetime_points)); //realtime
      cust_obj.setFieldValue('custentity_annex_cloud_li_points_used', defVal(used_points)); //realtime
      cust_obj.setFieldValue('custentity_annex_cloud_li_current_tier', defVal(current_tier));
      cust_obj.setFieldValue('custentity_annex_cloud_li_points_to_next', defVal(req_points_for_next_tier));
      cust_obj.setFieldValue('custentity_annex_cloud_hold_points', defVal(hold_points));
      cust_obj.setFieldValue('custentity_annex_cloud_li_pnt_to_nxt_rwd', defVal(finalTier));
      cust_obj.setFieldValue('custentity_annex_cloud_li_points_expired', defVal(points_expired));
      cust_obj.setFieldValue('custentity_annex_cloud_li_up_pnts_ex_dte', defVal(upcoming_points_expire_date));
      cust_obj.setFieldValue('custentity_annex_cloud_li_points_expirin', defVal(points_expiring));
      cust_obj.setFieldValue('custentity_hf_loyalty_tier', defVal(loyalty_tier));
      //cust_obj.setFieldValue('custentity_annex_cloud_pi_birthday',defVal(customer_birthday));
      //cust_obj.setFieldValue('custentity_annex_cloud_pi_loyalty_anvrsy',defVal(customer_anniversary));
      nlapiSubmitRecord(cust_obj, true, true);
      nlapiLogExecution('DEBUG', 'updateLoyaltyPoints ends', 'updating fields ends')
    }


  }


}

function formatDate(date, dateformat) {
  if (date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');

  }

}

function checkDuplicateCustomer(loyaltyId) {
  var dupCusFilter = [];
  var dupCusColumn = [];
  dupCusFilter.push(new nlobjSearchFilter('custentity_annex_cloud_pi_loyalty_id', null, 'is', loyaltyId));
  dupCusColumn.push(new nlobjSearchColumn('internalid'));
  var dupRcd = nlapiSearchRecord('customer', null, dupCusFilter, dupCusColumn);
  if (dupRcd != null && dupRcd.length > 0) {
    return true
  } else {
    return false;
  }
}

function defVal(value) {

  if (value == null || value == undefined || value == 'undefined' || value == ' ' || value == 'NaN/NaN/NaN' || value == 'NaN') {
    value = '';
  } else {
    return value;
  }
}

function _logValidation(value) {
  if (value != null && value != '' && value != undefined && value != 'undefined' && value != 'NaN') {
    return true;
  } else {
    return false;
  }
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
        nlapiLogExecution('debug', 'resultSet===>', resultSet);
        var annexRecId = resultSet.getValue('internalid');

      }
    }

  }

  return annexRecId;
}