<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="消息提示的文案"
                type="info"
                center
                :closable="false"
                show-icon>
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200"
                :active="activeIndex - 0"
                finish-status="success"
                align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="100px"
               :label-position="'top'">

        <el-tabs :tab-position="'left'"
                 v-model="activeIndex"
                 :before-leave="beforeLeave"
                 @tab-click="tabClicked">
          <el-tab-pane label="基本信息"
                       name="0">
            <el-form-item label="商品名称"
                          prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格"
                          prop="goods_price">
              <el-input v-model="addForm.goods_price"
                        type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量"
                          prop="goods_number">
              <el-input v-model="addForm.goods_number"
                        type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量"
                          prop="goods_weight">
              <el-input v-model="addForm.goods_weight"
                        type="number"></el-input>
            </el-form-item>
            <!-- 级联选择框 -->
            <el-form-item label="商品分类"
                          prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat"
                           :options="cateList"
                           :props="cateProps"
                           @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品参数"
                       name="1">
            <!-- 渲染表单item项 -->
            <el-form-item :label="item.attr_name"
                          v-for="item in manyTableData"
                          :key="item.attr_id">
              <!-- 多选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb"
                             v-for="(cb , i) in item.attr_vals"
                             :key="i"
                             border></el-checkbox>
              </el-checkbox-group>

            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性"
                       name="2">
            <!-- 渲染表单item项 -->
            <el-form-item :label="item.attr_name"
                          v-for="item in onlyTableData"
                          :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片"
                       name="3">
            <!-- action表示图片要上传到的后台地址 -->
            <el-upload :action="uploadURL"
                       :on-preview="handlePreview"
                       :on-remove="handleRemove"
                       list-type="picture"
                       :headers="headerObj"
                       :on-success="handleSuccess">
              <el-button size="small"
                         type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容"
                       name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary"
                       class="addBtn"
                       @click="add">添加商品</el-button>
          </el-tab-pane>

        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览"
               :visible.sync="previewVisible"
               width="50%">
      <img :src="previewPath"
           alt=""
           class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data () {
    return {
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        // 商品分类所选的数组
        goods_cat: [],
        // 上传图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        // 商品参数数据
        attrs: []
      },
      // 添加商品表单的验证规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 获取到的所有商品分类列表数据
      cateList: [],
      // 级联选择器的配置对象
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 获取的动态参数数据列表
      manyTableData: [],
      // 获取的静态属性数据列表
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件header请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览路径
      previewPath: '',
      // 控制图片预览框的显示隐藏
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取所有商品的分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$Message.error('获取商品分类数据失败!')
      }

      // console.log(res.data)
      this.cateList = res.data
    },

    // 级联选择器选择项发生变化时触发
    handleChange () {
      // console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },

    // 标签页切换之前的钩子函数
    beforeLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$Message.error('请选择商品分类!')
        return false
      }
    },

    // 监听点击标签页事件
    async tabClicked () {
      // 判断是否点击商品参数标签页
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$Message.error('获取参数列表失败!')
        }

        // 处理获得的数据
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.trim() === '' ? [] : item.attr_vals.split(' ')
        })
        // console.log(res.data)

        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        // 判断是否点击商品属性标签页
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$Message.error('获取属性列表失败!')
        }
        // console.log(res.data)

        this.onlyTableData = res.data
      }
    },

    // 监听预览图片事件
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },

    // 监听删除图片事件
    handleRemove (file) {
      // console.log(file)
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2. 从 pics 数组中,找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath)
      // 3. 调用数组的 splice 方法,把图片信息对象,从pics 数组中移除
      this.addForm.pics.splice(i, 1)
      // console.log(this.addForm)
    },

    // 监听图片上传事件
    handleSuccess (response) {
      // console.log(response)
      // 1.拼接得到一个图片对象
      const picInfo = { pic: response.data.tmp_path }
      // 2.将图片信息对象,push到pics数组中
      this.addForm.pics.push(picInfo)
      // console.log(this.addForm)
    },

    // 添加商品
    add () {
      this.$refs.addFormRef.validate(async value => {
        if (!value) return this.$Message.error('请填写必要的表单项!')

        // 执行添加的业务逻辑
        // 深拷贝
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join()
        // 处理动态参数数据
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性数据
        this.onlyTableData.forEach((item) => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // console.log(this.addForm)
        console.log(form)

        // 发起请求添加商品(商品名称必须是唯一的)
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$Message.error('添加商品失败!')

        this.$Message.success('添加商品成功!')
        this.$router.push('/goods')
      })
    }
  },

  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2]
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 8px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.addBtn {
  margin-top: 15px;
}
</style>
