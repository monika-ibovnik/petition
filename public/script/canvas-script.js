(function(){
    var blankCanvas = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAABkCAYAAACoy2Z3AAADmElEQVR4Xu3VsQ0AAAjDMPr/0/yQ2exdLKTsHAECBAgQCAILGxMCBAgQIHAC4gkIECBAIAkISGIzIkCAAAEB8QMECBAgkAQEJLEZESBAgICA+AECBAgQSAICktiMCBAgQEBA/AABAgQIJAEBSWxGBAgQICAgfoAAAQIEkoCAJDYjAgQIEBAQP0CAAAECSUBAEpsRAQIECAiIHyBAgACBJCAgic2IAAECBATEDxAgQIBAEhCQxGZEgAABAgLiBwgQIEAgCQhIYjMiQIAAAQHxAwQIECCQBAQksRkRIECAgID4AQIECBBIAgKS2IwIECBAQED8AAECBAgkAQFJbEYECBAgICB+gAABAgSSgIAkNiMCBAgQEBA/QIAAAQJJQEASmxEBAgQICIgfIECAAIEkICCJzYgAAQIEBMQPECBAgEASEJDEZkSAAAECAuIHCBAgQCAJCEhiMyJAgAABAfEDBAgQIJAEBCSxGREgQICAgPgBAgQIEEgCApLYjAgQIEBAQPwAAQIECCQBAUlsRgQIECAgIH6AAAECBJKAgCQ2IwIECBAQED9AgAABAklAQBKbEQECBAgIiB8gQIAAgSQgIInNiAABAgQExA8QIECAQBIQkMRmRIAAAQIC4gcIECBAIAkISGIzIkCAAAEB8QMECBAgkAQEJLEZESBAgICA+AECBAgQSAICktiMCBAgQEBA/AABAgQIJAEBSWxGBAgQICAgfoAAAQIEkoCAJDYjAgQIEBAQP0CAAAECSUBAEpsRAQIECAiIHyBAgACBJCAgic2IAAECBATEDxAgQIBAEhCQxGZEgAABAgLiBwgQIEAgCQhIYjMiQIAAAQHxAwQIECCQBAQksRkRIECAgID4AQIECBBIAgKS2IwIECBAQED8AAECBAgkAQFJbEYECBAgICB+gAABAgSSgIAkNiMCBAgQEBA/QIAAAQJJQEASmxEBAgQICIgfIECAAIEkICCJzYgAAQIEBMQPECBAgEASEJDEZkSAAAECAuIHCBAgQCAJCEhiMyJAgAABAfEDBAgQIJAEBCSxGREgQICAgPgBAgQIEEgCApLYjAgQIEBAQPwAAQIECCQBAUlsRgQIECAgIH6AAAECBJKAgCQ2IwIECBAQED9AgAABAklAQBKbEQECBAgIiB8gQIAAgSQgIInNiAABAgQExA8QIECAQBIQkMRmRIAAAQIC4gcIECBAIAkISGIzIkCAAIEH1vEAZa2gwc4AAAAASUVORK5CYII=`;
    var canvas = document.getElementById('js-canvas');
    var context = canvas.getContext('2d');

    function handleMouseMove(e){
        e.preventDefault();
        var x = e.pageX - canvas.getBoundingClientRect().left;
        var y = e.pageY - canvas.getBoundingClientRect().top;
        context.lineTo(x, y);
        context.stroke();
    }
    function handleMouseDown(e){
        context.moveTo(e.pageX, e.pageY);
        context.beginPath();
        canvas.addEventListener('mousemove', handleMouseMove);
    }
    function handleMouseUp(){
        canvas.removeEventListener('mousemove', handleMouseMove);
        var hidden = document.getElementById('hidden');
        if(canvas.toDataURL() != blankCanvas){
            hidden.value = canvas.toDataURL();
        }else{
            hidden.value = '';
        }
    }
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    function handleTouchStart(e){
        context.moveTo(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        context.beginPath();
        canvas.addEventListener('touchmove', handleTouchMove);
    }
    function handleTouchEnd(){
        canvas.removeEventListener('touchmove', handleTouchMove);
        var hidden = document.getElementById('hidden');
        if(canvas.toDataURL() != blankCanvas){
            hidden.value = canvas.toDataURL();
        }else{
            hidden.value = '';
        }
    }
    function handleTouchMove(e){
        e.preventDefault();
        var x = e.changedTouches[0].pageX - canvas.getBoundingClientRect().left;
        var y = e.changedTouches[0].pageY - canvas.getBoundingClientRect().top;
        context.lineTo(x, y);
        context.stroke();
    }
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);
})();
