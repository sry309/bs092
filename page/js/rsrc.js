$(function() {
    
    var getRsrc = function() {
        
        var proj = localStorage.getItem('proj');
        var projName = proj.split("/", 2)[1];
        $('#proj-name').text(projName);
        
        var user = getUser();
        var url = getUrl() + "/System/Resource/list?userid=" + user.id + "&project=" + proj;
        $.ajax({
            type: "GET", 
            url: url, 
            contentType: "application/xml",
            beforeSend: function (request) {
                request.setRequestHeader("passwd", user.pw);
            }
        }).done(function(data){
            var $data = $(data);
            var errmsg = $data.find("error").text();
            if (errmsg.length !== 0)
                alert(errmsg);
            else
                loadRsrc($(data).find("resource"));

        }).fail(function(data, status, e){
            alert("network error");
        });
    };
    
    var loadRsrc = function($list) {
        $('.proj-row').remove();
        for(var i = 0; i < $list.length; i++)
        {
            var $item = $list.eq(i);
            var name = $item.children('name').text();
            var status = $item.children('state').text();
            var lastModified = $item.children('lastmodified').text();
            
            var $tr = $('<tr class="rsrc-row"></tr>');
            var $nameTd = $('<td>' + name + '</td>');
            var $statusTd = $('<td>' + status + '</td>');
            var $lastTd = $('<td>' + lastModified + '</td>');
            var $opTd = $('<td></td>');
            $tr.append($nameTd);
            $tr.append($statusTd);
            $tr.append($lastTd);
            $tr.append($opTd);
            $('#rsrc-table').append($tr);
        }
    };
    
    
    getRsrc();
});