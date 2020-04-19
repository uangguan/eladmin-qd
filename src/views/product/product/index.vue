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
                <el-input v-model="form.describe" :rows="3" type="textarea" style="width: 370px;" />
              </el-form-item>
              <el-form-item label="商品规格">
                <el-input v-model="form.specification" :rows="3" type="textarea" style="width: 370px;" />
              </el-form-item>
              <el-form-item label="所属分类" prop="productCatagory.id">
                <treeselect
                  v-model="form.productCatagory.id"
                  :options="catagorys"
                  style="width: 370px"
                  placeholder="选择所属分类"
                />
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
              <el-form-item label="所属商家" prop="dept.id">
                <treeselect
                  v-model="form.dept.id"
                  :options="depts"
                  style="width: 370px"
                  placeholder="选择所属商家"
                />
              </el-form-item>
              <el-form-item label="状态" prop="enabled">
                <el-radio v-for="item in dict.product_status" :key="item.id" v-model="form.enabled" :label="item.value">{{ item.label }}</el-radio>
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
            <el-table-column v-if="columns.visible('id')" prop="id" label="ID" />
            <el-table-column v-if="columns.visible('name')" prop="name" label="商品名称" />
            <el-table-column v-if="columns.visible('describe')" prop="describe" label="商品描述" />
            <el-table-column v-if="columns.visible('specification')" prop="specification" label="商品规格" />
            <el-table-column v-if="columns.visible('productCatagory.name')" prop="productCatagory.name" label="所属分类" />
            <el-table-column v-if="columns.visible('count')" prop="count" label="库存" />
            <el-table-column v-if="columns.visible('originalPrice')" prop="originalPrice" label="原价" />
            <el-table-column v-if="columns.visible('activityPrice')" prop="activityPrice" label="活动价" />
            <el-table-column v-if="columns.visible('dept.name')" prop="dept.name" label="所属商家" />
            <el-table-column v-if="columns.visible('enabled')" label="状态" align="center" prop="enabled">
              <template slot-scope="scope">
                <el-switch
                  v-model="scope.row.enabled"
                  :disabled="scope.row.id === 1"
                  active-color="#409EFF"
                  inactive-color="#F56C6C"
                  @change="changeEnabled(scope.row, scope.row.enabled,)"
                />
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
      </el-col>
    </el-row>
  </div>
</template>

<script>
import crudProduct from '@/api/product'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { getCatagorys } from '@/api/productCatagory'
import { getDepts } from '@/api/system/dept'

// crud交由presenter持有
const defaultCrud = CRUD({ title: '商品管理', url: 'api/product', sort: 'id,desc', crudMethod: { ...crudProduct }})
const defaultForm = { id: null, name: null, describe: null, specification: null,
  productCatagory: { id: 1 }, count: null, originalPrice: null,
  activityPrice: null, dept: { id: 1 }, enabled: null, createTime: null
}
export default {
  name: 'Product',
  components: { Treeselect, pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  dicts: ['product_status'],
  data() {
    return {
      deptName: '', depts: [], deptDatas: [], catagorys: [],
      defaultProps: { children: 'children', label: 'name' },
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
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      this.getDepts()
      this.getCatagorys()
      // this.getRoleLevel()
      form.enabled = form.enabled.toString()
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
    // 获取弹窗内部门数据
    getDepts() {
      getDepts({ enabled: true }).then(res => {
        this.depts = res.content
      })
    },
    // 获取弹窗内分类数据
    getCatagorys() {
      getCatagorys({ enabled: true }).then(res => {
        this.catagorys = res.content
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
