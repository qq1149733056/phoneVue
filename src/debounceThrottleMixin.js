// mixin.js
export default {
  directives:{
    focus:{
      mounted(el){
        el.focus()
      }
    },
    debounce:{
      mounted(el,binding){
        let timer = null;
        el.addEventListener('click',()=>{
          if(timer){
            clearTimeout(timer)
          }
          timer = setTimeout(()=>{
            binding.value()
          },1000)
        })
      }
    },
    throttle:{
      mounted(el,binding){
        let timer = null;
        el.addEventListener('click',()=>{
          if(timer){
            return
          }
          timer = setTimeout(()=>{
            binding.value()
            timer = null;
          },1000)
        })
      }
    }
  }
};