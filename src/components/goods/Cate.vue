<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button type="primary"
                     @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-tabel class="treeTabel"
                  :data="cateList"
                  :columns="columns"
                  :selection-type="false"
                  :expand-type="false"
                  show-index
                  index-text="#"
                  :show-row-hover="false"
                  border>
        <!-- 是否有效 -->
        <template slot="isok"
                  slot-scope="scope">
          <i class="el-icon-success"
             v-if="scope.row.cat_deleted === false"
             style="color: lightgreen;"></i>
          <i class="el-icon-error"
             v-else
             style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order"
                  slot-scope="scope">
          <el-tag size="mini"
                  v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success"
                  size="mini"
                  v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning"
                  size="mini"
                  v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt"
                  slot-scope="">
          <el-button type="primary"
                     icon="el-icon-edit"
                     size="mini">编辑</el-button>
          <el-button type="danger"
                     icon="el-icon-delete"
                     size="mini">删除</el-button>
        </template>
      </tree-tabel>

      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[3, 5, 10, 15]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类"
               :visible.sync="addCateDialogVisible"
               width="30%"
               @close="addCateClose">
      <!-- 表单主体 -->
      <el-form :model="addCateForm"
               :rules="addCateFormRules"
               ref="addCateFormRef"
               label-width="100px">

        <el-form-item label="分类名称: "
                      prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类: ">
          <!-- options 级联选择器数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader v-model="selectedKeys"
                       :options="parentCateList"
                       :props="cascaderProps"
                       @change="parentCateChanged"
                       clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 请求商品分类的参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },

      // 分类列表数据
      cateList: [],

      // 总数居条数
      total: 0,

      // 为tabel指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'opt'
        }
      ],

      // 控制添加分类对话框的显示隐藏
      addCateDialogVisible: false,

      // 添加分类表单数据
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },

      // 添加分类表单验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },

      // 父级分类的列表
      parentCateList: [],

      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        // 父子不严格关联
        checkStrictly: true
      },

      // 级联选择器中的值id的数组
      selectedKeys: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$Message.error('请求商品分类列表失败!')
      }
      // console.log(res.data)

      // console.log(res)
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum改变事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 显示添加分类对话框
    showAddCateDialog () {
      // 显示前先获取父级分类列表
      this.getParentCateList()

      this.addCateDialogVisible = true
    },
    // 获取父级分类列表数据
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$Message.error('获取父级分类列表失败!')
      // console.log(res.data)

      this.parentCateList = res.data
    },
    // 选择项发生变化触发
    parentCateChanged () {
      // 改变添加分类表单数据
      // 如果选择父级分类
      if (this.selectedKeys.length > 0) {
        // 改变父id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 改变等级
        this.addCateForm.cat_level = this.selectedKeys.length
      } else { // 不选择父级分类
        this.addCateForm.cat_pid = 0
        // 改变等级
        this.addCateForm.cat_level = 0
      }
    },
    // 确定添加分类处理函数
    addCate () {
      // console.log(this.addCateForm)
      // 点击确定预校验
      this.$refs.addCateFormRef.validate(async value => {
        if (!value) return

        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$Message.error('添加分类失败!')

        this.$Message.success('添加分类成功!')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听添加分类对话框关闭事件
    addCateClose () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>
.treeTabel {
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}

</style>
