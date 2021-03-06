import request from '@/utils/request'

export function getCatagorys(params) {
  return request({
    url: 'api/productCatagory/tree',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/productCatagory',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/productCatagory/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/productCatagory',
    method: 'put',
    data
  })
}

export default { add, edit, del, getCatagorys }
