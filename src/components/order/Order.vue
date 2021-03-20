<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query"
                    clearable>

            <el-button slot="append"
                       icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单数据列表 -->
      <el-table :data="orderList"
                border
                stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号"
                         prop="order_number"></el-table-column>
        <el-table-column label="订单价格"
                         prop="order_price"></el-table-column>
        <el-table-column label="是否付款"
                         prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success"
                    v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger"
                    v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货"
                         prop="is_send"></el-table-column>
        <el-table-column label="下单时间"
                         prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}

          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="primary"
                       icon="el-icon-edit"
                       @click="showEditDialog(scope.row)"></el-button>
            <el-button size="mini"
                       type="success"
                       icon="el-icon-location"
                       @click="showProgressDialog"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[5, 10, 15, 20]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total"
                     background>
      </el-pagination>
    </el-card>

    <!-- 修改地址的对话框 -->
    <el-dialog title="修改地址"
               :visible.sync="addressDialogVisible"
               width="50%"
               @close="addressDialogClose">
      <!-- 表单 -->
      <el-form :model="addressForm"
               :rules="addressFormRules"
               ref="addressFormRef"
               label-width="100px">
        <el-form-item label="省市区/县"
                      prop="address1">
          <el-cascader v-model="addressForm.address1"
                       :options="cityData"
                       :props="{ expandTrigger: 'hover' }"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址"
                      prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog title="物流进度"
               :visible.sync="progressDialogVisible"
               width="50%"
               @close="progressDialogClose">
      <!-- 物流时间线 -->
      <el-timeline :reverse="false">
        <el-timeline-item v-for="(item, index) in progressInfo"
                          :key="index"
                          :timestamp="item.time">
          {{item.context}}
        </el-timeline-item>
      </el-timeline>

      <span slot="footer"
            class="dialog-footer">
        <el-button @click="progressDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="progressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from '../../assets/citydata'

export default {
  data () {
    return {
      // 查询订单列表数据对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 请求订单数据列表的总条数
      total: 0,
      // 请求到的订单列表数据
      orderList: [],
      // 控制修改地址对话框显示隐藏
      addressDialogVisible: false,
      // 修改地址对话框表单数据对象
      addressForm: {
        address1: [],
        address2: ''
      },
      // 修改地址对话框表单验证规则对象
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 城市数据脚本
      cityData,
      // 控制物流进度对话框显示隐藏
      progressDialogVisible: false,
      // 物流进度信息
      progressInfo: [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context:
            '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context:
            '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('请求订单列表失败!')
      }

      this.$message.success('请求订单列表成功!')
      console.log(res.data)
      this.total = res.data.total
      this.orderList = res.data.goods
    },

    // 监听页面显示列表的大小改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },

    // 监听页面当前页码的改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },

    // 显示修改地址对话框
    showEditDialog (row) {
      this.addressDialogVisible = true
    },

    // 监听修改地址对话框的关闭事件
    addressDialogClose () {
      this.$refs.addressFormRef.resetFields()
    },

    // 显示物流进度对话框
    showProgressDialog () {
    //   const { data: res } = await this.$http.get('/kuaidi/1106975712662')
    //   console.log(res)
    //   if (res.meta.status !== 200) {
    //     return this.$message.error('获取物流进度失败!')
    //   }

      //   this.progressInfo = res.data
      //   console.log(this.progressInfo)
      this.progressDialogVisible = true
    },

    // 监听展示物流对话框的关闭事件
    progressDialogClose () {}
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
