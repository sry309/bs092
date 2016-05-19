$(function(){
    
    var uid = localStorage['id'];
    
    var getHistory = function() {
        $('#modal-loading').modal('show');
        $.ajax({
            type: "GET",
            url: "history/" + uid + '/',
            dataType: "json"
        }).done(function(json) {
            if (!json.succ) 
                alert(json.errmsg);
            else {
                loadHistory(json.data);
                $('#modal-loading').modal('hide');
            }
        }).fail(function(data) {
            alert('Network error!');
            $('#modal-loading').modal('hide');
        });
    };
    
    
    var loadHistory = function(list) {
        
        $('.history-row').remove();
        
        for(var i = 0; i < list.length; i++)
        {
            var elem = list[i];
            var url = getUrl() + '/Entity/' + elem.rsrc + '/';
            
            var $tr = $('<tr class="history-row"></tr>');
            var $idTd = $('<td class="history-id">' + elem.id + '</td>');
            var $rsrcTd = $('<td class="history-rsrc"><a href="' + url + '" target="_blank">' + elem.rsrc + '</a></td>');
            var $typeTd = $('<td class="history-type" data-type="' + elem.type + '">' + algoDict[elem.type] + '</td>');
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
        var rsrc = $(this).parent().parent().children('.history-rsrc').text();
        var type = $(this).parent().parent().children('.history-type').attr('data-type');
        localStorage.setItem('resultId', id);
        localStorage.setItem('resultRsrc', rsrc);
        localStorage.setItem('resultType', type);
        location.href = './result.html';
    }
    
    getHistory();
});