<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--侧边部门数据-->
      <el-col :xs="9" :sm="6" :md="4" :lg="4" :xl="4">
        <div class="head-container">
          <el-input
            v-model="deptName"
            clearable
            size="small"
            placeholder="输入部门名称搜索"
            prefix-icon="el-icon-search"
            class="filter-item"
            @input="getDeptDatas"
          />
        </div>
        <el-tree
          :data="deptDatas"
          :props="defaultProps"
          :expand-on-click-node="false"
          default-expand-all
          @node-click="handleNodeClick"
        />
      </el-col>
      <!--用户数据-->
      <el-col :xs="15" :sm="18" :md="20" :lg="20" :xl="20">
        <div class="app-container">
          <!--工具栏-->
          <div class="head-container">
            <div v-if="crud.props.searchToggle">
              <!-- 搜索 -->
              <el-input v-model="query.value" clearable placeholder="输入搜索内容" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
              <el-select v-model="query.type" clearable placeholder="类型" class="filter-item" style="width: 130px">
                <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
              </el-select>
              <rrOperation :crud="crud" />
            </div>
            <crudOperation :permission="permission" />
            <!--表格渲染-->
            <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
              <el-table-column type="selection" width="55" />
              <el-table-column v-if="columns.visible('orderSn')" prop="orderSn" label="订单编号" />
              <el-table-column v-if="columns.visible('createTime')" prop="createTime" label="提交时间">
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column v-if="columns.visible('memberUsername')" prop="memberUsername" label="用户帐号" />
              <el-table-column v-if="columns.visible('totalAmount')" prop="totalAmount" label="订单总金额" />
              <el-table-column v-if="columns.visible('payType')" prop="payType" label="支付方式" />
              <el-table-column v-if="columns.visible('status')" prop="status" label="订单状态" />
              <el-table-column v-if="columns.visible('merchantId')" prop="merchantId" label="所属商家" />
              <el-table-column v-permission="['admin','orderMain:edit','orderMain:del']" label="操作" width="150px" align="center">
                <template slot-scope="scope">
                  <udOperation
                    :data="scope.row"
                    :permission="permission"
                  />
                </template>
              </el-table-column>
            </el-table>
            <!--分页组件-->
            <pagination />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>

</template>

<script>
import crudOrderMain from '@/api/orderMain'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import { getDepts } from '@/api/system/dept'

// crud交由presenter持有
const defaultCrud = CRUD({ title: '订单管理', url: 'api/orderMain', sort: 'id,desc', crudMethod: { ...crudOrderMain }})
const defaultForm = { orderSn: null, createTime: null, memberUsername: null, totalAmount: null, payAmount: null, freightAmount: null, payType: null, status: null, deliveryCompany: null, deliverySn: null, receiverName: null, receiverPhone: null, receiverPostCode: null, receiverProvince: null, receiverCity: null, receiverRegion: null, receiverDetailAddress: null, note: null, confirmStatus: null, deleteStatus: null, paymentTime: null, deliveryTime: null, receiveTime: null, modifyTime: null, merchantId: null, id: null }
export default {
  name: 'OrderMain',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  data() {
    return {
      permission: {
        add: ['admin', 'orderMain:add'],
        edit: ['admin', 'orderMain:edit'],
        del: ['admin', 'orderMain:del']
      },
      queryTypeOptions: [
        { key: 'orderSn', display_name: '订单编号' }
      ]
    }
  },
  created() {
    this.$nextTick(() => {
      this.getDeptDatas()
    })
  },
  methods: {
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      const query = this.query
      if (query.type && query.value) {
        this.crud.params[query.type] = query.value
      }
      return true
    },
    // 获取左侧部门数据
    getDeptDatas() {
      const sort = 'id,desc'
      const params = { sort: sort }
      if (this.deptName) { params['name'] = this.deptName }
      getDepts(params).then(res => {
        this.deptDatas = res.content
      })
    },
    // 切换部门
    handleNodeClick(data) {
      if (data.pid === 0) {
        this.query.deptId = null
      } else {
        this.query.deptId = data.id
      }
      this.crud.toQuery()
    }
  }
}
</script>

<style scoped>

</style>