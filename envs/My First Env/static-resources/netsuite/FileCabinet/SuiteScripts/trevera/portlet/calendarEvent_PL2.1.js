/**
 *@NApiVersion 2.1
 *@NScriptType Portlet
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
        params.portlet.html = `<iframe style="height: 13in; width: 80%;" src="${SUITELET_URL}" frameBorder="0"></iframe>`
    }

    return {
      render
    };
  });