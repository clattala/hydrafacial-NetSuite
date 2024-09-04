/**
 *@NApiVersion 2.1
 *@NScriptType Portlet

 TBA 
 1. Display legends below the calendar and insert request legends in the async promise function
 2. Add ue/cs to render color picker in the employee record
 */

define(['N/search', 'N/runtime', 'N/url'], (search, runtime, url) => {

    function render(params) {

      const SUITELET_URL = url.resolveScript({
        deploymentId: 'customdeploy1',
        scriptId: 'customscript_full_io_calendar_sl',
        returnExternalUrl: false
      })

      log.debug('SUITELET_URL', SUITELET_URL)

        params.portlet.title = 'Custom Calendar Events';        
        params.portlet.html = `
        <iframe style="height: 15.5in; width: 100%;" src="${SUITELET_URL}" frameBorder="0" scrolling="no"></iframe>
        `
    }

    return {
      render
    };
  });