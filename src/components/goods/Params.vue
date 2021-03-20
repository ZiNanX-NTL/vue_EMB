<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意: 只允许为第三级分类设置相关参数!"
                type="warning"
                :closable="false"
                show-icon>
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类: </span>
          <!-- 选择商品分类的联级选择框 -->
          <el-cascader v-model="selectedKeys"
                       :options="cateList"
                       :props="cateProps"
                       @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName"
               @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数"
                     name="many">
          <el-button type="primary"
                     size="mini"
                     :disabled="isBtnDisabled"
                     @click="showAddDialog">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData"
                    border
                    stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals"
                        :key="i"
                        closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <!-- 文本输入框 -->
                <el-input class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else
                           class="button-new-tag"
                           size="small"
                           @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称"
                             prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini"
                           type="primary"
                           icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini"
                           type="danger"
                           icon="el-icon-delete"
                           @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>

            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性"
                     name="only">
          <el-button type="primary"
                     size="mini"
                     :disabled="isBtnDisabled"
                     @click="showAddDialog">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData"
                    border
                    stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals"
                        :key="i"
                        closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <!-- 文本输入框 -->
                <el-input class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else
                           class="button-new-tag"
                           size="small"
                           @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称"
                             prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini"
                           type="primary"
                           icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini"
                           type="danger"
                           icon="el-icon-delete"
                           @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>

            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog :title="'修改' + titleText"
               :visible.sync="addDialogVisible"
               width="30%"
               @close="addDialogClose">
      <!-- 添加表单 -->
      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="100px">
        <el-form-item :label="titleText"
                      prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog :title="'修改' + titleText"
               :visible.sync="editDialogVisible"
               width="30%"
               @close="editDialogClose">
      <!-- 修改表单 -->
      <el-form :model="editForm"
               :rules="editFormRules"
               ref="editFormRef"
               label-width="100px">
        <el-form-item :label="titleText"
                      prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择器的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        chilren: 'chilren'
      },
      // 级联选择框双向绑定到的数组
      selectedKeys: [],
      // 被激活的页签名称
      activeName: 'many',
      // 获取到的动态参数数据
      manyTableData: [],
      // 获取到的静态属性数据
      onlyTableData: [],
      // 控制添加参数对话框的显示隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加参数表单数据规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请添加参数名', trigger: 'blur' }
        ]
      },
      // 控制修改参数对话框的显示隐藏
      editDialogVisible: false,
      // 修改参数的表单数据对象
      editForm: {
        attr_name: ''
      },
      // 修改参数表单数据规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请添加参数名', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }

      this.cateList = res.data
    },

    // 级联选择框变化会触发这个事件
    handleChange () {
      this.getParamsData()
    },

    // tab点击事件的的处理函数
    handleTabClick () {
      // console.log(this.cateId, this.activeName)
      this.getParamsData()
    },

    // 获取参数的数据列表
    async getParamsData () {
      // console.log(this.selectedKeys)
      if (this.selectedKeys.length !== 3) {
        // 清空被选中的数组
        this.selectedKeys = []
        // 清空动态参数数据列表
        this.manyTableData = []
        // 清空静态属性数据列表
        this.onlyTableData = []
      }
      // console.log(this.cateId, this.activeName)
      // 根据所选分类的id,和当前所处的面板,获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品参数列表失败!')
      }

      // 处理attr_vals数据
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 为每条数据分别添加控制文本输入框显示与隐藏的属性
        item.inputVisible = false
        // 为每条数据分别添加文本输入框的值属性
        item.inputValue = ''
      })
      // console.log(res.data)

      // 判断获取的是动态还是静态数据
      if (this.activeName === 'many') this.manyTableData = res.data
      else this.onlyTableData = res.data
    },

    // 点击按钮显示添加参数对话框
    showAddDialog () {
      this.addDialogVisible = true
    },

    // 监听添加参数对话框关闭事件
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },

    // 点击按钮,添加参数
    addParams () {
      this.$refs.addFormRef.validate(async (value) => {
        if (!value) return

        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) return this.$message.error('添加参数失败!')

        this.$message.success('添加参数成功!')
        this.getParamsData()
        this.addDialogVisible = false
      })
    },

    // 点击按钮显示修改参数对话框
    async showEditDialog (attrid) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrid}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取修改参数失败!')
      }

      this.editForm = res.data
      this.editDialogVisible = true
    },

    // 点击按钮,修改参数
    editParams () {
      this.$refs.editFormRef.validate(async (value) => {
        if (!value) return

        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) return this.$message.error('修改参数失败!')

        this.$message.success('修改参数成功!')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },

    // 监听修改参数对话框关闭事件
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },

    // 根据id删除对应的参数项
    async removeParams (attrid) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      // 用户取消了删除操作
      if (confirmResult !== 'confirm') { return this.$message.info('已取消了删除!') }

      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrid}`
      )
      if (res.meta.status !== 200) return this.$message.error('删除参数失败!')

      this.$message.success('删除参数成功!')
      this.getParamsData()
    },

    // 控制文本输入框的触发事件
    handleInputConfirm (row) {
      // 如果输入的内容无效,清空退出文本框并中断后续操作
      if (row.inputValue.trim() === '') {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      // 发起请求,保存修改
      this.saveAttrVals(row)
    },

    // 发起请求, 保存修改
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('修改参数失败!')

      this.$message.success('修改参数成功!')
    },

    // 显示文本输入框事件
    showInput (row) {
      row.inputVisible = true
      // 让文本输入框自动获取焦点
      // $nextTick 方法的作用,当页面被重新渲染之后,才会调用里面的回调函数
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    // 删除对应的参数可选项
    handleClose (i, row) {
      // 删除数组中对应的值
      row.attr_vals.splice(i, 1)

      // 发起请求,保存修改
      this.saveAttrVals(row)
    }
  },

  computed: {
    // 如果按钮需要被禁用,则返回true,否则则返回false
    isBtnDisabled () {
      if (this.selectedKeys.length !== 3) return true
      return false
    },
    // 当前选中的分类id
    cateId () {
      if (this.selectedKeys.length === 3) return this.selectedKeys[2]
      return null
    },
    // 动态计算对话框标题文本
    titleText () {
      if (this.activeName === 'many') return '动态参数'
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin-top: 15px;
}

.el-tag {
  margin: 7px;
}

.input-new-tag{
  width: 130px;
}
</style>
