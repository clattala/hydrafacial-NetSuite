{{#each items}}
  <td class="comparison-thumbnail-item" data-itemid="{{internalid}}"
  align="center">
    <div class="thumbnail-container">
      <img src="{{resizeImage thumbnail.url 'thumbnail'}}" alt="{{altimagetext}}"
        data-loader="false" data-itemid="{{internalid}}">
    </div>
  </td>
{{/each}}
