/*** 指令 ***/
import Vue from 'vue'
/**
 * demo
 */
Vue.directive('demo',{
    /**
     * 只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
     */
    bind(el, binding, vnode){
        console.log(el,binding,vnode)
    },
    /**
     * 被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
     */
    inserted(){

    },
    /**
     * 所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新 (详细的钩子函数参数见下)。
     */
    update(el, binding, vnode){
        console.log(el,binding,vnode)
    }
})
