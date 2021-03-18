<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索行 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">

            <el-button slot="append"
                       icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表表格 -->
      <el-table :data="goodsList"
                border
                stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称"
                         prop="goods_name"></el-table-column>
        <el-table-column width="95px"
                         label="商品价格(元)"
                         prop="goods_price"></el-table-column>
        <el-table-column width="70px"
                         label="商品重量"
                         prop="goods_weight"></el-table-column>
        <el-table-column width="150px"
                         label="创建时间">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column width="130px"
                         label="操作">
          <template slot-scope="">
            <el-button size="mini"
                       type="primary"
                       icon="el-icon-edit"></el-button>
            <el-button size="mini"
                       type="danger"
                       icon="el-icon-delete"></el-button>
          </template>
        </el-table-column>

      </el-table>

      <!-- 页码 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[5, 10, 20, 30]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total"
                     background>
      </el-pagination>
    </el-card>

  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 保存请求到的商品列表
      goodsList: [],
      // 总数据条数
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) { return this.$Message.error('获取商品列表失败！') }

      this.$Message.success('获取商品列表成功！')
      // console.log(res.data)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },

    // 改变页面显示大小触发事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },

    // 改变当前页码触发事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },

    // 跳转至添加商品的页面
    goAddPage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
