<template>
  <div>
<!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 2.准备好具备宽高的dom元素 -->
      <div id="main" style="width:800px; height:500px"></div>
    </el-card>
  </div>

</template>

<script>
// 1.导入echarts
import echarts from 'echarts'

export default {
  data () {
    return {

    }
  },
  created () {
  },
  // 页面渲染完毕后调用此回调
  async mounted () {
    // 3.基于准备好的dom,初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))

    // 4.准备配置和数据项
    var option = {
      title: {
        text: 'ECharts 入门示例'
      },
      tooltip: {},
      legend: {
        data: ['销量']
      },
      xAxis: {
        data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
      },
      yAxis: {},
      series: [{
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
      }]
    }

    // 5.使用刚指定的配置项和数据显示图表。
    myChart.setOption(option)
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>

</style>
