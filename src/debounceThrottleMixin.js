// mixin.js  需要防抖和节流时使用这个自定义指令
//如果使用自定义指令而且在传入的函数中有参数,需要用()=>,如:()=>showMessage('hello')
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