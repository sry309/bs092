$(function() {
    
    var uid = localStorage['id'];
    
    var getMessage = function(all) {
        
        $('#modal-loading').modal('show');
        var url = "message/" + uid + '/';
        if(all) url += 'all/';
        
        $.ajax({
            type: "GET",
            url: url,
            dataType: "json"
        }).done(function(json) {
            if (!json.succ) 
                alert(json.errmsg);
            else
                loadMessage(json.data);
            $('#modal-loading').modal('hide');
        }).fail(function(data) {
            alert('Network error!');
            $('#modal-loading').modal('hide');
        });
    };
    
    var loadMessage = function(list) {
        if(list.length == 0) {
            $('#msg-li').append('<div class="well well-lg">您目前没有任何消息</div>');
            return;
        }
        
        $('.msg-well').remove();
        for(var i = 0; i < list.length; i++) {
            var elem = list[i];
            var hid = /ID：(\d+)/.exec(elem.content)[1];
            
            var $well = $('<div class="well msg-well"></div>');
            $well.attr('data-id', elem.id);
            if(elem.isread) $well.addClass('msg-read');
            $link = $('<a href="history.html#' + hid + '" class="msg-link"></a>');
            $link.text(elem.content);
            $well.append($link);
            
            if(!elem.isread) {
                $markSpan = $('<a href="#" class="msg-mark">标记已读</a>')
                $well.append($markSpan);
            }
            
            $tmSpan = $('<span class="msg-tm"></span>');
            $tmSpan.text(elem.tm);
            $well.append($tmSpan);
            
            $('#msg-li').append($well);
        }
        $('.msg-mark').click(markRead);
        //$('.msg-link').click(viewResult);
    };
    
    var markRead = function() {
        event.preventDefault();
        var $well = $(this).parent()
        var id = $well.attr('data-id');
        
         $.ajax({
            type: "GET",
            url: 'message/' + uid + '/mark/' + id + '/',
            dataType: "json"
        }).done(function(json) {
            if (!json.succ) 
                alert(json.errmsg);
            else {
                $well.fadeOut("normal",function(){this.remove()});
            }
        }).fail(function(data) {
            alert('Network error!');
        });
    }
    
    /*var viewResult = function() {
        event.preventDefault();
        id = /ID：(\d+)/.exec($(this).text())[1];
        $.ajax({
            type: "GET",
            url: "history/" + uid + '/' + id + '/',
            dataType: "json"
        }).done(function(json) {
            if (!json.succ) 
                alert(json.errmsg);
            else {
                localStorage.setItem('resultId', id);
                localStorage.setItem('resultRsrc', json.data[0].rsrc);
                localStorage.setItem('resultType', json.data[0].type);
                location.href = './result.html';
            }
        }).fail(function(data) {
            alert('Network error!');
        });
    }*/
    
    getMessage(false);
});