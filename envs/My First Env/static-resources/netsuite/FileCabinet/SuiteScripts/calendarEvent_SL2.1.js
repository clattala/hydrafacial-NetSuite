/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/file', 'N/search', './library/moment.min', './library/ns.utils', 'N/https', 'N/runtime'], (ui, file, search, moment, ns_utils, https, runtime) => {

    function _get(context) {
        let { request, response } = context
        log.debug('GET PARAMS', request.parameters)

        switch (request.parameters.service) {

            case 'searchEmployeeGroup':
                searchEmployeeGroup(context)
                break
            case 'searchEvents':
                searchEvents(context)
                break
            default:
                createForm(context)
                break
        }
    }

    function _post(context) {
        let { request, response } = context
        log.debug('POST PARAMS', request.parameters)

        switch (request.parameters.service) {
            case 'employeeMap':
                // employeeMap(context)
                break
        }
    }

    const createForm = context => {
        let form = ui.createForm({
            title: 'Hydrafacial Calendar',
            hideNavBar: true
        });
        let inlineHtml = form.addField({
            id: 'custpage_fullcalendar',
            type: ui.FieldType.INLINEHTML,
            label: 'FullCalenderIO'
        })
        inlineHtml.defaultValue = file.load({
            id: './calendarEventMain.html'
        }).getContents()
        context.response.writePage(form)
    }

    const searchEmployeeGroup = context => {
        let groups = []

        var entitygroupSearchObj = search.create({
            type: "entitygroup",
            filters:
            [
               ["grouptype","anyof","Employee"]
            ],
            columns:
            [
               search.createColumn({
                  name: "groupname",
                  sort: search.Sort.ASC,
                  label: "Name"
               }),
               search.createColumn({name: "grouptype", label: "Type"}),
               search.createColumn({name: "email", label: "Email"}),
               search.createColumn({name: "owner", label: "Owner"}),
               search.createColumn({name: "savedsearch", label: "Saved Search"}),
               //search.createColumn({name: "cseg_channel", label: "Channel"})
            ]
         });
         entitygroupSearchObj.run().each(function(result){
            groups.push({
                text: result.getValue('groupname'),
                value: result.id
            })
            return true;
         });
        log.debug('searchEmployeeGroup groups', groups)

        if (!context) return groups
        else context.response.write(JSON.stringify(groups))
    }

    const searchEvents = context => {
        let { request, response } = context
        let user = runtime.getCurrentUser()
        let params = request.parameters
        let { selectedUser, selectedGroup } = params

        let xFilter = []
        let organizers = []
        let empSearch = []

        if (selectedGroup == "me") {
            empSearch = employeeSearch(user.id, null)
        } else if (selectedGroup == "all") {
            let groups = searchEmployeeGroup()
            groups = groups.map(m => m.value)
            empSearch = employeeSearch(null, groups)
        } else {
            empSearch = employeeSearch(null, selectedGroup)
        }

        if (empSearch.length) {
            organizers = empSearch
            xFilter = [
                ["organizer","anyof",organizers.map(m=>m.id)]
            ]
        }
        log.debug('xFilter', xFilter)

        let calendareventSearchObj = search.create({
            type: "calendarevent",
            filters: xFilter,
            columns:
            [
               search.createColumn({
                  name: "title",
                  sort: search.Sort.ASC,
                  label: "Event"
               }),
               search.createColumn({name: "startdate", label: "Start Date"}),
               search.createColumn({name: "starttime", label: "Start Time"}),
               search.createColumn({name: "endtime", label: "End Time"}),
               search.createColumn({name: "owner", label: "Owner"}),
               search.createColumn({name: "organizer", label: "Organizer"}),
            //    search.createColumn({name: "custentity_custom_calendar_event_color", join: "owner"}), // Doesnt work
               search.createColumn({name: "status", label: "Status"}),
               search.createColumn({name: "markdone", label: "Mark"}),
               search.createColumn({name: "custevent_from_fullio_cal", label: "From Full IO Calendar"}),
            //    search.createColumn({name: "cseg_channel", label: "Channel"}),
               search.createColumn({name: "custevent_custom_field", label: "Custom Field"})
            ]
         });
         let events = []
         ns_utils.expandSearch(calendareventSearchObj).forEach(result => {
            let organizer = result.getValue('organizer')
            let idx = organizers.findIndex(fi => fi.id == organizer)
            let color = '#'+Math.floor(Math.random()*16777215).toString(16)//idx>-1?organizers[idx].color:'' //// Map color
            let startdate = moment(result.getValue('startdate')).format('YYYY-MM-DD')
            events.push({
                id: result.id,
                title: result.getValue('title'),
                start: moment(`${startdate} ${result.getValue('starttime')}`).format('YYYY-MM-DDTHH:mm'),
                end: moment(`${startdate} ${result.getValue('endtime')}`).format('YYYY-MM-DDTHH:mm'),
                url: `/app/crm/calendar/event.nl?id=${result.id}`,
                color,
                extendedProps: {
                    aaa: 'true',
                    test: '123',
                    organizer: result.getText('organizer'),
                    custfield: result.getValue('custevent_custom_field'),
                    group: selectedGroup,
                    color
                }
            })
         })
         log.debug('searchEvents', { length: events.length, events })
         response.write(JSON.stringify(events))
    }

    const employeeSearch = (id, grp) => {
        log.debug('employeeSearch args', { id, grp })
        return ns_utils.expandSearch(search.create({
            type:"employee",
            filters: (() => {
                if (id) return [["internalid","anyof",[id]]]
                else if (grp & grp.length) return [["group","anyof",[grp]]]
                else return []
            })(),
            columns: ["entityid"/* ,"custentity_custom_calendar_event_color" */]
        })).map(m => ({
            id: m.id,
            name: m.getValue('entityid'),
            color: ""//m.getValue('custentity_custom_calendar_event_color')
        }))
    }

    return {
        onRequest: context => {
            const router = {}
            router[https.Method.GET] = _get
            router[https.Method.POST] = _post
            const httpMethod = context.request.method;
            (router[httpMethod]) ? router[httpMethod](context): context.response.write("INVALID HTTP METHOD")
        }
    };
});