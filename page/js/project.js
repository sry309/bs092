$(function(){
    
    var user = getUser();
    var url = getUrl() + "/System/Project?userid=" + user.id;
    

    
    var getProj = function()
    {
        $.ajax({
            type: "GET",
            url: url,
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
        $('.proj-row').remove();
        for(var i = 0; i < $list.length; i++)
        {
            var $elem = $list.eq(i);
            var name = $elem.find('name').text();
            var tmp = name.split("/", 2);
            localStorage.setItem('token', tmp[0]);
            name = tmp[1];
            var time = $elem.find('time').text();
            var status = parseInt($elem.find("privilege").text());
            status = statusMap[status];
            
            var $tr = $('<tr class="proj-row"></tr>');
            var $nameTd = $('<td class="proj-name">' + name + '</td>');
            var $timeTd = $('<td>' + time + '</td>');
            var $statusTd = $('<td>' + status + '</td>');
            var $opTd = $('<td></td>');
            var $lookAnchor = $('<a href="#" class="proj-detail-btn">查看</a>');
            $opTd.append($lookAnchor);
            $tr.append($nameTd);
            $tr.append($timeTd);
            $tr.append($statusTd);
            $tr.append($opTd);
            $('#proj-table').append($tr);
        }
        $('.proj-detail-btn').click(seeProj);
    };
    
    var seeProj = function() {
        event.preventDefault();
        var proj = $(this).parent().parent().children('.proj-name').text();
        localStorage.setItem('proj', proj);
        location.href = './rsrc.html';
    };
    
    getProj();
});