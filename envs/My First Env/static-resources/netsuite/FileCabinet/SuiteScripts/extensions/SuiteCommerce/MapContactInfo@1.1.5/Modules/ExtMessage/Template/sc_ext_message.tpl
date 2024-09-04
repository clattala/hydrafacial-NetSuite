{{#if showMessage}}
  <p class="ext-message-{{type}} alert" role="alert">
	  {{{message}}}
  	{{#if isClosable}}
	  	<button class="ext-message-button" data-action="ext-message-close-message" type="button" data-dismiss="alert"></button>
  	{{/if}}
  </p>
{{/if}}
