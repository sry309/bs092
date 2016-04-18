$(function(){
    
    
    var getHistory = function() {
        $.ajax({
            type: "GET",
            url: "result/",
            dataType: "json"
        }).done(function(json) {
            if (!json.succ) 
                alert(json.errmsg);
            else
                loadHistory(json.data);
        }).fail(function(data) {
            alert('Network error!');
        });
    };
    
    
    var loadHistory = function(list) {
        
        $('.history-row').remove();
        
        for(var i = 0; i < list.length; i++)
        {
            var elem = list[i];
            var rsrc = elem.uid + '/' + elem.proj + '/' + elem.rsrc;
            var url = getUrl() + '/Entity/' + rsrc + '/';
            
            var $tr = $('<tr class="history-row"></tr>');
            var $idTd = $('<td class="history-id">' + elem.id + '</td>');
            var $rsrcTd = $('<td><a href="' + url + '" target="_blank">' + rsrc + '</a></td>');
            var $typeTd = $('<td>' + algoDict[elem.type] + '</td>');
            var $timeTd = $('<td>' + elem.time + '</td>');
            var $opTd = $('<td></td>');
            var $viewAnchor = $('<a href="#" class="view-result">查看</a>');
            
            $opTd.append($viewAnchor);
            $tr.append($idTd);
            $tr.append($rsrcTd);
            $tr.append($typeTd);
            $tr.append($timeTd);
            $tr.append($opTd);
            $('#history-table').append($tr);
        }
        
        $('.view-result').click(viewResult);
    }
    
    var viewResult = function() {
        event.preventDefault();
        var id = $(this).parent().parent().children('.history-id').text();
        localStorage.setItem('resultId', id);
        location.href = 'result.html';
    }
    
    
    getHistory();
});