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
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="商品描述">
            <el-input v-model="form.describe" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="商品规格">
            <el-input v-model="form.specification" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="所属分类" prop="categoryId">
            未设置字典，请手动设置 Select
          </el-form-item>
          <el-form-item label="库存" prop="count">
            <el-input v-model="form.count" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="原价" prop="originalPrice">
            <el-input v-model="form.originalPrice" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="活动价" prop="activityPrice">
            <el-input v-model="form.activityPrice" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="所属商家" prop="merchantId">
            未设置字典，请手动设置 Select
          </el-form-item>
          <el-form-item label="状态" prop="enabled">
            <el-radio v-for="item in dict.product_status" :key="item.id" v-model="form.enabled" :label="item.value">{{ item.label }}</el-radio>
          </el-form-item>
          <el-form-item label="创建日期">
            <el-input v-model="form.createTime" style="width: 370px;" />
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
        <el-table-column v-if="columns.visible('name')" prop="name" label="商品名称" />
        <el-table-column v-if="columns.visible('describe')" prop="describe" label="商品描述" />
        <el-table-column v-if="columns.visible('specification')" prop="specification" label="商品规格" />
        <el-table-column v-if="columns.visible('categoryId')" prop="categoryId" label="所属分类" />
        <el-table-column v-if="columns.visible('count')" prop="count" label="库存" />
        <el-table-column v-if="columns.visible('originalPrice')" prop="originalPrice" label="原价" />
        <el-table-column v-if="columns.visible('activityPrice')" prop="activityPrice" label="活动价" />
        <el-table-column v-if="columns.visible('merchantId')" prop="merchantId" label="所属商家" />
        <el-table-column v-if="columns.visible('enabled')" prop="enabled" label="状态">
          <template slot-scope="scope">
            {{ dict.label.product_status[scope.row.enabled] }}
          </template>
        </el-table-column>
        <el-table-column v-if="columns.visible('createTime')" prop="createTime" label="创建日期">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-permission="['admin','product:edit','product:del']" label="操作" width="150px" align="center">
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
import crudProduct from '@/api/product/product'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

// crud交由presenter持有
const defaultCrud = CRUD({ title: '商品管理', url: 'api/product', sort: 'id,desc', crudMethod: { ...crudProduct }})
const defaultForm = { id: null, name: null, describe: null, specification: null, categoryId: null, count: null, originalPrice: null, activityPrice: null, merchantId: null, enabled: null, createTime: null }
export default {
  name: 'Product',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  dicts: ['product_status'],
  data() {
    return {
      permission: {
        add: ['admin', 'product:add'],
        edit: ['admin', 'product:edit'],
        del: ['admin', 'product:del']
      },
      rules: {
        name: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '所属分类不能为空', trigger: 'blur' }
        ],
        count: [
          { required: true, message: '库存不能为空', trigger: 'blur' }
        ],
        originalPrice: [
          { required: true, message: '原价不能为空', trigger: 'blur' }
        ],
        activityPrice: [
          { required: true, message: '活动价不能为空', trigger: 'blur' }
        ],
        merchantId: [
          { required: true, message: '所属商家不能为空', trigger: 'blur' }
        ],
        enabled: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'id', display_name: 'ID' },
        { key: 'name', display_name: '商品名称' },
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
