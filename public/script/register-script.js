jQuery(function($){
    $('.js-reg-info').each(function(index){
        if(localStorage.getItem('register' + index)){
            $(this).val(localStorage.getItem('register'+index));
        }
    });
    //store values of the input fields
    $('.js-reg-info').each(function(index){
        $(this).on('input', function(){
            var value = $(this).val();
            if(value.trim()!=''){
                localStorage.setItem('register'+index, value);
            }
        });
    });
});
