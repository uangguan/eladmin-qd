<template>
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
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="订单编号" prop="orderSn">
            <el-input v-model="form.orderSn" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="提交时间" prop="createTime">
            <el-input v-model="form.createTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="用户帐号" prop="memberUsername">
            <el-input v-model="form.memberUsername" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="订单总金额" prop="totalAmount">
            <el-input v-model="form.totalAmount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="应付金额" prop="payAmount">
            <el-input v-model="form.payAmount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="运费金额">
            <el-input v-model="form.freightAmount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="支付方式" prop="payType">
            <el-input v-model="form.payType" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="订单状态" prop="status">
            <el-input v-model="form.status" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="物流公司">
            <el-input v-model="form.deliveryCompany" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="物流单号">
            <el-input v-model="form.deliverySn" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="收货人姓名">
            <el-input v-model="form.receiverName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="收货人电话">
            <el-input v-model="form.receiverPhone" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="收货人邮编">
            <el-input v-model="form.receiverPostCode" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="省份/直辖市">
            <el-input v-model="form.receiverProvince" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="城市">
            <el-input v-model="form.receiverCity" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="区">
            <el-input v-model="form.receiverRegion" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="详细地址">
            <el-input v-model="form.receiverDetailAddress" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="订单备注">
            <el-input v-model="form.note" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="确认收货状态" prop="confirmStatus">
            <el-input v-model="form.confirmStatus" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="删除状态" prop="deleteStatus">
            <el-input v-model="form.deleteStatus" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="支付时间">
            <el-input v-model="form.paymentTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="发货时间">
            <el-input v-model="form.deliveryTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="确认收货时间">
            <el-input v-model="form.receiveTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="修改时间">
            <el-input v-model="form.modifyTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="所属商家" prop="merchantId">
            <el-input v-model="form.merchantId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="订单id">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
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
        <el-table-column v-if="columns.visible('payAmount')" prop="payAmount" label="应付金额" />
        <el-table-column v-if="columns.visible('freightAmount')" prop="freightAmount" label="运费金额" />
        <el-table-column v-if="columns.visible('payType')" prop="payType" label="支付方式" />
        <el-table-column v-if="columns.visible('status')" prop="status" label="订单状态" />
        <el-table-column v-if="columns.visible('deliveryCompany')" prop="deliveryCompany" label="物流公司" />
        <el-table-column v-if="columns.visible('deliverySn')" prop="deliverySn" label="物流单号" />
        <el-table-column v-if="columns.visible('receiverName')" prop="receiverName" label="收货人姓名" />
        <el-table-column v-if="columns.visible('receiverPhone')" prop="receiverPhone" label="收货人电话" />
        <el-table-column v-if="columns.visible('receiverPostCode')" prop="receiverPostCode" label="收货人邮编" />
        <el-table-column v-if="columns.visible('receiverProvince')" prop="receiverProvince" label="省份/直辖市" />
        <el-table-column v-if="columns.visible('receiverCity')" prop="receiverCity" label="城市" />
        <el-table-column v-if="columns.visible('receiverRegion')" prop="receiverRegion" label="区" />
        <el-table-column v-if="columns.visible('receiverDetailAddress')" prop="receiverDetailAddress" label="详细地址" />
        <el-table-column v-if="columns.visible('note')" prop="note" label="订单备注" />
        <el-table-column v-if="columns.visible('confirmStatus')" prop="confirmStatus" label="确认收货状态" />
        <el-table-column v-if="columns.visible('deleteStatus')" prop="deleteStatus" label="删除状态" />
        <el-table-column v-if="columns.visible('paymentTime')" prop="paymentTime" label="支付时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.paymentTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('deliveryTime')" prop="deliveryTime" label="发货时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.deliveryTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('receiveTime')" prop="receiveTime" label="确认收货时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.receiveTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('modifyTime')" prop="modifyTime" label="修改时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.modifyTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('merchantId')" prop="merchantId" label="所属商家" />
        <el-table-column v-if="columns.visible('id')" prop="id" label="订单id" />
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
</template>

<script>
import crudOrderMain from '@/api/orderMain'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

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
      rules: {
        orderSn: [
          { required: true, message: '订单编号不能为空', trigger: 'blur' }
        ],
        createTime: [
          { required: true, message: '提交时间不能为空', trigger: 'blur' }
        ],
        memberUsername: [
          { required: true, message: '用户帐号不能为空', trigger: 'blur' }
        ],
        totalAmount: [
          { required: true, message: '订单总金额不能为空', trigger: 'blur' }
        ],
        payAmount: [
          { required: true, message: '应付金额不能为空', trigger: 'blur' }
        ],
        payType: [
          { required: true, message: '支付方式不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '订单状态不能为空', trigger: 'blur' }
        ],
        confirmStatus: [
          { required: true, message: '确认收货状态不能为空', trigger: 'blur' }
        ],
        deleteStatus: [
          { required: true, message: '删除状态不能为空', trigger: 'blur' }
        ],
        merchantId: [
          { required: true, message: '所属商家不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'orderSn', display_name: '订单编号' },
        { key: 'merchantId', display_name: '所属商家' }
      ]
    }
  },
  methods: {
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      const query = this.query
      if (query.type && query.value) {
        this.crud.params[query.type] = query.value
      }
      return true
    }
  }
}
</script>

<style scoped>

</style>
