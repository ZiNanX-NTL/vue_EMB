<template>
  <el-container>
    <!-- 头 -->
    <el-header>
      <div>
        <img src="../assets/biye.png"
             alt="">
        <span>毕业纪念册管理系统</span>
      </div>
      <el-button type="info"
                 @click="logout">退出</el-button>
    </el-header>

    <!-- 身体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button"
             @click="toggleCollapse">|||</div>
        <el-menu :unique-opened="true"
                 :collapse="isCollapse"
                 :collapse-transition="false"
                 :router="true"
                 :default-active="activePath"
                 background-color="#333744"
                 text-color="#fff"
                 active-text-color="#ffd04b">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''"
                      v-for="item in menulist"
                      :key="item.id">
            <!-- 一级菜单模板 -->
            <template #title>
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 描述 -->
              <span>{{item.authName}}</span>

            </template>
            <!-- 二级菜单 -->
            <el-menu-item v-for="subitem in item.children"
                          :index="'/' + subitem.path"
                          :key="subitem.id"
                          @click="saveNavState('/' + subitem.path)">
              <template #title>
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 描述 -->
                <span>{{subitem.authName}}</span>

              </template>
            </el-menu-item>

          </el-submenu>

        </el-menu>
      </el-aside>

      <!-- 主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menulist: [],
      iconsObj: {
        125: 'iconfont icon-yonghuguanli',
        103: 'iconfont icon-xiangqing',
        101: 'iconfont icon-jiaoyiguanli',
        102: 'iconfont icon-xiangmuguanli',
        145: 'iconfont icon-shujufenxi'
      },
      // 菜单是否关闭
      isCollapse: false,
      // 当前被激活的链接地址
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // --------------事件--------------------
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },

    // -------------请求--------------------
    // 获取左侧的菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$Message.error('获取数据失败!')
      this.menulist = res.data
      // console.log(res)
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 18px;
  > div {
    display: flex;
    align-items: center;
    img {
      width: 100px;
      height: auto;
      margin-right: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  transition: width 0.5s;
  .toggle-button {
    width: 100%;
    height: 30px;
    color: #fff;
    background-color: #4a5064;
    text-align: center;
    line-height: 30px;
    font-size: 13px;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
  .el-menu {
    border-right: 0;
    .iconfont {
      margin-right: 5px;
    }
  }
}

.el-main {
  background-color: #eaedf1;
}
</style>
