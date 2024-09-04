/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record', 'N/redirect', 'N/search', 'N/url','N/runtime'],
    function (serverWidget, record, redirect, search, url, runtime) {
        function onRequest(context) {

            var requestparam = context.request.parameters;
            var recId = requestparam.recId;
            if (context.request.method == 'GET') {
                var custrec = record.load({
                    type: record.Type.CUSTOMER,
                    id: recId,
                    isDynamic: true
                });
                var creditlimit = custrec.getValue({ fieldId: "custentity_hf_credit_limit" });
                log.debug('credit limit', creditlimit);
                var termsv = custrec.getValue({ fieldId: "terms" });
                var holdv = custrec.getValue({ fieldId: "creditholdoverride" });
                var taxregn = custrec.getValue({ fieldId: "vatregnumber" });
                var taxitemv = custrec.getValue({ fieldId: "taxitem" });
                var resalenum = custrec.getValue({ fieldId: "resalenumber" });
                var taxable = custrec.getValue({ fieldId: "taxable" });
                log.debug("taxable", taxable);
                var defaultinv = custrec.getValue({ fieldId: "custentity_hf_default_inv_email" });
                var ccinv1 = custrec.getValue({ fieldId: "custentity_hf_invemail_cc1" });
                var ccinv2 = custrec.getValue({ fieldId: "custentity_hf_invemail_cc2" });
                var ccinv3 = custrec.getValue({ fieldId: "custentity_hf_invemail_cc3" });
                // var ccinv4 = custrec.getValue({ fieldId: "custentity_cc_inv_email4" });
                // var ccinv5 = custrec.getValue({ fieldId: "custentity_cc_inv_email5" });
                var arrepv = custrec.getValue({ fieldId: "custentity_ar_rep" });
                var custlock = custrec.getValue({ fieldId: "custentity_hf_customer_credit_locked" });
                var autocust = custrec.getValue({ fieldId: "custentity_hf_invemail_receive_invoices" });
                var custSubsidiary = custrec.getValue({ fieldId: "subsidiary" });
                var numberOfAddress = custrec.getLineCount({ sublistId: 'addressbook' })
                var entitycodeidv;
                log.debug("address count", numberOfAddress);
                for (var x = 0; x < numberOfAddress; x++) {
                    var defaultaddress = custrec.getSublistValue({
                        sublistId: 'addressbook',
                        fieldId: 'defaultshipping',
                        line: x
                    });
                    log.debug("address defaultaddress", defaultaddress);
                    if (defaultaddress) {
                        entitycodeidv = custrec.getSublistValue({
                            sublistId: 'addressbook',
                            fieldId: "custpage_ava_entityusecode",
                            line: x
                        })
                        log.debug("address entitycodeidv", entitycodeidv);
                        break;
                    }
                }
                log.debug("entity codes", entitycodeidv);
                log.debug("Suitelet IDs: ", recId);
                log.debug("context.request.method IDs: ", context.request.method);

                var suiteletInternalUrl = url.resolveScript({
                    scriptId: 'customscript_hf_sl_update_cust_fin_flds',
                    deploymentId: 'customdeploy_hf_sl_update_custfinflds_01',
                    returnExternalUrl: false
                });

                var strVar = "";
                /* strVar += "<div class=\"header\" style=\"background-color:blue;width:50%;\">";
                 strVar += "  <h3 style=\"font-family:verdana;\">UPDATE FINANCE FIELDS<\/h3>";
                 strVar += "<\/div>";*/
                strVar += "<form class=\"form-horizontal\" method=\"post\" action=\"" + suiteletInternalUrl + "&recid=" + recId + "\">";
                strVar += "    <table style=\"line-height: 27px; font-family:Open Sans,Helvetica,sans-serif;font-size:12px;\">";
                strVar += "        <tbody>";
                strVar += "        <tr>";
                strVar += "        <th colspan=\"3\" style=\"background-color:#e0e6ef;width:50%;color:#5A6F8F;font-size:14px;font-family:Open Sans,Helvetica,sans-serif;\">UPDATE FINANCE FIELDS</th>";
                strVar += "        </tr>";
                strVar += "<tr></tr>";
                strVar += "        <tr style=\"line-height: 15px\">";
                strVar += "            <th style=\"text-align: left;font-weight: normal;\">TERMS<\/th>";
                strVar += "            <th style=\"text-align: left;font-weight: normal;\">CREDIT LIMIT<\/th>";
                strVar += "            <th style=\"text-align: left;font-weight: normal;\">AR REP<\/th>";
                strVar += "        </tr>";
                strVar += "        <tr>";
                strVar += "            <td>";
                strVar += " <select style=\"width: 44%;\" name=\"terms\" id=\"terms\">";
                var termSearchObj = search.create({
                    type: "term",
                    filters:
                        [
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "name",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search.createColumn({ name: "internalid", label: "Internal ID" })
                        ]
                });
                var searchResultCount = termSearchObj.runPaged().count;
                log.debug("termSearchObj result count", searchResultCount);
                strVar += " <option value=\"\"></option>";
                termSearchObj.run().each(function (result) {
                    var termid = result.getValue({ name: "internalid" });
                    var termname = result.getValue({ name: "name" });
                    if (termid == 1 || termid == 2 || termid == 3 || termid == 7 || termid == 9 || termid == 14 || termid == 16 || termid == 17 || termid == 18 || termid == 19 || termid == 20 || termid == 22 || termid == 58) {// (1,2,3,7,9,14,16,17,18,19,20,22,58)){
                        if (termid == termsv) {
                            strVar += "<option value=\"" + termid + "\" selected>" + termname + "</option>";
                        } else {
                            strVar += "<option value=\"" + termid + "\">" + termname + "</option>";
                        }
                    }
                    return true;
                });
                strVar += " </select>";
                strVar += "<\/td>";
                strVar += "            <td class=\"col-md-8\"><input class=\"form-control\" id=\"creditlimit\" placeholder=\"0.00\" value=\"" + creditlimit + "\" name=\"creditlimit\" type=\"text\" onchange=\"myFunction(this.value)\"<\/td>";

                strVar += "            <td>";
                strVar += "              <select style=\"width: 38%;\" name=\"arrep\" id=\"arrep\">";
                var employeeSearchObj = search.create({
                    type: "employee",
                    filters:
                        [
                            ["isinactive", "is", "F"]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "internalid", label: "Internal ID" }),
                            search.createColumn({
                                name: "entityid",
                                sort: search.Sort.ASC,
                                label: "Name"
                            })
                        ]
                });
                var searchResultCount = employeeSearchObj.runPaged().count;
                log.debug("employeeSearchObj result count", searchResultCount);
                strVar += "                <option value=\"\"></option>";
                employeeSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    var empid = result.getValue({ name: "internalid" });
                    var empname = result.getValue({ name: "entityid" });
                    if (arrepv == empid) {
                        strVar += "<option value=\"" + empid + "\" selected>" + empname + "</option>";
                    } else {
                        strVar += "<option value=\"" + empid + "\">" + empname + "</option>";
                    }
                    return true;
                });
                strVar += " </select>";
                strVar += "    <\/td>";
                strVar += "        <\/tr>";
                strVar += "        <tr>";
                strVar += "<th style=\"text-align: left;font-weight: normal; line-height: 15px;\"></th>";
                strVar += "<th style=\"text-align: left;font-weight: normal; line-height: 15px;\">HOLD<\/th>";
                strVar += "</tr>";
                strVar += "<tr>";

                if (custlock) {
                    strVar += "            <td class=\"col-md-8\" style=\"line-height: 15px;\"><input class=\"form-control\" id=\"custlock\" name=\"custlock\" type=\"checkbox\" checked>HF | CUSTOMER LOCKED<\/td>";
                } else {
                    strVar += "            <td class=\"col-md-8\" style=\"line-height: 15px;\"><input class=\"form-control\" id=\"custlock\" name=\"custlock\" type=\"checkbox\">HF | CUSTOMER LOCKED<\/td>";
                }
                strVar += "            <td class=\"col-md-4\" required >";
                strVar += "             <select style=\"width: 36%;\" name=\"hold\" id=\"hold\">";
                if (holdv == "AUTO") {
                    strVar += "                <option value=\"AUTO\" selected>Auto</option>";
                    strVar += "                <option value=\"ON\">On</option>";
                } else {
                    strVar += "                <option value=\"AUTO\">Auto</option>";
                    strVar += "                <option value=\"ON\" selected>On</option>";
                }
                //   strVar += "                <option value=\"OFF\">Off</option>";
                strVar += " </select>";
                strVar += "</tr>";

                strVar += "  <tr>";
                strVar += "<th colspan=\"3\" style=\"background-color:#e0e6ef;width:50%;color:#5A6F8F;font-size:15px;font-family:Open Sans,Helvetica,sans-serif;text-align: left\">Auto Invoice Email Recipients</th>";
                strVar += " </tr>";
                strVar += "<tr></tr>";
                strVar += "        <tr style=\"line-height: 15px\">";
                strVar += "<th style=\"text-align: left;font-weight: normal;\">DEFAULT INVOICE EMAIL</th>";
                strVar += "<th style=\"text-align: left;font-weight: normal;\">CC INVOICE EMAIL 1</th>";
                strVar += "<th style=\"text-align: left;font-weight: normal;\">CC INVOICE EMAIL 3</th>";
                strVar += "        <\/tr>";
                strVar += "        <tr>";
                strVar += "        <td class=\"col-md-4\"><input class=\"form-control\" id=\"defaultinvoice\" placeholder=\"Email address\" name=\"defaultinvoice\" value=\"" + defaultinv + "\" type=\"text\"><\/td>";
                strVar += "            <td class=\"col-md-8\"><input class=\"form-control\" id=\"ccinvoice1\" placeholder=\"Email address\" name=\"ccinvoice1\" value=\"" + ccinv1 + "\" type=\"text\"><\/td>";
                strVar += "            <td class=\"col-md-8\"><input class=\"form-control\" id=\"ccinvoice3\" placeholder=\"Email address\" name=\"ccinvoice3\" value=\"" + ccinv3 + "\" type=\"text\"><\/td>";
                strVar += "        </tr>";
                strVar += "<tr></tr>";
                strVar += "<tr style=\"line-height: 15px\">";
                strVar += "<th>";
                strVar += "<th style=\"text-align: left;line-height: 15px;font-weight: normal;\">CC INVOICE EMAIL 2</th>";

                strVar += "</tr>"
                strVar += "        <tr>";
                //strVar += "            <td>ENABLE AUTO CUSTOMER INVOICING<\/td>";
                if (autocust) {
                    strVar += "            <td class=\"col-md-8\"><input class=\"form-control\" id=\"autoinvoice\" name=\"autoinvoice\" type=\"checkbox\" checked>Enable Auto Customer Invoicing<\/td>";
                } else {
                    strVar += "            <td class=\"col-md-8\"><input class=\"form-control\" id=\"autoinvoice\" name=\"autoinvoice\" type=\"checkbox\">Enable Auto Customer Invoicing<\/td>";
                }
                strVar += "            <td class=\"col-md-8\"><input class=\"form-control\" id=\"ccinvoice2\" placeholder=\"Email address\" name=\"ccinvoice2\" value=\"" + ccinv2 + "\" type=\"text\"><\/td>";

                strVar += "        <\/tr>";
                strVar += "<tr></tr>";
                //     strVar += "        <tr style=\"line-height: 15px\">";
                //      strVar += "<th style=\"text-align: left;font-weight: normal;\">CC INVOICE EMAIL 1</th>";
                //     strVar += "<th style=\"text-align: left;font-weight: normal;\">CC INVOICE EMAIL 4</th>";
                //     strVar += "        <\/tr>";
                //     strVar += "        <tr>";
                //     strVar += "        <td class=\"col-md-4\"><input class=\"form-control\" id=\"ccinvoice1\" placeholder=\"Email address\" value=\"" + ccinv1 + "\" name=\"ccinvoice1\" type=\"text\"><\/td>";
                //     strVar += "            <td class=\"col-md-8\"><input class=\"form-control\" id=\"ccinvoice4\" value=\"" + ccinv4 + "\" placeholder=\"Email address\" name=\"ccinvoice4\" type=\"text\"><\/td>";
                //     strVar += "</tr>";
                //  strVar += "<p style=\"margin-bottom:4px;\"></p>";
                strVar += "  <tr>";
                strVar += "<th colspan=\"3\" style=\"background-color:#e0e6ef;width:50%;color:#5A6F8F;font-size:15px;font-family:Open Sans,Helvetica,sans-serif;text-align: left\">Tax Information</th>";
                strVar += " </tr>";
                strVar += "<tr></tr>";
                strVar += "        <tr style=\"line-height: 15px\">";
                strVar += "<th style=\"text-align: left;font-weight: normal;\">TAX REG. NUMBER</th>";
                strVar += "<th style=\"text-align: left;font-weight: normal;\">TAX ITEM</th>";
                strVar += "<th style=\"text-align: left;font-weight: normal;\">RESALE NUMBER</th>";

                strVar += "        <\/tr>";
                strVar += "        <tr>";
                strVar += "        <td class=\"col-md-4\"><input class=\"form-control\" id=\"taxreg\" placeholder=\"\" name=\"taxreg\" value=\"" + taxregn + "\" type=\"text\"><\/td>";
                strVar += "            <td>";
                strVar += "              <select style=\"width: 50%;\" name=\"taxitem\" id=\"taxitem\" >";
                var salestaxitemSearchObj = search.create({
                    type: "salestaxitem",
                    filters:
                        [
                            ["isinactive", "is", "F"],
                            "AND",
                            ["subsidiary", "anyof", custSubsidiary]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "internalid", label: "Internal ID" }),
                            search.createColumn({
                                name: "name",
                                sort: search.Sort.ASC,
                                label: "Name"
                            })
                        ]
                });
                var searchResultCount = salestaxitemSearchObj.runPaged().count;
                log.debug("salestaxitemSearchObj result count", searchResultCount);
                strVar += "                <option value=\"\"></option>";
                salestaxitemSearchObj.run().each(function (result) {
                    var taxid = result.getValue({ name: "internalid" });
                    var taxname = result.getValue({ name: "name" });
                    if (taxitemv == taxid) {
                        strVar += "<option value=\"" + taxid + "\" selected>" + taxname + "</option>";
                    } else {
                        strVar += "<option value=\"" + taxid + "\">" + taxname + "</option>";
                    }
                    return true;
                });
                strVar += " </select>";
                strVar += "    <\/td>";
                strVar += "            <td class=\"col-md-8\"><input class=\"form-control\" id=\"resale\" placeholder=\"\" name=\"resale\" value=\"" + resalenum + "\" type=\"text\"><\/td>";
                strVar += "        </tr>";
                strVar += "        <tr>";
                if (taxable) {
                    strVar += "            <td class=\"col-md-8\"><input class=\"form-control\" id=\"taxble\" name=\"taxble\" type=\"checkbox\" checked>TAXABLE<\/td>";
                } else {
                    strVar += "            <td class=\"col-md-8\"><input class=\"form-control\" id=\"taxble\" name=\"taxble\" type=\"checkbox\">TAXABLE<\/td>";
                }
                strVar += "</tr>";
                strVar += "  <tr>";
                strVar += "<th colspan=\"3\" style=\"background-color:#e0e6ef;width:50%;color:#5A6F8F;font-size:15px;font-family:Open Sans,Helvetica,sans-serif;text-align: left\">Address Entity Codes</th>";
                strVar += " </tr>";
                strVar += "<tr></tr>";
                strVar += "<tr>";
                strVar += "<th style=\"text-align: left;font-weight: normal;\">ENTITY/USE CODE</th>";
                strVar += "</tr>";
                strVar += "<tr>";
                strVar += "            <td>";
                strVar += " <select style=\"width: 50%;\" name=\"entitycode\" id=\"entitycode\">";
                var customrecord_avaentityusecodesSearchObj = search.create({
                    type: "customrecord_avaentityusecodes",
                    filters:
                        [
                            ["isinactive", "is", "F"]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "internalid", label: "Internal ID" }),
                            search.createColumn({
                                name: "name",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search.createColumn({ name: "custrecord_ava_entityusedesc", label: "Description" })
                        ]
                });
                var searchResultCount = customrecord_avaentityusecodesSearchObj.runPaged().count;
                log.debug("customrecord_avaentityusecodesSearchObj result count", searchResultCount);
                customrecord_avaentityusecodesSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    return true;
                });
                strVar += " <option value=\"\"></option>";
                customrecord_avaentityusecodesSearchObj.run().each(function (result) {
                    var entitycodeid = result.getValue({ name: "internalid" });
                    var entitycodename = result.getValue({ name: "name" });
                    var entitycodeDesc = result.getValue({ name: "custrecord_ava_entityusedesc" });
                    var entityFullName = entitycodename + " - " + entitycodeDesc;
                    if (entitycodeidv == entitycodeid) {
                        strVar += "<option value=\"" + entitycodeid + "\" selected>" + entityFullName + "</option>";
                    } else {
                        strVar += "<option value=\"" + entitycodeid + "\">" + entityFullName + "</option>";
                    }
                    return true;
                });
                strVar += " </select>";
                strVar += "<\/td>";
                strVar += "</tr>";
                strVar += "        <input name=\"custid\" value=\"" + recId + "\" type=\"hidden\">";
                strVar += "    <\/tbody><\/table>";
                strVar += "    <br>";
                strVar += "<td>";
                strVar += "    <button type=\"submit\" class=\"btn btn-inverse\" name=\"submit\" value=\"submit\" style=\"background-color:#4095fc;margin-left:1%;font-size:14px;color:white;padding:0 12px !important;height:4% !important;border-radius:6px;\">Save<\/button>";
                strVar += "    <button type=\"submit\" class=\"btn btn-inverse\" name=\"submit\" value=\"cancel\"style=\"background-color:#f0f0f0;margin-left:4%;font-size:14px;color:black;padding:0 12px !important;height:4% !important;border-radius:6px;\" onclick=\"location.href='https://6248126.app.netsuite.com/app/common/entity/custjob.nl?id=" + recId + "&whence='\">Cancel<\/button>";
                strVar += "</td>";
                strVar += "<\/form>";
                //strVar += '<script> function myFunction(value) { console.log(value.replace(/,/g, "")).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")</script>'
                strVar += '<script> function myFunction(value) { var number = parseInt(value.replace(/,/g, "")); console.log("first"+number); var formatter = new Intl.NumberFormat("en-US", {style: "currency",currency: "USD"});console.log("final"+formatter.format(number)); document.getElementById("creditlimit").value = formatter.format(value).substring(1);}</script>'
                //strVar += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js" > function myFunction(value) {  $("#creditlimit").on("change click keyup input paste",(function (event) { $(this).val(function (index, value) { return "$" + value.replace(/(?!\.)\D/g, "").replace(/(?<=\..*)\./g, "").replace(/(?<=\.\d\d).*/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");}); }));}</script>'
                

                // this.value =  this.value.toLocaleString()
                context.response.write(strVar)
            } else {
                log.debug("post data", context.request.parameters.custid + "h" + context.request.parameters.hold + "credit" + context.request.parameters.creditlimit + "term" + context.request.parameters.terms)
                log.debug("submit", context.request.parameters.submit);
                var button = context.request.parameters.submit;
                var custid = context.request.parameters.recid;
                var creditamount = context.request.parameters.creditlimit;
                var terms = context.request.parameters.terms;
                var hold = context.request.parameters.hold;
                var defaultinvoice = context.request.parameters.defaultinvoice;
                var ccinvoice1 = context.request.parameters.ccinvoice1;
                var ccinvoice2 = context.request.parameters.ccinvoice2;
                var ccinvoice3 = context.request.parameters.ccinvoice3;
              log.debug('defaultinvoice'  , defaultinvoice)
              log.debug('ccinvoice1'  , ccinvoice1)
              log.debug('ccinvoice2'  , ccinvoice2)
              log.debug('ccinvoice3'  , ccinvoice3)
                //     var ccinvoice4 = context.request.parameters.ccinvoice4;
                //     var ccinvoice5 = context.request.parameters.ccinvoice5;
                var autoinvoice = context.request.parameters.autoinvoice;
                var arrep = context.request.parameters.arrep;
                var taxreg = context.request.parameters.taxreg;
                var resale = context.request.parameters.resale;
                var taxble = context.request.parameters.taxble;
                var taxitem = context.request.parameters.taxitem;
                var customerlock = context.request.parameters.custlock;
                var entitycode = context.request.parameters.entitycode;
                log.debug("taxable", taxble);
                log.debug("entity code", entitycode);
                if (autoinvoice == "on") {
                    autoinvoice = true
                } else {
                    autoinvoice = false;
                }
                if (taxble == "on") {
                    taxble = true;
                } else {
                    taxble = false;
                }
                if (customerlock == "on") {
                    customerlock = true;
                } else {
                    customerlock = false;
                }
                log.debug("autoinvoice", autoinvoice);
                if (button == "submit") {
                  	var user = runtime.getCurrentUser();
                    var custrec = record.load({
                        type: record.Type.CUSTOMER,
                        id: custid,
                        isDynamic: true
                    });
                  	var currentUser = custrec.setValue({ fieldId: "custentity_hf_credit_limit_updated_by", value: user.id });
                  	creditamount = creditamount.replace(/\,/g,'');
                  	log.debug('creditamount' , creditamount)
                  	var creditlimit = custrec.setValue({ fieldId: "custentity_hf_credit_limit", value: creditamount });
                    var termsv = custrec.setValue({ fieldId: "terms", value: terms });
                    var holdv = custrec.setValue({ fieldId: "creditholdoverride", value: hold });
                    var taxregn = custrec.setValue({ fieldId: "vatregnumber", value: taxreg });
                    var taxitemv = custrec.setValue({ fieldId: "taxitem", value: taxitem });
                    var resalenum = custrec.setValue({ fieldId: "resalenumber", value: resale });
                    var taxable = custrec.setValue({ fieldId: "taxable", value: taxble });
                  	
                    var defaultinv = custrec.setValue({ fieldId: "custentity_hf_default_inv_email", value: defaultinvoice });
                    var ccinv2 = custrec.setValue({ fieldId: "custentity_hf_invemail_cc2", value: ccinvoice2 });
                    //     var ccinv5 = custrec.setValue({ fieldId: "custentity_cc_inv_email5", value: ccinvoice5 });
                    var ccinv3 = custrec.setValue({ fieldId: "custentity_hf_invemail_cc3", value: ccinvoice3 });
                    var ccinv1 = custrec.setValue({ fieldId: "custentity_hf_invemail_cc1", value: ccinvoice1 });
                    //     var ccinv4 = custrec.setValue({ fieldId: "custentity_cc_inv_email4", value: ccinvoice4 });
                    var arrepv = custrec.setValue({ fieldId: "custentity_ar_rep", value: arrep });
                    var autocust = custrec.setValue({ fieldId: "custentity_hf_invemail_receive_invoices", value: autoinvoice });
                    var numberOfAddress = custrec.getLineCount({ sublistId: 'addressbook' })
                    var entitycodeidv;
                    log.debug("address count", numberOfAddress);
                    for (var x = 0; x < numberOfAddress; x++) {
                        var defaultshipping = custrec.getSublistValue({
                            sublistId: 'addressbook',
                            fieldId: 'defaultshipping',
                            line: x
                        });
                        log.debug("address defaultaddress", defaultshipping);
                        if (defaultshipping) {
                            custrec.selectLine({
                                sublistId: "addressbook",
                                line: x
                            });
                            custrec.setCurrentSublistValue({
                                sublistId: 'addressbook',
                                fieldId: "custpage_ava_entityusecode",
                                value: entitycode
                            });
                            custrec.commitLine({
                                sublistId: "addressbook"
                            });
                            break;
                        }
                    }
                    custrec.save();
                }

                context.response.write("Customer Finance fields updated Successfully.")


                var outputUrl = url.resolveRecord({
                    recordType: 'customer',
                    recordId: custid,
                    isEditMode: false
                });
                log.debug('outputUrl', outputUrl);

                redirect.redirect({
                    url: outputUrl
                });
            }
        }


        return {
            onRequest: onRequest
        }
    });