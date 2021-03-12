<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>管理权限</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesList"
                :border="true"
                stripe>

        <el-table-column type="expand">
          <!-- 权限展示 -->
          <template slot-scope="scope">
            <!-- 一级权限 -->
            <el-row :class="['bdbottom', i1 ===0 ? 'bdtop' :'','vcenter']"
                    v-for="(item1 , i1) in scope.row.children"
                    :key="item1.id">
              <el-col :span="5">
                <el-tag closable
                        @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 二级权限 -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop','vcenter']"
                        v-for="(item2, i2) in item1.children"
                        :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success"
                            closable
                            @close="removeRightById(scope.row,item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning"
                            v-for="item3 in item2.children"
                            :key="item3.id"
                            closable
                            @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称"
                         prop="roleName"></el-table-column>
        <el-table-column label="角色描述"
                         prop="roleDesc"></el-table-column>
        <el-table-column label="操作"
                         width="300px">
          <template slot-scope="scope">
            <el-button type="primary"
                       icon="el-icon-caret-right"
                       size="mini">编辑</el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini">删除</el-button>

            <el-button type="warning"
                       icon="el-icon-setting"
                       size="mini"
                       @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>

      </el-table>

      <!-- 分配权限对话框 -->
      <el-dialog title="分配权限"
                 :visible.sync="setRightDialogVisible"
                 width="50%"
                 @close="setRightDialogClose">
        <el-tree :data="rightList"
                 :props="treeProps"
                 default-expand-all
                 show-checkbox
                 node-key="id"
                 :default-checked-keys="defKeys"
                 ref="treeRef"></el-tree>

        <span slot="footer"
              class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="allotRight">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      rolesList: [],

      // 所有权限数据列表
      rightList: [],

      // 控制权限对话框显示隐藏
      setRightDialogVisible: false,

      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },

      // 树形控件默认选中id数组
      defKeys: [],

      // 分配权限时获取的角色id
      roleId: 0
    }
  },

  created () {
    this.getRolesList()
  },

  methods: {
    // 获取角色列表数据
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$Message.error('请求角色列表失败!')
      }

      // console.log(res.data)
      this.rolesList = res.data
    },

    // 根据id删除对应的权限
    async removeRightById (role, rightId) {
      const result = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      if (result !== 'confirm') return this.$Message.info('取消了删除')

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )

      if (res.meta.status !== 200) return this.$Message.error('删除权限失败!')

      // 提示
      this.$Message.success('删除权限成功!')
      // 更新权限数据
      role.children = res.data
    },

    // 显示设置权限对话框
    async showSetRightDialog (role) {
      // 保存打开对话框时的用户id
      this.roleId = role.id

      // 获取当前角色的所有数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) { return this.$Message.error('请求权限列表失败!') }

      this.rightList = res.data
      // console.log(res.data)

      // 获取三级节点的id
      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },

    // 递归函数,遍历获取角色下所有三级权限id,并保存至defKeys里
    getLeafKeys (node, arr) {
      // 如果当前节点下没有children属性,则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },

    // 监听权限对话框关闭事件
    setRightDialogClose () {
      // 清空当前角色权限数据
      this.defKeys = []
    },

    // 监听对话框确定按钮,分配权限
    async allotRight () {
      // 获取选中和半选中的id
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const iStr = keys.join()

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: iStr
        }
      )
      if (res.meta.status !== 200) { return this.$Message.error('分配角色权限失败!') }

      this.$Message.success('分配角色权限成功!')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
