function htmlencode(string) {
    return string.toString()
        .replace(/\&/g,'&'+'amp;')
        .replace(/</g,'&'+'lt;')
        .replace(/>/g,'&'+'gt;')
        .replace(/\'/g,'&'+'apos;')
        .replace(/\"/g,'&'+'quot;');
}
var hasOwnProperty = Object.prototype.hasOwnProperty;

function is_empty(o) {
    if (!o) return false;
    if (o.length && o.length > 0)    return false;
    for (var key in o) {
        console.info(key);
        if (hasOwnProperty.call(o, key))    return false;
    }
    return true;
}

function formatJSON(obj) {
    switch(typeof(obj)){
    case 'string':
        return "\"<span class='json string'>"+htmlencode(obj.replace(/"/gm,"\\\""))+"</span>\"";
    case 'number':
        return "<span class='json number'>"+obj+"</span>";
    case 'boolean':
        return "<span class='json boolean'>"+obj+"</span>";
    case 'object':
        if(obj instanceof Array){
            var ret = "<span class='json bracket'>[</span>";
            if(!is_empty(obj)){
                ret += "<div class='json objblk'>";
                for(k in obj){
                    ret += "<div class='json kvpair'>";
                    var v = obj[k];
                    ret += formatJSON(v);
                    ret += ",</div>";        
                }
                ret = ret.substr(0,ret.length-7) + "</div></div>";
            }
            ret += "<span class='json bracket'>]</span>";
            return ret;
            
        }else{
            var ret = "<span class='json bracket'>{</span>";
            if(!is_empty(obj)){
                ret += "<div class='json objblk'>";
                for(k in obj){
                    ret += "<div class='json kvpair'>";
                    var v = obj[k];
                    ret += formatJSON(k);
                    ret += "<span class='json comma'>:</span>";
                    ret += formatJSON(v);
                    ret += ",</div>";        
                }
                ret = ret.substr(0,ret.length-7) + "</div></div>";
            }
            ret += "<span class='json bracket'>}</span>";
            return ret;
        }
    }
}

$(document).ready(function() {
    $('#refresh_via_post').click(function(event) {
        event.preventDefault();
        var access_token_uri = $('#access_token_uri').text();
        var client_id = $('#client_id').text();
        var client_secret = $('#client_secret').text();
        var refresh_token = $('#refresh_token').attr('rel');
        $.post('/cd',
               {'url': access_token_uri,
                'client_secret': client_secret,
                'client_id': client_id,
                'redirect_uri': 'http://127.0.0.1:8080',
                'grant_type': 'refresh_token',
                'refresh_token': refresh_token},
               function(data) {
                   var html_rst = formatJSON(data);
                   $('#refresh_via_post').parent().after(html_rst);
               },
               "json");
    });

    $('#auth_via_post').click(function(event) {
        event.preventDefault();
        var api_server = $('#api_server').text();
        var client_id = $('#client_id').text();
        var client_secret = $('#client_secret').text();
        var access_token = $('#access_token').attr('rel');
        $.post('/cd',
               {'url': api_server + '/account/verify_credentials.json',
                'oauth_token': access_token},
               function(data) {
                   var html_rst = formatJSON(data);
                   $('#auth_via_post').parent().after(html_rst);
               },
               "json");
    });

    $('#auth_via_get').click(function(event) {
        event.preventDefault();
        var api_server = $('#api_server').text();
        var client_id = $('#client_id').text();
        var client_secret = $('#client_secret').text();
        var access_token = $('#access_token').attr('rel');

        var url = api_server + '/account/verify_credentials.json?oauth_token=' + access_token;
        
        //send a get request now.
        $.get('/cd?url=' + url,
              function(data) {
                  var html_rst = formatJSON(data);
                  $('#auth_via_get').parent().after(html_rst);
              },
              "json");
    });
});