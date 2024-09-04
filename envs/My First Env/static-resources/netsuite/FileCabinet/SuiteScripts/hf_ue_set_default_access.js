          /**
           * @NApiVersion 2.1
           * @NScriptType UserEventScript
           * @NModuleScope SameAccount
           * @NAuthor Pavan Kaleruss
JIRA  ID      : CHN-663
Date          : 08/19/2024
Author        : Pavan Kaleru
Description   : To set the default Event access as public for the new Events 
*************************************************************/
          
          define(['N/search', 'N/record'], (search, record) => {


              function beforeLoad(context) {
                  try {
                      if (context.type == 'create') {
                          let eventRecord = context.newRecord;
                          log.debug('triggered')
                          eventRecord.setValue('accesslevel', 'PUBLIC')
                      }
                  } catch (error) {
                      log.error('Error while setting the Default access ', error.message)
                  }
              }

              return {
                  // beforeSubmit: beforeSubmit
                  beforeLoad: beforeLoad
              };
          });