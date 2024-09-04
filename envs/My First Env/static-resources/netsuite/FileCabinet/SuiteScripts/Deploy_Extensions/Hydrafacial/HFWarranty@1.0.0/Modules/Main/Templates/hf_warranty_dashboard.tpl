{{#if copyHeader}}
    {{{copyHeader}}}
{{/if}}
{{#if showWarranties}}
    <div class="hf-warranty-row hf-warranty-header-row">
        <p class="hf-warranty-asset-name">{{translate 'Asset Name'}}</p>
        <p class="hf-warranty-sku">{{translate 'SKU'}}</p>
        <p class="hf-warranty-item">{{translate 'Item'}}</p>
        <p class="hf-warranty-serial">{{translate 'Serial Number'}}</p>
        <p>{{translate 'Expiration Date'}}</p>
    </div>
    {{#each warranties}}
        <div class="hf-warranty-row">
            <p class="hf-warranty-asset-name">{{name}}</p>
            <p class="hf-warranty-sku">{{sku}}</p>
            <p class="hf-warranty-item">{{displayname}}</p>
            <p class="hf-warranty-serial">{{serialnumber}}</p>
            <p>{{expirationdate}}</p>
        </div>
    {{/each}}
{{else}}
    <p>{{translate 'You have no active warranties'}}</p>
{{/if}}
{{#if copyFooter}}
    {{{copyFooter}}}
{{/if}}