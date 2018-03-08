jQuery(function($){
    if(localStorage.getItem('email')){
        $('#email').val(localStorage.getItem('email'));
    }
    $('#email').on('input', function(){
        var value = $('#email').val();
        if(value.trim()!=''){
            localStorage.setItem('email', value);
        }
    });
});
