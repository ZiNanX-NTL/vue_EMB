<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 头部搜索 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query"
                    clearable
                    @clear="getUserList">
            <template #append>
              <el-button icon="el-icon-search"
                         @click="getUserList"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary"
                     @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户数据表格 -->
      <el-table :data="userlist"
                :border="true"
                stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名"
                         prop="username"></el-table-column>
        <el-table-column label="邮箱"
                         prop="email"></el-table-column>
        <el-table-column label="电话"
                         prop="mobile"></el-table-column>
        <el-table-column label="角色"
                         prop="role_name"></el-table-column>
        <el-table-column label="状态"
                         width="65px">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state"
                       @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作"
                         width="180px">
          <template slot-scope="scope">
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini"
                       @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <el-tooltip effect="dark"
                        content="Top Center 提示文字"
                        placement="top"
                        :enterable="false">
              <el-button type="warning"
                         icon="el-icon-setting"
                         size="mini"></el-button>
            </el-tooltip>
          </template>

        </el-table-column>
      </el-table>

      <!-- 页码 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[1, 2, 5, 10]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户弹出对话框 -->
    <el-dialog title="添加用户"
               :visible.sync="addDialogVisible"
               width="30%"
               @close="addDialogClose">
      <!-- 主体 -->
      <el-form :model="addUserFrom"
               :rules="UserRules"
               ref="addFromRef"
               label-width="70px">
        <el-form-item label="用户名"
                      prop="username">
          <el-input v-model="addUserFrom.username"></el-input>
        </el-form-item>
        <el-form-item label="密码"
                      prop="password">
          <el-input v-model="addUserFrom.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱"
                      prop="email">
          <el-input v-model="addUserFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="手机"
                      prop="mobile">
          <el-input v-model="addUserFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="addUser">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改用户信息弹出对话框 -->
    <el-dialog title="修改信息"
               :visible.sync="editDialogVisible"
               width="30%"
               @close="editDialogClose">
      <!-- 主体 -->
      <el-form ref="editFromRef"
               :model="editFrom"
                :rules="UserRules"
               label-width="80px">
        <el-form-item label="用户名" >
          <el-input v-model="editFrom.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱"  prop="email">
          <el-input v-model="editFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="mobile">
          <el-input v-model="editFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
        <!-- 底部按钮 -->
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary"
                       @click="editUserInfo">确 定</el-button>
          </span>
        </template>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data () {
    // 验证邮箱的规则
    const checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则
      const regEmail = /^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/

      if (!regEmail.test(value)) return cb(new Error('请输入合法邮箱!'))
      cb()
    }
    const checkMobile = (rule, value, cb) => {
      // 验证邮箱的正则
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (!regMobile.test(value)) return cb(new Error('请输入合法手机号!'))
      cb()
    }

    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 显示数据大小
        pagesize: 2
      },
      userlist: [],
      total: 0,

      // 添加用户对话框显示隐藏
      addDialogVisible: false,
      // 修改用户信息对话框显示隐藏
      editDialogVisible: false,

      // 添加用户表单数据
      addUserFrom: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单的规则
      UserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },

      // 获取的修改用户信息,双向绑定
      editFrom: {}
    }
  },

  created () {
    this.getUserList()
  },

  methods: {
    // 请求用户列表数据
    async getUserList () {
      const { data: res } = await this.$http.get('/users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败!')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      // console.log(res)
    },

    // 监听改变显示页面数据的大小
    handleSizeChange (newSize) {
      // console.log(newSize)
      // 改变当前显示数据大小
      this.queryInfo.pagesize = newSize
      // 重新获取数据
      this.getUserList()
    },
    // 监听当前页码
    handleCurrentChange (newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      // 重新获取数据
      this.getUserList()
    },

    // 监听用户状态改变
    async userStateChanged (userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$Message.error('用户状态改变失败!')
      }

      this.$Message.success('用户状态改变成功!')
      // console.log(userinfo)
      console.log(res)
    },

    // 监听关闭添加用户对话框
    addDialogClose () {
      this.$refs.addFromRef.resetFields()
    },

    // 点击确定,预校验,添加用户
    addUser () {
      this.$refs.addFromRef.validate(async (value) => {
        if (!value) return
        const { data: res } = await this.$http.post('users', this.addUserFrom)
        console.log(res)
        if (res.meta.status !== 201) return this.$Message.error('添加用户失败!')
        this.$Message.success('添加用户成功!')
        // 关闭添加用户对话框
        this.addDialogVisible = false
        // 更新数据
        this.getUserList()
      })
    },

    // 展示修改用户信息对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$Message.error('请求数据失败!')
      // console.log(res.data)
      this.editFrom = res.data
      this.editDialogVisible = true
    },

    // 监听关闭修改用户信息对话框
    editDialogClose () {
      this.$refs.editFromRef.resetFields()
    },

    // 修改用户信息并提交
    editUserInfo () {
      // 预验证
      this.$refs.editFromRef.validate(async value => {
        if (!value) return
        // 发起修改用户信息的请求
        const { data: res } = await this.$http.put('users/' + this.editFrom.id, {
          email: this.editFrom.email,
          mobile: this.editFrom.mobile
        })

        if (res.meta.status !== 200) return this.$Message.error('更新用户信息失败!')

        // 关闭对话框
        this.editDialogVisible = false
        // 更新页面
        this.getUserList()
        // 提示成功
        this.$Message.success('更新用户信息成功!')
      })
    },

    // 删除用户
    async removeUserById (id) {
      const result = await this.$confirm('此操作将永久删除用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (result !== 'confirm') return this.$Message.info('您取消了删除')

      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$Message.error('删除用户失败!')

      // 更新页面
      this.getUserList()
      // 提示成功
      this.$Message.success('已删除该用户')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
