var token = null;

async function fetchPost(url, body, contentType)
{
	return fetchPostWithToken(url, body, null, contentType);
}

async function fetchPostWithToken(url, body, user, contentType)
{
	if(url.length == 0)
		return;
	
	var header = {};
	if(contentType != null && contentType != "")
	{
		header = {"Content-Type": contentType};
		if(contentType == 'application/json')
			body = JSON.stringify(body);
	};
	if(token != null && user != null)
	{
		header.secrettoken = token;
		header.username = user;
	}
	
	var res = null;
	if(header != {})
	{
		res = await fetch(url, {
			method: 'POST',
			headers: header,
			body: body
		});
	}
	else
	{
		res = await fetch(url, {
			method: 'POST',
			body: body
		});
	}
	
	if(res.status == 429)
	{
		alert(res.statusText);
		return [res.status, {}, res.statusText];
	}
	var result = await res.json();
	if(res.status == 303 && result.error != null)
	{
		if(result.error.String != null)
			alert(result.error.String);
		else
			alert(result.error);
	}
	if(res.status == 303 && result.StatusCode != null)
	{
		if(result.StatusCode == 10509) // Expired
			alert('Token expired!\nPlease login again!\n');
		else if(result.StatusCode == 10508 || result.StatusCode == 10510)
			alert('Invalid Token!\nPlease login again!\n');
		document.location.href="./";
		return;
	}
	if(result.token)
		token = result.token;
	return [res.status, result.data, result.error];
}

async function fetchPostFileUpload(url, body)
{
	if(url.length == 0)
		return;
	
	var res = await fetch(url, {
		method: 'POST',
		body: body
	});
	var result = await res.json();
	if(res.status != 200 && result.error != null)
	{
		if(result.error.String != null)
			alert(result.error.String);
		else
			alert(result.error);
	}
	return [res.status, result.data, result.error];
}

export {
    fetchPostFileUpload,
	fetchPostWithToken,
	fetchPost
};