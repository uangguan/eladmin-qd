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
              <el-form-item label="分类名称" prop="name">
                <el-input v-model="form.name" style="width: 370px;" />
              </el-form-item>
              <el-form-item v-if="form.pid !== 0" label="上级分类" prop="pid">
                <treeselect
                  v-model="form.pid"
                  :options="catagorys"
                  style="width: 370px"
                  placeholder="选择上级类目"
                />
              </el-form-item>
              <el-form-item label="状态" prop="enabled">
                <el-radio v-for="item in dict.product_catagory_status" :key="item.id" v-model="form.enabled" :label="item.value">{{ item.label }}</el-radio>
              </el-form-item>
              <el-form-item label="所属商家" prop="dept.id">
                <treeselect
                  v-model="form.dept.id"
                  :options="depts"
                  style="width: 370px"
                  placeholder="选择所属商家"
                />
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="text" @click="crud.cancelCU">取消</el-button>
              <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
            </div>
          </el-dialog>
          <!--表格渲染-->
          <el-table ref="table" v-loading="crud.loading" :tree-props="{children: 'children', hasChildren: 'hasChildren'}" default-expand-all :data="crud.data" row-key="id" @select="crud.selectChange" @select-all="crud.selectAllChange" @selection-change="crud.selectionChangeHandler">
            <el-table-column :selectable="checkboxT" type="selection" width="55" />
            <el-table-column v-if="columns.visible('name')" prop="name" label="分类名称" />
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
            <el-table-column v-if="columns.visible('dept.name')" prop="dept.name" label="所属商家" />
            <el-table-column v-permission="['admin','productCatagory:edit','productCatagory:del']" label="操作" width="150px" align="center">
              <template slot-scope="scope">
                <udOperation
                  :data="scope.row"
                  :permission="permission"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import crudProductCatagory from '@/api/productCatagory'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import { getDepts } from '@/api/system/dept'
import Treeselect from '@riophae/vue-treeselect'
import { getCatagorys } from '@/api/productCatagory'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
// crud交由presenter持有
const defaultCrud = CRUD({ title: '商品分类', url: 'api/productCatagory/tree', sort: 'id,desc', crudMethod: { ...crudProductCatagory }})
const defaultForm = { id: null,
  name: null,
  pid: null,
  enabled: 'true',
  createTime: null,
  dept: {
    id: 1
  }
}
export default {
  name: 'ProductCatagory',
  components: { Treeselect, crudOperation, rrOperation, udOperation },
  mixins: [presenter(defaultCrud), header(), form(defaultForm), crud()],
  dicts: ['product_catagory_status'],
  data() {
    return {
      deptName: '', depts: [], deptDatas: [], catagorys: [],
      defaultProps: { children: 'children', label: 'name' },
      permission: {
        add: ['admin', 'productCatagory:add'],
        edit: ['admin', 'productCatagory:edit'],
        del: ['admin', 'productCatagory:del']
      },
      rules: {
        name: [
          { required: true, message: '分类名称不能为空', trigger: 'blur' }
        ],
        pid: [
          { required: true, message: '上级分类不能为空', trigger: 'blur' }
        ],
        enabled: [
          { required: true, message: '状态不能为空', trigger: 'blur' }
        ],
        merchantId: [
          { required: true, message: '所属商家不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'id', display_name: 'ID' },
        { key: 'name', display_name: '分类名称' },
        { key: 'pid', display_name: '上级分类' },
        { key: 'enabled', display_name: '状态' }
      ]
    }
  },
  created() {
    this.$nextTick(() => {
      this.getDeptDatas()
      // this.crud.toQuery()
      // this.crud.msg.add = '新增成功，默认密码：123456'
    })
  },
  mounted: function() {
    const that = this
    window.onresize = function temp() {
      that.height = document.documentElement.clientHeight - 180 + 'px;'
    }
  },
  methods: {
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
    },
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      const query = this.query
      if (query.type && query.value) {
        this.crud.params[query.type] = query.value
      }
      return true
    },
    checkboxT(row, rowIndex) {
      return row.id !== 1
    }
  }
}
</script>

<style scoped>

</style>
