jQuery(function($){
    $('#confirmPassword').css('visibility', 'hidden');
    $('#confirmPassword').hide();
    $('#profileCheckbox').on('change', function(){
        if(this.checked){
            $('#confirmPassword').show();
            $('#userInfo .text').each(function(){
                $(this).prop('disabled', false);
            });
            $('#confirmPassword').css('visibility', 'visible');
        }else{
            $('#confirmPassword').hide();
            $('#userInfo .text').each(function(){
                $(this).prop('disabled', true);
            });
            $('#confirmPassword').css('visibility', 'hidden');
        }
    });
});
