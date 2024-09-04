/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search', 'N/runtime', 'N/format', 'N/file', 'N/encode', 'N/query', 'N/record'], function(ui, search, runtime, format, file, encode, query, record) {
	function onRequest(context){
        var isExportToExcel = context.request.parameters.isexport;
        if(!isExportToExcel)
            displayReport(context);
        else
            createReportExcel(context);
    }
    function getRoleListSelectFields(role, context) {
        var listDetail = record.create({
            type: 'customrecord_hf_sox_field_detail',
            isDynamic: true
        });
        var roleList = listDetail.getField({
            fieldId: 'custrecord_roles_list'
        });

        var roleList = roleList.getSelectOptions();
        var contextRep = context.request.parameters;
        var delimiter = /\u0005/;
        var roleParam;
        if (context.request.method == 'GET') {
            roleParam = contextRep.role ? contextRep.role.split(delimiter) : '';
        } else {
            roleParam = contextRep.role.split(delimiter);
        }
      	if (roleParam.indexOf('noValue') >= 0){
            role.addSelectOption({ value: 'noValue', text: '- NONE -', isSelected: true });
        }else{
            role.addSelectOption({ value: 'noValue', text: '- NONE -' });
        }
        for (var i = 0; i < roleList.length; i++) {
            if (roleParam.indexOf(roleList[i].value) >= 0)
                role.addSelectOption({ value: roleList[i].value, text: roleList[i].text, isSelected: true });
            else
                role.addSelectOption({ value: roleList[i].value, text: roleList[i].text });
        }
    }
    function getSubsidiaryListSelectFields(subsidiary, context) {
        var listDetail = record.create({
            type: 'customrecord_hf_sox_field_detail',
            isDynamic: true
        });
        var subsidiaryList = listDetail.getField({
            fieldId : 'custrecord_hf_subsidiary_list'
        });

        var subsidiaryLists = subsidiaryList.getSelectOptions();
        var contextRep = context.request.parameters;

        var delimiter = /\u0005/;
        var subsidiaryParam;
        if (context.request.method == 'GET') {
            subsidiaryParam = contextRep.subsidiary ? contextRep.subsidiary.split(delimiter) : '';
        } else {
            subsidiaryParam = contextRep.subsidiary.split(delimiter);
        }
        for (var i=0; i<subsidiaryLists.length; i++){
            if (subsidiaryParam.indexOf(subsidiaryLists[i].value) >= 0)
                subsidiary.addSelectOption({ value: subsidiaryLists[i].value, text: subsidiaryLists[i].text, isSelected: true});
            else
                subsidiary.addSelectOption({ value: subsidiaryLists[i].value, text: subsidiaryLists[i].text});
        }
    }
  	function displayReport(context) {
        var form = createForm(context);
        var resultSublist = form.getSublist({ id: 'custpage_user' });
        //var data = employeeDetails(context);
        //var cust = customerDetails(context);
        var getDataone = getData(context);
        var count = 0;
        for (key in getDataone.allUniqEmp) {
            var roles = getDataone.allUniqEmp[key].role.toString();
            resultSublist.setSublistValue({ id: 'nameuser', line: count, value: getDataone.allUniqEmp[key].nameuser });
            resultSublist.setSublistValue({ id: 'title', line: count, value: getDataone.allUniqEmp[key].title });
            resultSublist.setSublistValue({ id: 'subsidiary', line: count, value: getDataone.allUniqEmp[key].subsidiary });

            if(getDataone.allUniqEmp[key].role.length > 0)
                resultSublist.setSublistValue({ id: 'role', line: count, value: roles});

            resultSublist.setSublistValue({ id: 'email', line: count, value: getDataone.allUniqEmp[key].email });
            resultSublist.setSublistValue({ id: 'department', line: count, value: getDataone.allUniqEmp[key].department });
            resultSublist.setSublistValue({ id: 'approver', line: count, value: getDataone.allUniqEmp[key].approver });
            resultSublist.setSublistValue({ id: 'phone', line: count, value: getDataone.allUniqEmp[key].phone });
            count++;
        }
        for (key in getDataone.allUniqCust) {
            var subs = getDataone.allUniqCust[key].subsidiary.toString();
            resultSublist.setSublistValue({ id: 'nameuser', line: count, value: getDataone.allUniqCust[key].nameuser });
            resultSublist.setSublistValue({ id: 'title', line: count, value: getDataone.allUniqCust[key].title });

            if(subs != '')
                resultSublist.setSublistValue({ id: 'subsidiary', line: count, value: subs });
          	if(getDataone.allUniqCust[key].role != '')
          		resultSublist.setSublistValue({ id: 'role', line: count, value: getDataone.allUniqCust[key].role });
          	if(getDataone.allUniqCust[key].email != '')
            	resultSublist.setSublistValue({ id: 'email', line: count, value: getDataone.allUniqCust[key].email });
          	if(getDataone.allUniqCust[key].department != '')
            	resultSublist.setSublistValue({ id: 'department', line: count, value: getDataone.allUniqCust[key].department });
          	if(getDataone.allUniqCust[key].approver != '')
            	resultSublist.setSublistValue({ id: 'approver', line: count, value: getDataone.allUniqCust[key].approver });
          	if(getDataone.allUniqCust[key].phone != '')
            	resultSublist.setSublistValue({ id: 'phone', line: count, value: getDataone.allUniqCust[key].phone });
          	
            count++;
          	if(getDataone.allUniqCust[key].hasOwnProperty('contact')){
              	//log.debug('getDataone.allUniqCust[key].contact', getDataone.allUniqCust[key].contact)
                for (contactData in getDataone.allUniqCust[key].contact) {
                  //log.debug('getDataone.allUniqCust[key].contact', getDataone.allUniqCust[key].contact[contactData]);
                  var contact = getDataone.allUniqCust[key].contact[contactData];
				  if(getDataone.allUniqCust[key].nameuser != '')
                  	resultSublist.setSublistValue({ id: 'nameuser', line: count, value: getDataone.allUniqCust[key].nameuser });
                  if(contact.title != '')
                  	resultSublist.setSublistValue({ id: 'title', line: count, value: contact.title });

                  if(getDataone.allUniqCust[key].subsidiary.length > 0)
                      resultSublist.setSublistValue({ id: 'subsidiary', line: count, value: contact.subsidiary });
				  if(contact.role != '')
                  	resultSublist.setSublistValue({ id: 'role', line: count, value: contact.role });
                  if(contact.email != '')
                  	resultSublist.setSublistValue({ id: 'email', line: count, value: contact.email });
                  if(getDataone.allUniqCust[key].department != '')
                  	resultSublist.setSublistValue({ id: 'department', line: count, value: getDataone.allUniqCust[key].department });
                  if(getDataone.allUniqCust[key].approver != '')
                  	resultSublist.setSublistValue({ id: 'approver', line: count, value: getDataone.allUniqCust[key].approver });
                  if(contact.phone != '')
                  	resultSublist.setSublistValue({ id: 'phone', line: count, value: contact.phone });
                  count++;
              }
           }
        }
      	if(count>0)
            resultSublist.setSublistValue({ id: 'nameuser', line: count, value: "<b>Total User - " + count.toString()+"</b>" });
        context.response.writePage(form);
    }
    function getData(context){
        var data = employeeDetails(context);
        var cust = customerDetails(context);
        var allUniqEmp = {};
        var allUniqCust = {};
      	var delimiter = /\u0005/;
      	var contextRep = context.request.parameters,
        role = contextRep.role;
      	role = contextRep.role ? contextRep.role.split(delimiter) : '';
        var listDetail = record.create({
            type: 'customrecord_hf_sox_field_detail',
            isDynamic: true
        });
        var roleList = listDetail.getField({
            fieldId: 'custrecord_roles_list'
        });
        var roleList = roleList.getSelectOptions();
        var roleNameList = [];
      	if (role.indexOf('noValue') >= 0){
            roleNameList.push(null);
        }
        for (var i = 0; i < roleList.length; i++) {
            if (role.indexOf(roleList[i].value) >= 0){
                roleNameList.push(roleList[i].text);
            }
        }
        for (var i = data.length - 1; i >= 0; i--){
            if(!allUniqEmp[data[i].id]){
                allUniqEmp[data[i].id] = {};

                allUniqEmp[data[i].id].nameuser = data[i].entityid;
                allUniqEmp[data[i].id].title = data[i].title;
                allUniqEmp[data[i].id].subsidiary = data[i].subsidiary;

                allUniqEmp[data[i].id].email = data[i].email;
                allUniqEmp[data[i].id].department = data[i].department;
                allUniqEmp[data[i].id].approver = data[i].superwiser;
                allUniqEmp[data[i].id].phone = data[i].phone;

                allUniqEmp[data[i].id].role = [];

                if(data[i].role != null)
                    allUniqEmp[data[i].id].role.push(data[i].role);
            }else{
                if(data[i].role != null)
                    allUniqEmp[data[i].id].role.push(data[i].role);
            }
        }
      	for (var i = cust.length - 1; i >= 0; i--) {
            var data = cust[i].toJSON();
            if (!allUniqCust[data.id]) {
                allUniqCust[data.id] = {};

                allUniqCust[data.id].nameuser = data.values['entityid'] + ' ' + data.values['altname'];
                allUniqCust[data.id].title = 'Customer';
                allUniqCust[data.id].email = data.values['email'];
                allUniqCust[data.id].department = data.values['CUSTENTITY1.name'];
                allUniqCust[data.id].approver = data.values['salesRep.entityid'];
                allUniqCust[data.id].phone = data.values['phone'];
                allUniqCust[data.id].subsidiary = data.values['mseSubsidiary.namenohierarchy'];
                // var repData = search.lookupFields({
                //     "type": "customer",
                //     "id": cust[i].id,
                //     "columns": ["role"]
                // });
                allUniqCust[data.id].role = data.values['role'];
                if (roleNameList.length > 0 && roleNameList.indexOf(data.values['role']) == -1) {
                    delete allUniqCust[data.id];
                }
            } else {
                allUniqCust[data.id].subsidiary = allUniqCust[data.id].subsidiary + ", " + data.values['mseSubsidiary.namenohierarchy'];
            }
        }
        return {allUniqEmp:allUniqEmp, allUniqCust:allUniqCust};
    }
    function createForm(context) {
        var form = ui.createForm({
            title: 'SOX REPORT BY ROLES'
        });
        var fieldgroup = form.addFieldGroup({
            id: 'fieldgroupid',
            label: 'Criteria'
        });
        var role = form.addField({
            id: 'role',
            type: ui.FieldType.MULTISELECT,
            label: 'Role',
            container: 'fieldgroupid'
        });
        getRoleListSelectFields(role, context);
      	var nameId = form.addField({
            id: 'name',
            type: ui.FieldType.TEXT,
            label: 'Name/User (Contains*)',
            container: 'fieldgroupid'
        });
        var contextRep = context.request.parameters;
        var nameIdParam = '';
        if (context.request.method == 'GET') {
            nameIdParam = contextRep.name ? contextRep.name : '';
        } else {
            nameIdParam = contextRep.name;
        }
        nameId.defaultValue = nameIdParam;
        var subsidiary = form.addField({
            id: 'subsidiary',
            type: ui.FieldType.MULTISELECT,
            label: 'Subsidiary',
            container: 'fieldgroupid'
        });
      	getSubsidiaryListSelectFields(subsidiary, context);
        var exportToExcelUrl = context.request.url + '?';
        var parameters = context.request.parameters;
        var params = '';
        for (var param in parameters) {
            if(['deploy','script','isexport', 'name', 'role', 'subsidiary'].indexOf(param) >= 0)
            params = params + param + '=' + parameters[param] + '&';
        }
        exportToExcelUrl = exportToExcelUrl + params;

        form.addPageLink({
            type : ui.FormPageLinkType.CROSSLINK,
            title : 'Export To Excel',
            url : exportToExcelUrl.indexOf("isexport=true") >= 0 ? exportToExcelUrl : exportToExcelUrl + "isexport=true"
        });

        var button = form.addSubmitButton({
            id: 'searchbutton',
            label: 'Submit',
            container: 'fieldgroupid'
        });

        var resultSublist = form.addSublist({
            id: 'custpage_user',
            type: ui.SublistType.LIST,
            label: 'Users'
        });

        resultSublist.addField({
            id: 'nameuser',
            type: ui.FieldType.TEXTAREA,
            label: 'Name/User'
        });
        resultSublist.addField({
            id: 'title',
            type: ui.FieldType.TEXTAREA,
            label: 'Title'
        });
        resultSublist.addField({
            id: 'subsidiary',
            type: ui.FieldType.TEXTAREA,
            label: 'Subsidiary'
        });
        resultSublist.addField({
            id: 'role',
            type: ui.FieldType.TEXTAREA,
            label: 'Role'
        });
        resultSublist.addField({
            id: 'email',
            type: ui.FieldType.TEXTAREA,
            label: 'Email'
        });
        resultSublist.addField({
            id: 'department',
            type: ui.FieldType.TEXTAREA,
            label: 'Department'
        });
        resultSublist.addField({
            id: 'approver',
            type: ui.FieldType.TEXTAREA,
            label: 'Approver'
        });
        resultSublist.addField({
            id: 'phone',
            type: ui.FieldType.TEXTAREA,
            label: 'Phone'
        });

        return form;
    }
    function employeeDetails(context) {
        var employeeReport = query.create({
            type: query.Type.EMPLOYEE
        });

        var subsidiaryColumn = employeeReport.autoJoin({
            fieldId: 'subsidiary'
        });

        var roleColumn = employeeReport.autoJoin({
            fieldId: 'rolesForSearch'
        });

        var SuperwiserColumn = employeeReport.autoJoin({
            fieldId: 'supervisor'
        });

        var DepartmentColumn = employeeReport.autoJoin({
            fieldId: 'department'
        });

      	var notInactive = employeeReport.createCondition({
            fieldId: 'isinactive',
            operator: query.Operator.IS,
            values: false
        });

        //var giveAccess = employeeReport.createCondition({
        //    fieldId: 'giveaccess',
        //    operator: query.Operator.IS,
        //    values: true
        //});

      	employeeReport.condition = employeeReport.and(
            notInactive
        );
		
		var contextRep = context.request.parameters,
            name = contextRep.name,
            role = contextRep.role,
            subsidiary = contextRep.subsidiary;
      	log.debug('contextRep.role',contextRep.role);
      	var delimiter = /\u0005/;
        subsidiary = subsidiary ? subsidiary.split(delimiter) : '';
      	role = role ? role.split(delimiter) : '';
		//log.debug('contextRep.name',contextRep.name);
		//log.debug('contextRep.subsidiary',contextRep.subsidiary);
      	//log.debug('contextRep.role',role);
      	log.debug("(role != undefined && role != '')",(role != undefined && role != ''));
        if (name != undefined && name != null && name != '') {
            var searchName = employeeReport.createCondition({
                fieldId: 'entityid',
                operator: query.Operator.CONTAIN,
                values: name
            });
            employeeReport.condition = employeeReport.and(
                searchName, notInactive
            );
        }
        if (role != undefined && role != '') {
          	if(role.indexOf("noValue")>=0){
                role[role.indexOf("noValue")] = null;
            }
            var searchRole = roleColumn.createCondition({
                fieldId: 'id',
                operator: query.Operator.ANY_OF,
                values: role
            });
          	log.debug('searchRole',searchRole);
            if (name != undefined && name != null && name != '') {
                employeeReport.condition = employeeReport.and(
                    searchName, notInactive, searchRole
                );
            } else {
                employeeReport.condition = employeeReport.and(
                    notInactive, searchRole
                );
            }
        }
        if (subsidiary != undefined && subsidiary != null && subsidiary != '') {
            var searchSubsidiary = employeeReport.createCondition({
                fieldId: 'subsidiary',
                operator: query.Operator.ANY_OF,
                values: subsidiary
            });
            if ((role != undefined && role != null && role != '')
                &&
                (name != undefined && name != null && name != '')) {
                    employeeReport.condition = employeeReport.and(
                        searchName, notInactive, searchRole, searchSubsidiary
                    );
            } else if (role != undefined && role != null && role != '') { 
                employeeReport.condition = employeeReport.and(
                    notInactive, searchRole, searchSubsidiary
                );
            } else if (name != undefined && name != null && name != '') { 
                employeeReport.condition = employeeReport.and(
                    searchName, notInactive, searchSubsidiary
                );
            } else { 
                employeeReport.condition = employeeReport.and(
                    notInactive, searchSubsidiary
                );
            }
        }
      	log.debug('',employeeReport.condition);
        // Create query columns
        employeeReport.columns = [
            employeeReport.createColumn({
                fieldId: 'entityid'
            }),
            employeeReport.createColumn({
                fieldId: 'title'
            }),
            employeeReport.createColumn({
                fieldId: 'phone'
            }),
            employeeReport.createColumn({
                fieldId: 'email'
            }),
            subsidiaryColumn.createColumn({
                fieldId: 'name',
                alias: 'subsidiary'
            }),
            DepartmentColumn.createColumn({
                fieldId: 'name',
                alias: 'department'
            }),
            SuperwiserColumn.createColumn({
                fieldId: 'entityid',
                alias: 'superwiser'
            }),
          	roleColumn.createColumn({
                fieldId: 'name',
                alias: 'role'
            }),
            employeeReport.createColumn({
                fieldId: 'id'
            })
        ];

        // Run the query
        var resultQuery = employeeReport.run().asMappedResults();
        return resultQuery;
    }
    function createReportExcel(context){
        var header = [
                        'NAME/USER',
                        'TITLE',
                        'SUBSIDIARY',
                        'ROLE',
                        'EMAIL',
                        'DEPARTMENT',
                        'APPROVER',
                        'PHONE'
                    ];
        var productName = 'SOX Report';
        if (context.request.method == 'GET') {
    
            var xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
            xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
            xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
            xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
            xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
            xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">';
    
            xmlStr += '<Styles>'
                + '<Style ss:ID="s63">'
                + '<Alignment ss:Horizontal="Left"/>'
                + '<Font ss:FontName="Verdana" x:Family="Swiss" ss:Size="9"/>'
                + '</Style>'
                + '<Style ss:ID="s64">'
                + '<Alignment ss:Horizontal="Right"/>'
                + '<Font ss:FontName="Verdana" x:Family="Swiss" ss:Size="9"/>'
                + '</Style>'
                + '<Style ss:ID="header">'
                + '<Alignment ss:Horizontal="Left"/>'
                + '<Font ss:Size="9" ss:Bold="1"/>'
                + '</Style>'
                + '<Style ss:ID="headerNumber">'
                + '<Alignment ss:Horizontal="Center"/>'
                + '<Font ss:Size="9" ss:Underline="Single"/>'
                + '</Style>'
                + '<Style ss:ID="bold1">'
                + '<Alignment ss:Horizontal="Left"/>'
                + '<Font ss:Size="9" ss:Bold="1"/>'
                + '</Style>'
                + '<Style ss:ID="s26">'
                + '<Alignment ss:Horizontal="Center" ss:Vertical="Bottom"/>'
                + '<Borders>'
                + '<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>'
                + '</Borders>'
                + '<Font ss:Size="9" ss:Bold="1"/>'
                + '</Style>'
                + '<Style ss:ID="NumberFormatS">'
                + '<Alignment ss:Horizontal="Right"/>'
                + '<Font ss:FontName="Verdana" x:Family="Swiss" ss:Size="9"/>'
                + '<NumberFormat ss:Format="Standard"/>'
                + '</Style>'
                + '<Style ss:ID="NumberFormatSPercent">'
                + '<Alignment ss:Horizontal="Right"/>'
                + '<Font ss:FontName="Verdana" x:Family="Swiss" ss:Size="9"/>'
                + '<NumberFormat ss:Format="Percent"/>'
                + '</Style>'
                + '<Style ss:ID="NumberFormatSBold">'
                + '<Alignment ss:Horizontal="Right"/>'
                + '<Font ss:FontName="Verdana" x:Family="Swiss" ss:Size="9" ss:Bold="1"/>'
                + '<NumberFormat ss:Format="Standard"/>'
                + '</Style>'
                + '</Styles>';
            xmlStr += '<Worksheet ss:Name="Sheet1">';
    
            xmlStr += '<Table>'
            xmlStr += '<Row>'
            for (var i = 0; i < header.length; i++) {
                xmlStr += '<Cell ss:StyleID="header" ><Data ss:Type="String">' + header[i] + '</Data></Cell>'
            }
            xmlStr += '</Row>'
            xmlStr += '<Row></Row>'
            var count = 0;
            var data = getData(context);
            for (key in data.allUniqEmp) {
                var roles = data.allUniqEmp[key].role.toString();
                xmlStr += '<Row>'
                xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqEmp[key].nameuser == null ? '' : data.allUniqEmp[key].nameuser) + '</Data></Cell>'
                xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqEmp[key].title == null ? '' : data.allUniqEmp[key].title) + '</Data></Cell>'
                xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqEmp[key].subsidiary == null ? '' : data.allUniqEmp[key].subsidiary) + '</Data></Cell>'

                if(data.allUniqEmp[key].role.length > 0)
                    xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (roles == null ? '' : roles) + '</Data></Cell>'
              	else
                    xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String"></Data></Cell>'
                
                xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqEmp[key].email == null ? '' : data.allUniqEmp[key].email) + '</Data></Cell>'
                xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqEmp[key].department == null ? '' : data.allUniqEmp[key].department) + '</Data></Cell>'
                xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqEmp[key].approver == null ? '' : data.allUniqEmp[key].approver) + '</Data></Cell>'
                xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqEmp[key].phone == null ? '' : data.allUniqEmp[key].phone) + '</Data></Cell>'
                xmlStr += '</Row>'
                count++;
            }
            for (key in data.allUniqCust) {
                xmlStr += '<Row>'  
                var subs = data.allUniqCust[key].subsidiary.toString();
    
                xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqCust[key].nameuser == null ? '' : data.allUniqCust[key].nameuser) + '</Data></Cell>'
                xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqCust[key].title == null ? '' : data.allUniqCust[key].title) + '</Data></Cell>'
    
                if(data.allUniqCust[key].subsidiary.length > 0)
                    xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (subs == null ? '' : subs) + '</Data></Cell>'
                
                xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqCust[key].role == null ? '' : data.allUniqCust[key].role) + '</Data></Cell>'
                xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqCust[key].email == null ? '' : data.allUniqCust[key].email) + '</Data></Cell>'
                xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqCust[key].department == null ? '' : data.allUniqCust[key].department) + '</Data></Cell>'
                xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqCust[key].approver == null ? '' : data.allUniqCust[key].approver) + '</Data></Cell>'
                xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqCust[key].phone == null ? '' : data.allUniqCust[key].phone) + '</Data></Cell>'
                xmlStr += '</Row>'
                count++;
                if(data.allUniqCust[key].hasOwnProperty('contact')){
                    log.debug('data.allUniqCust[key].contact', data.allUniqCust[key].contact)
                    for (contactData in data.allUniqCust[key].contact) {
                        xmlStr += '<Row>' 
                        log.debug('data.allUniqCust[key].contact', data.allUniqCust[key].contact[contactData]);
                        var contact = data.allUniqCust[key].contact[contactData];
    
                        xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqCust[key].nameuser == null ? '' : data.allUniqCust[key].nameuser) + '</Data></Cell>'
                        xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (contact.title == null ? '' : contact.title) + '</Data></Cell>'
    
                        if(data.allUniqCust[key].subsidiary.length > 0)
                            xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (contact.subsidiary == null ? '' : contact.subsidiary) + '</Data></Cell>'
    
                        xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (contact.role == null ? '' : contact.role) + '</Data></Cell>'
                        xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (contact.email == null ? '' : contact.email) + '</Data></Cell>'
                        xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqCust[key].department == null ? '' : data.allUniqCust[key].department) + '</Data></Cell>'
                        xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqCust[key].approver == null ? '' : data.allUniqCust[key].approver) + '</Data></Cell>'
                        xmlStr += '<Cell ss:StyleID="s63" ><Data ss:Type="String">' + (data.allUniqCust[key].phone == null ? '' : data.allUniqCust[key].phone) + '</Data></Cell>'
                        xmlStr += '</Row>'
                      	count++;
                    }
                }
            }
          	if(count > 0){
                xmlStr += '<Row>'
                xmlStr += '<Cell ss:StyleID="header" ><Data ss:Type="String">Total User - ' + count + '</Data></Cell>'
                xmlStr += '</Row>'
            }
            xmlStr += '</Table></Worksheet></Workbook>';

            var strXmlEncoded = encode.convert({
                string: xmlStr,
                inputEncoding: encode.Encoding.UTF_8,
                outputEncoding: encode.Encoding.BASE_64
            });

            var objXlsFile = file.create({
                name: productName + 'Result' + '.xls',
                fileType: file.Type.EXCEL,
                contents: strXmlEncoded
            });
    
            context.response.writeFile({
                file: objXlsFile
            });
        }
    }
	function customerDetails(context) {
        var contextRep = context.request.parameters,
            name = contextRep.name,
            role = contextRep.role,
            subsidiary = contextRep.subsidiary;
        var delimiter = /\u0005/;
        subsidiary = subsidiary ? subsidiary.split(delimiter) : '';
        role = role ? role.split(delimiter) : '';
        var filterData = [];
        if (name != undefined && name != null && name != '') {
            filterData = [
                ["isinactive", "is", "F"],
                "AND",
                ["access", "is", "T"],
                "AND",
                ["entityid", "contains", name]
            ];
        }
        if (role != undefined && role != null && role != '') {
            if (role.indexOf("noValue") >= 0) {
                role[role.indexOf("noValue")] = "@NONE@";
            }
            if (name != undefined && name != null && name != '') {
                filterData = [
                    ["isinactive", "is", "F"],
                    "AND",
                    ["access", "is", "T"],
                    "AND",
                    ["entityid", "contains", name],
                    "AND",
                    ["role", "anyof", role]
                ];
            } else {
                filterData = [
                    ["isinactive", "is", "F"],
                    "AND",
                    ["access", "is", "T"],
                    "AND",
                    ["role", "anyof", role]
                ];
            }
        }
        if (subsidiary != undefined && subsidiary != null && subsidiary != '') {
            if ((role != undefined && role != null && role != '')
                &&
                (name != undefined && name != null && name != '')) {
                filterData = [
                    ["isinactive", "is", "F"],
                    "AND",
                    ["access", "is", "T"],
                    "AND",
                    ["entityid", "contains", name],
                    "AND",
                    ["role", "anyof", role],
                    "AND",
                    ["msesubsidiary.internalid", "anyof", subsidiary]
                ];
            } else if (role != undefined && role != null && role != '') {
                filterData = [
                  	["isinactive", "is", "F"],
                    "AND",
                    ["access", "is", "T"],
                    "AND",
                    ["role", "anyof", role],
                    "AND",
                    ["msesubsidiary.internalid", "anyof", subsidiary]
                ];
            } else if (name != undefined && name != null && name != '') {
                filterData = [
                    ["isinactive", "is", "F"],
                    "AND",
                    ["access", "is", "T"],
                    "AND",
                    ["entityid", "contains", name],
                    "AND",
                    ["msesubsidiary.internalid", "anyof", subsidiary]
                ];
            } else {
                filterData = [
                    ["isinactive", "is", "F"],
                    "AND",
                    ["access", "is", "T"],
                    "AND",
                    ["msesubsidiary.internalid", "anyof", subsidiary]
                ];
            }
        }
        if (filterData.length == 0) {
            filterData = [
                ["isinactive", "is", "F"],
                "AND",
                ["access", "is", "T"]
            ];
        }
      	log.debug('filterData', filterData)
        var s = search.create({
            type: "customer",
            filters: filterData,
            columns:
                [
                    search.createColumn({ name: "entityid", label: "ID" }),
                    search.createColumn({ name: "altname", label: "Name" }),
                    search.createColumn({ name: "phone", label: "Phone" }),
                    search.createColumn({ name: "email", label: "Email" }),
                    search.createColumn({ name: "role", label: "Role" }),
                    search.createColumn({ name: "companyname", label: "Company Name" }),
                       search.createColumn({
                          name: "namenohierarchy",
                          join: "mseSubsidiary",
                          label: "Name (no hierarchy)"
                       }),
                    search.createColumn({
                        name: "name",
                        join: "CUSTENTITY1",
                        label: "Name"
                    }),
                    search.createColumn({
                        name: "entityid",
                        join: "salesRep",
                        label: "Name"
                    })
                ]
        });
        var searchResult = s.run().getRange(0, 1000);
        if (searchResult != null, searchResult != '', searchResult != ' ') {
            var completeResultSet = searchResult;
            var start = 1001;
            var last = 2001;
            while (searchResult.length === 1000) {
                searchResult = s.run().getRange(start, last);
                completeResultSet = completeResultSet.concat(searchResult);
                start = parseFloat(start) + 1000;
                last = parseFloat(last) + 1000;
            }
            searchResult = completeResultSet;
        }
        return searchResult;
    }
    return {
        onRequest: onRequest
    };
});

