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
          <el-form-item label="id">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="订单编号" prop="orderSn">
            <el-input v-model="form.orderSn" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="商品id" prop="productId">
            <el-input v-model="form.productId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="商品名称" prop="productName">
            <el-input v-model="form.productName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="销售价格" prop="productPrice">
            <el-input v-model="form.productPrice" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="购买数量" prop="productQuantity">
            <el-input v-model="form.productQuantity" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="商品分类id" prop="productCategoryId">
            <el-input v-model="form.productCategoryId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="商品分类名称" prop="productCategoryName">
            <el-input v-model="form.productCategoryName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="所属商家" prop="merchantId">
            <el-input v-model="form.merchantId" style="width: 370px;" />
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
        <el-table-column v-if="columns.visible('id')" prop="id" label="id" />
        <el-table-column v-if="columns.visible('orderSn')" prop="orderSn" label="订单编号" />
        <el-table-column v-if="columns.visible('productId')" prop="productId" label="商品id" />
        <el-table-column v-if="columns.visible('productName')" prop="productName" label="商品名称" />
        <el-table-column v-if="columns.visible('productPrice')" prop="productPrice" label="销售价格" />
        <el-table-column v-if="columns.visible('productQuantity')" prop="productQuantity" label="购买数量" />
        <el-table-column v-if="columns.visible('productCategoryId')" prop="productCategoryId" label="商品分类id" />
        <el-table-column v-if="columns.visible('productCategoryName')" prop="productCategoryName" label="商品分类名称" />
        <el-table-column v-if="columns.visible('merchantId')" prop="merchantId" label="所属商家" />
        <el-table-column v-permission="['admin','orderItem:edit','orderItem:del']" label="操作" width="150px" align="center">
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
import crudOrderItem from '@/api/orderItem'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

// crud交由presenter持有
const defaultCrud = CRUD({ title: '订单明细', url: 'api/orderItem', sort: 'id,desc', crudMethod: { ...crudOrderItem }})
const defaultForm = { id: null, orderSn: null, productId: null, productName: null, productPrice: null, productQuantity: null, productCategoryId: null, productCategoryName: null, merchantId: null }
export default {
  name: 'OrderItem',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  data() {
    return {
      permission: {
        add: ['admin', 'orderItem:add'],
        edit: ['admin', 'orderItem:edit'],
        del: ['admin', 'orderItem:del']
      },
      rules: {
        orderSn: [
          { required: true, message: '订单编号不能为空', trigger: 'blur' }
        ],
        productId: [
          { required: true, message: '商品id不能为空', trigger: 'blur' }
        ],
        productName: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        productPrice: [
          { required: true, message: '销售价格不能为空', trigger: 'blur' }
        ],
        productQuantity: [
          { required: true, message: '购买数量不能为空', trigger: 'blur' }
        ],
        productCategoryId: [
          { required: true, message: '商品分类id不能为空', trigger: 'blur' }
        ],
        productCategoryName: [
          { required: true, message: '商品分类名称不能为空', trigger: 'blur' }
        ],
        merchantId: [
          { required: true, message: '所属商家不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'orderSn', display_name: '订单编号' }
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
