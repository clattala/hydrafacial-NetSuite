/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Oct 2018     Rakesh K       Added code for check site configurations as well 
 * 1.00     21 Jul 2020     Rakesh K       Added code for multiSite configuration check for customer creation.
 *
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
 function customerValidation(type){
  
    var currentContext = nlapiGetContext();   
    if( (currentContext.getExecutionContext() != 'suitelet')){
  
      var annexCloudConfig = nlapiLookupField('customrecord_annex_cloud_site_details','1', ['custrecord_customer_site_account_type','custrecord_annex_multi_site_config']);
      var annexRecId = '';
      if(annexCloudConfig){
        
        var siteType = defVal(annexCloudConfig.custrecord_customer_site_account_type);
        //nlapiLogExecution('debug','siteType===>',siteType);
        var multiSiteid =  defVal(annexCloudConfig.custrecord_annex_multi_site_config);
        //nlapiLogExecution('debug','multiSiteid===>',multiSiteid);
        if(siteType == '1' && !multiSiteid){
          annexRecId = '1';
        }
        else{
          
          var field = nlapiGetField(multiSiteid);  
          nlapiLogExecution('DEBUG', 'field',field);
          var fieldtype = field.getType();    
          nlapiLogExecution('DEBUG', 'fieldtype',fieldtype);
          if(fieldtype == 'text'){
            var multiSiteValue = nlapiGetFieldValue(multiSiteid);
            nlapiLogExecution('DEBUG', 'multiSiteValue',multiSiteValue);
            annexRecId = annexConfiguration(multiSiteValue);
          }else{
          
            var multiSiteValue = nlapiGetFieldText(multiSiteid);
            nlapiLogExecution('DEBUG', 'multiSiteValue==>',multiSiteValue);
            if(!!multiSiteValue){
              //throw 'Please enter the value for '+ multiSiteid;
              annexRecId = annexConfiguration(multiSiteValue);
            }
            
          }
          
            
          
        }
      }
      
      if(annexRecId){
        
        var scisAccount = nlapiLookupField('customrecord_scis_account',annexRecId, ['custrecord_domain','custrecord_site_id','custrecord_token','custrecord_program_type','custrecord_sub_domain_name','custrecord_annex_jwt_token_generation','custrecord_loyalty_primary_key','custrecord_program_type','custrecord_annex_cloud_cust_validation']);
  
        if(scisAccount){
        var domain = defVal(scisAccount.custrecord_domain);
        var siteId = defVal(scisAccount.custrecord_site_id);
        var sub = defVal(scisAccount.custrecord_sub_domain_name);
        var token = defVal(scisAccount.custrecord_token);
        var jwtDomain = defVal(scisAccount.custrecord_annex_jwt_token_generation);
        var primary_key = defVal(scisAccount.custrecord_loyalty_primary_key);
        var program_type = defVal(scisAccount.custrecord_program_type);
        var inactiveCustValidation = defVal(scisAccount.custrecord_annex_cloud_cust_validation);
        nlapiLogExecution('DEBUG', 'inactiveCustValidation =>', inactiveCustValidation);
        if(domain =='' || siteId=='' || token =='' || sub =='' || jwtDomain=='' || primary_key=='' || program_type==''){
            throw "Please Enter Account details in Annex Account Record"
          }
                
        }
        if(inactiveCustValidation != 'F' && nlapiGetFieldValue('giveaccess') != 'F'){
            var loyaltyid = defVal(nlapiGetFieldValue(primary_key));
            nlapiLogExecution('debug','program_type===>',program_type);

          var optInStatus = nlapiGetFieldValue('custentity_annex_cloud_loyalty_program');
          if(!optInStatus){

                if(program_type == '1'){
                    nlapiSetFieldValue('custentity_annex_cloud_loyalty_program',1);
                }
                else if(program_type == '2'){
                    nlapiSetFieldValue('custentity_annex_cloud_loyalty_program',2);
                }
                else if(program_type == '3'){
                    nlapiSetFieldValue('custentity_annex_cloud_loyalty_program',2);
                }
        }
          
        
        var optin = defVal(nlapiGetFieldValue('custentity_annex_cloud_loyalty_program'));
        if(!loyaltyid && optin == '1'){
          throw primary_key + " can't be blank";
        }else if(type == 'create' && optin== '1' && loyaltyid){
          var checkCustomer = checkDuplicateCustomer(loyaltyid);
          if(checkCustomer){
            throw "Duplicate customer with same " + primary_key;
                }
        
                }
            }
       
      }
    } 
    
  }
  
  function annexConfiguration(multiSiteValue){
    var annexRecId;
    
    if(multiSiteValue){
      
      var customrecord_scis_accountSearch = nlapiSearchRecord("customrecord_scis_account",null,
          [
            ["isinactive","is","F"], 
               "AND", 
            ["custrecord_multi_site_configuration_val","is",multiSiteValue]
          ], 
          [
             new nlobjSearchColumn("internalid").setSort(false), 
            
          ]
          );
          nlapiLogExecution('debug','customrecord_scis_accountSearch',customrecord_scis_accountSearch);
      //nlapiLogExecution('debug','customrecord_scis_accountSearch',customrecord_scis_accountSearch);
      if(customrecord_scis_accountSearch){
        for(var i=0; i<customrecord_scis_accountSearch.length; i++){
          var resultSet = customrecord_scis_accountSearch[i]; 
          nlapiLogExecution('debug','resultSet===>',resultSet);
           annexRecId = resultSet.getValue('internalid');
                  
        }
      }
      
    }
    nlapiLogExecution('debug','annexRecId 144===>',annexRecId);
    return annexRecId;
  }
  function defVal(value)
  {   
        if(value == null || value == undefined || value == 'undefined' || value == ' '){
        value = '';     
        }else{
        return value;
        }
  }
  
  function checkDuplicateCustomer(loyaltyid)
  {
  var dupCusFilter =[];
  var dupCusColumn =[];
  if(loyaltyid){
    dupCusFilter.push(new nlobjSearchFilter('custentity_annex_cloud_pi_loyalty_id', null,'is',loyaltyid));
    dupCusColumn.push(new nlobjSearchColumn('internalid'));
    var dupRcd = nlapiSearchRecord('customer',null, dupCusFilter, dupCusColumn);
    if(dupRcd != null && dupRcd.length>0)
    {
      return true ;
    }else{
      return false;
    }
  
  }
  }