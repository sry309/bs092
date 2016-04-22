$(function() {
    
    var id = localStorage.getItem('resultId');
    var type = localStorage.getItem('resultType');
    var rsrc = localStorage.getItem('resultRsrc');
    $('#rsrc-name').text(rsrc);
    
    $resultHeadTr = $('#result-head');
    if(type == 'assoc')
    {
        $('<th>关联规则</th>').appendTo($resultHeadTr);
        $('<th>支持度</th>').appendTo($resultHeadTr);
    }
    else if(type == 'classify' || type == 'cluster')
    {
        $('<th>id</th>').appendTo($resultHeadTr);
        $('<th>原始数据</th>').appendTo($resultHeadTr);
        $('<th>标签</th>').appendTo($resultHeadTr);
    }
    else
        throw new Error();

    
    var getResult = function() {
        $.ajax({
            type: "GET",
            url: "result/" + id + '/',
            dataType: "json"
        }).done(function(json) {
            if (!json.succ) 
                alert(json.errmsg);
            else
                loadResult(json.data);
        }).fail(function(data) {
            alert('Network error!');
        });
    };
    
    
    var loadResult = function(list) {
        
        
        $('.result-row').remove();
        for (var i = 0; i < list.length; i++) {
            var elem = list[i];
            
            var $tr = $('<tr class="result-row"></tr>')
            
            if(type == 'assoc')
            {
                var $ruleTd = $('<td>' + elem[2] + '</td>');
                var $confTd = $('<td>' + elem[1] + '</td>');
                $tr.append($ruleTd);
                $tr.append($confTd);
            }
            else if(type == 'cluster' || type == 'classify')
            {
                var $idTd = $('<td>' + elem[0] + '</td>');
                var $dataTd = $('<td>' + elem[2] + '</td>');
                var $labelTd = $('<td>' + elem[1] + '</td>');
                $tr.append($idTd);
                $tr.append($dataTd);
                $tr.append($labelTd);
            }
            else
                throw new Error();

            $('#result-table').append($tr);
        }
    };
    
    getResult();
});