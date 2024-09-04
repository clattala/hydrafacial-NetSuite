<div>
<div id="socialannex_dashboard"></div>
<script type="text/javascript">
if("{{siteId}}"!="")
{
var sa_uni = sa_uni || [];
sa_uni.push(['sa_pg', '5']);
var sa_emailid = "{{email}}";
var firstname = "{{firstname}}";
var lastname = "{{lastname}}";
var siteID = "{{siteId}}";
var token = '{{accesstoken}}';

token = token.replace(/&#x3D;/g, "");
//token = token.replace('/', "");
console.log(token);
var n = token.length;
{
  if(n==232)
  {
    location.reload();
  }
}
function sa_async_load() 
{
	//console.log(sa_emailid);
//	console.log(token);
	//console.log(lastname);
//console.log(siteID);
//console.log(firstname);
	//console.log("In function");
  var sa = document.createElement('script');
  sa.type = 'text/javascript';sa.async = true;
  sa.src = 'https://cdn.socialannex.com/partner/{{siteId}}/universal.js';
  var sax = document.getElementsByTagName('script')[0];
  sax.parentNode.insertBefore(sa, sax);
  }
  sa_async_load();

  
}
</script>
    
</div>
