<template>
  <div :class="['img-crop-contaner',{'show':show}]">
    <div class="btn selPic" @click="selPic">
        <input type="file" @change="uploadexcel"/>
        选择图片
    </div>
    <button class="btn upload ml20" @click="sureSava">确定修改</button>
    <img src="@/assets/img/blank-avatar.png" class="img-crop-contaner-avatar" alt="" />
  </div>
  <div :class="['mask',{show}]" @click="show = false"></div>
</template>

<script>
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import {uploadfile,updateavatar} from '@/service'
export default {
  data() {
    return {
      show:false,
      cropper: null,
      filename: '',
      fileType: null
    };
  },
  mounted(){
      this.setAvatar()
  },
  props:['modelValue'],
  watch:{
    modelValue(val){
        console.log(val)
        this.show = val
    },
    show(val){
        this.$emit('update:modelValue',val)
    }
  },
  beforeUnmount(){
      this.show = false
      this.cropper.destroy()
      this.cropper = null
      this.filename = ''
  },
  methods: {
    selPic(e){
        // console.log(e.target)
        e.target.children[0]?.click()
    },
    sureSava() {
        if(this.filename==''){
            console.log('还未上传图片')
            return
        }
        let afterImg = this.cropper
        .getCroppedCanvas({
            imageSmoothingQuality: "high",
        })
        .toDataURL("image/jpeg");
        // console.log('crope', afterImg)
        // console.log('crope', this.convertBase64UrlToImgFile(afterImg,this.filename,this.fileType))
        // this.convertBase64UrlToImgFile(afterImg,'filename')
        const file = this.convertBase64UrlToImgFile(afterImg,this.filename,this.fileType)
        // console.log(file)
        this._uploadfile(file,this.filename,res=>{
            updateavatar({avatar:res.data.imgURL}).then(update_res=>{
                console.log(update_res)
                if(update_res.code==0){
                    console.log('修改成功')
                    this.$emit('getuserinfo')
                    this.show = false
                }
            })
        })
    },
    setAvatar() {
      const image = document.querySelector(".img-crop-contaner-avatar");
      this.cropper = new Cropper(image, {
        aspectRatio: 1,
        // initialAspectRatio: 1,
        // background: false,
        // autoCropArea: 0.5,
        // dragMode: "none",
        zoomOnWheel: false,
        ready() {
            // Do something here
            // ...
        
            // And then
            // this.cropper.crop();
        },
      });
    //   console.log(cropper);
    },
    reset(){
        this.cropper.reset()
    },
     // 上传
    uploadexcel (e) {
    //   console.log(e.target.files[0])
      this.filedata = {}
      let file = e.target.files[0]
      if (!/\.(png|jpg|PNG|JPG|jpeg|JPEG)$/.test(file.name)) {
        console.log('文件类型必须是.xlsx,xls中的一种')
        e.currentTarget.value = ''
        return
      }
      // 实例化
    //   this.file = file
        this._uploadfile(file,null,(res)=>{
            this.cropper.replace(res.data.imgURL)
        })
      // this.filedata = formdata
    },
    _uploadfile(file,filename,cb){
        let formdata = new FormData()
        formdata.append('file', file, filename)
        // console.log(file.name,file.type)
        uploadfile(formdata).then(res=>{
            this.filename = file.name
            this.fileType = file.type
            // this.filename = e.currentTarget.value
            // console.log(res.data.imgURL,'上传')
            cb&&cb(res)
        })
    },
    convertBase64UrlToImgFile(urlData,fileName,fileType='image/png') {
        var imgs = urlData.replace(/^data:image\/\w+;base64,/, "") //正则去除头部

        var bytes = window.atob(imgs); //转换为byte
        //处理异常,将ascii码小于0的转换为大于0
        var ab = new ArrayBuffer(bytes.length);
        var ia = new Int8Array(ab);
        var i;
        for (i = 0; i < bytes.length; i++) {
            ia[i] = bytes.charCodeAt(i);
        }
        //转换成文件，添加文件的type，name，lastModifiedDate属性
        var blob=new Blob([ab], {type:fileType});
        blob.lastModifiedDate = new Date();
        blob.name = fileName;
        return blob;
    }
  },
};
</script>

<style lang='scss'>
.img-crop-contaner {
  height: 300px;
  width: 300px;
  z-index:10000;
  position: fixed;
  left:0;
  right:0;
  top:40%;
  transform: translateY(-50%);
  margin: auto;
    //   display: none;
    visibility: hidden;
  &.show{
     visibility: visible;
  }
//   overflow: hidden;
    .upload{
        background: $blue;
        border-color:$blue;
        color:#fff;
    }
    .selPic{
        position: relative;
        background: #fff;
        color:#333;
        font-size: 12px;
        input[type='file']{
            position: absolute;
            visibility: hidden;
            width: 100%;
            height: 100%;
            left:0;
            top:0;
        }
    }
    .cropper-container{
        margin-top:20px;
    }
}
</style>