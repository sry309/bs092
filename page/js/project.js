$(function(){
    
    var user = getUser();
    var url = getUrl();
    

    
    var getProj = function()
    {
        $.ajax({
            type: "GET",
            url: url + "/System/Project?userid=" + user.id,
            //async: false,
            timeout: 20000,
            contentType: "application/xml",
            beforeSend: function (request) {
                request.setRequestHeader("passwd", user.pw);
            }
        }).done(function(data) {
            var $data = $(data);
            var errmsg = $data.find("error").text();
            if (errmsg !== "") 
                alert(errmsg);
            else
                loadProj($data.find('project'));
            
        }).fail(function(data) {
            alert('Network error!');
        });
    };
    
    var loadProj = function($list)
    {
        $('.list-row').remove();
        for(var i = 0; i < $list.length; i++)
        {
            var $elem = $list.eq(i);
            var name = $elem.find('name').text();
            var projName = name.split("/", 2)[1];
            var time = $elem.find('time').text();
            var status = parseInt($elem.find("privilege").text());
            status = statusMap[status];
            
            var $tr = $('<tr class="list-row"></tr>');
            var $nameTd = $('<td>' + projName + '</td>');
            var $timeTd = $('<td>' + time + '</td>');
            var $statusTd = $('<td>' + status + '</td>');
            var $opTd = $('<td></td>');
            $tr.append($nameTd);
            $tr.append($timeTd);
            $tr.append($statusTd);
            $tr.append($opTd);
            $('#list-table').append($tr);
        }
    };
    
    
    getProj();
});