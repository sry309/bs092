$(function() {
    
    var uid = localStorage['id'];
    
    var getEmail = function() {
        
        $('#modal-loading').modal('show');
        $.ajax({
            type: "GET",
            url: 'email/' + uid,
            dataType: "json"
        }).done(function(json) {
            if (!json.succ) 
                alert(json.errmsg);
            else
                $('#email-txt').val(json.data);
            $('#modal-loading').modal('hide');
        }).fail(function(data) {
            alert('Network error!');
            $('#modal-loading').modal('hide');
        });
        
    };
    
    var setEmail = function() {
        var $emailTxt = $('#email-txt');
        if(!$emailTxt[0].checkValidity())
        {
            alert('邮箱格式错误！');
            return;
        }
        
        var email = $emailTxt.val();
        
        $.ajax({
            type: "POST",
            url: 'email/' + uid + '/update/',
            data: 'email=' + email,
            contentType: "application/x-www-form-urlencoded",
            dataType: "json"
        }).done(function(json) {
            if (!json.succ) 
                alert(json.errmsg);
            else
                alert('设置成功！');
            $('#modal-loading').modal('hide');
        }).fail(function(data) {
            alert('Network error!');
            $('#modal-loading').modal('hide');
        });
    };
    $('#email-btn').click(setEmail);
    
    getEmail();
});