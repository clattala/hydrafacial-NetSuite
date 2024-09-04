<div class="swatch-type">
  {{#each (getColorCodes field item )}}
    {{#if this.code}}
      <label class="color-box" style="background-color: {{this.code}}"/>
    {{else}}
      <label class="picker">{{this.label}}</label>
    {{/if}}
  {{/each}}
</div>
