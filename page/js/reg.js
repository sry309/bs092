$(function()
{
    var doReg = function()
    {
        var un = $('#un-txt').val();
        var pw = $('#pw-txt').val();
        var pw2 = $('#pw2-txt').val();
        if(!un || !pw)
        {
            alert('用户名和密码不能为空！');
            return;
        }
        if(pw != pw2)
        {
            alert('两次输入密码不一致！');
            return;
        }

        var url = getUrl();

        $.ajax({
            type: "POST",
            url: url + "/System/User",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({username: un, passwd: pw}),
            beforeSend: function (request) {
                request.setRequestHeader("passwd", pw);
            }        
        }).done(function (data) {
            if (data.error != null) {
                alert("登录失败！\n\nError: " + data.error.message);
                return;
            } 
            setUser(data.message, un, pw);
            location.href = './index.html';
        }).fail(function (XMLHttpRequest, textStatus, errorThrown) {
            alert('注册失败！\n\n' + textStatus + ": " + errorThrown);
        });
    };
    
    $('#reg-btn').click(doReg);
});