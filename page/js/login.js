$(function()
{
    var doLogin = function()
    {
        var un = $('#un-txt').val();
        var pw = $('#pw-txt').val();
        if(!un || !pw)
        {
            alert('用户名和密码不能为空！');
            return;
        }

        var url = getUrl();

        $.ajax({
            type: "GET",
            url: url + "/System/User?username=" + un + "&passwd=" + pw,
            dataType: "json",
            beforeSend: function (request) {
                request.setRequestHeader("passwd", pw);
            }        
        }).done(function (data) {
            if (data.error != null) {
                alert("登录失败！\n\nError: " + data.error.message);
                return;
            } 
            setUser(data.id, un, pw);
            location.href = './index.html';
        }).fail(function (XMLHttpRequest, textStatus, errorThrown) {
            alert('登录失败！\n\n' + textStatus + ": " + errorThrown);
        });
    };
    
    $('#lgn-btn').click(doLogin);
});